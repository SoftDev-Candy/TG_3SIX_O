import math
import time
import requests
from typing import List, Dict, Any, Optional
from fastapi import FastAPI
from google.transit import gtfs_realtime_pb2

app = FastAPI(title="TG360 GTFS Sidecar")

VEHICLE_POSITIONS_URL = "https://gtfs.ztp.krakow.pl/VehiclePositions.pb"
TRIP_UPDATES_URL = "https://gtfs.ztp.krakow.pl/TripUpdates.pb"

def fetch_feed(url: str) -> gtfs_realtime_pb2.FeedMessage:
    feed = gtfs_realtime_pb2.FeedMessage()
    r = requests.get(url, timeout=10, verify=False)
    r.raise_for_status()
    feed.ParseFromString(r.content)
    return feed

def get_trip_delays() -> Dict[str, Optional[int]]:
    trip_data: Dict[str, Optional[int]] = {}
    trip_feed = fetch_feed(TRIP_UPDATES_URL)
    for entity in trip_feed.entity:
        if entity.HasField('trip_update'):
            trip = entity.trip_update.trip
            delay = None
            if entity.trip_update.stop_time_update:
                stu = entity.trip_update.stop_time_update[0]
                if stu.HasField('arrival') and stu.arrival.HasField('delay'):
                    delay = stu.arrival.delay
            trip_data[trip.trip_id] = delay
    return trip_data

def load_vehicle_data() -> List[Dict[str, Any]]:
    trip_delays = get_trip_delays()
    vehicle_feed = fetch_feed(VEHICLE_POSITIONS_URL)
    vehicles: List[Dict[str, Any]] = []
    for entity in vehicle_feed.entity:
        if entity.HasField('vehicle'):
            v = entity.vehicle
            trip_id = v.trip.trip_id
            delay = trip_delays.get(trip_id)
            vehicles.append({
                "id": v.vehicle.id,
                "lat": v.position.latitude,
                "lon": v.position.longitude,
                "delay": delay,
                "route": v.trip.route_id,
                "trip_id": trip_id
            })
    return vehicles

# --- DEMO nodes: **match your frontend (10 nodes)** ---
DEMO_NODES = [
    [50.0741, 20.0042],
    [50.0706, 20.0048],
    [50.0673, 20.0046],
    [50.0644, 19.9894],
    [50.0676, 19.9888],
    [50.0676, 19.9903],
    [50.0732, 19.9860],
    [50.0714, 19.9835],
    [50.0697, 19.9866],
    [50.0685, 19.9884]
]

def haversine_km(a, b):
    R = 6371.0
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat, dlon = (lat2 - lat1), (lon2 - lon1)
    h = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    return 2*R*math.asin(math.sqrt(h))

def nearest_demo_node(lat: float, lon: float) -> int:
    best_i, best_d = 0, 1e9
    for i, (nlat, nlon) in enumerate(DEMO_NODES):
        d = haversine_km((lat, lon), (nlat, nlon))
        if d < best_d:
            best_d, best_i = d, i
    return best_i

def delay_to_severity(delay_sec: Optional[int]) -> int:
    # tune for demo: > 6 min -> major; > 2 min -> moderate; else minor
    if delay_sec is None:
        return 1
    if delay_sec >= 360:
        return 3
    if delay_sec >= 120:
        return 2
    return 1

@app.get("/health")
def health():
    return {"status": "ok", "ts": int(time.time())}

@app.get("/vehicles")
def vehicles():
    return {"vehicles": load_vehicle_data()}

@app.get("/trip-delays")
def trip_delays():
    return {"delays": get_trip_delays()}

@app.get("/demo-signals")
def demo_signals():
    """
    Aggregate live vehicle delays into simple node signals for the C++ server.
    Returns: { signals: [ { node, severity, predicted_extra_minutes } ] }
    """
    vs = load_vehicle_data()
    buckets: Dict[int, List[int]] = {}
    for v in vs:
        node = nearest_demo_node(v["lat"], v["lon"])
        delay = v["delay"]
        if delay is not None:
            buckets.setdefault(node, []).append(delay)

    signals = []
    for node, arr in buckets.items():
        if not arr:
            continue
        avg_delay_sec = sum(arr) / len(arr)
        sev = delay_to_severity(int(avg_delay_sec))
        signals.append({
            "node": node,
            "severity": sev,
            "predicted_extra_minutes": round(avg_delay_sec / 60.0, 1)
        })
    return {"signals": signals}