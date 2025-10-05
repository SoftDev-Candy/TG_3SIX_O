import requests
from google.transit import gtfs_realtime_pb2
import streamlit as st

VEHICLE_POSITIONS_URL = "https://gtfs.ztp.krakow.pl/VehiclePositions.pb"
TRIP_UPDATES_URL = "https://gtfs.ztp.krakow.pl/TripUpdates.pb"
REFRESH_INTERVAL = 60  # seconds

@st.cache_resource(ttl=REFRESH_INTERVAL)
def fetch_feed(url: str) -> gtfs_realtime_pb2.FeedMessage:
    """Fetch GTFS Realtime feed."""
    feed = gtfs_realtime_pb2.FeedMessage()
    try:
        r = requests.get(url, timeout=10, verify=False)
        r.raise_for_status()
        feed.ParseFromString(r.content)
    except Exception as e:
        st.warning(f"Error fetching {url}: {e}")
    return feed

def get_trip_delays() -> dict[str, int | None]:
    """Return dict of trip_id -> delay in seconds."""
    trip_data = {}
    trip_feed = fetch_feed(TRIP_UPDATES_URL)
    for entity in trip_feed.entity:
        if entity.HasField('trip_update'):
            trip = entity.trip_update.trip
            delay = None
            if entity.trip_update.stop_time_update:
                for stu in entity.trip_update.stop_time_update:
                    if stu.HasField('arrival') and stu.arrival.HasField('delay'):
                        delay = stu.arrival.delay
                        break
            trip_data[trip.trip_id] = delay
    return trip_data

def load_vehicle_data() -> list[dict]:
    """Return a list of vehicles with id, position, delay, and route."""
    trip_delays = get_trip_delays()
    vehicle_feed = fetch_feed(VEHICLE_POSITIONS_URL)
    vehicles = []
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
                "route": v.trip.route_id
            })
    return vehicles
