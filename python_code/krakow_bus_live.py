import requests
import streamlit as st
from google.transit import gtfs_realtime_pb2
import folium
from streamlit_folium import st_folium

st.set_page_config(page_title="Kraków Public Transport Live Map", layout="wide")
st.title("🚌 Kraków Bus & Tram Live Tracker")

VEHICLE_POSITIONS_URL = "https://gtfs.ztp.krakow.pl/VehiclePositions.pb"
TRIP_UPDATES_URL = "https://gtfs.ztp.krakow.pl/TripUpdates.pb"


@st.cache_resource(ttl=60)
def fetch_feed(url: str) -> gtfs_realtime_pb2.FeedMessage:
    """
    Fetch and parse a GTFS Realtime protobuf feed.

    Args:
        url (str): URL of the GTFS Realtime feed.

    Returns:
        gtfs_realtime_pb2.FeedMessage: Parsed GTFS feed message.
    """
    feed = gtfs_realtime_pb2.FeedMessage()
    r = requests.get(url, timeout=10, verify=False)
    r.raise_for_status()
    feed.ParseFromString(r.content)
    return feed


def get_trip_delays() -> dict[str, int | None]:
    """
    Extract delays for trips from the TripUpdates feed.

    Returns:
        dict: Mapping from trip_id to delay in seconds.
    """
    trip_data = {}
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


def load_vehicle_data() -> list[dict]:
    """
    Load vehicle positions and associate them with trip delays.

    Returns:
        list: List of dictionaries containing vehicle info (id, position, delay, route).
    """
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


def delay_color(delay: int | None) -> str:
    """
    Determine marker color based on delay.

    Args:
        delay (int | None): Delay in seconds.

    Returns:
        str: Color name for the map marker.
    """
    if delay is None:
        return "gray"
    if delay > 120:
        return "red"
    if delay < -60:
        return "blue"
    return "green"


def main():
    """
    Main function to render the Kraków public transport live map.
    """
    vehicles = load_vehicle_data()

    # Center map roughly on Kraków
    m = folium.Map(location=[50.0647, 19.945], zoom_start=12)

    # Add markers
    for v in vehicles:
        color = delay_color(v["delay"])
        folium.CircleMarker(
            location=[v["lat"], v["lon"]],
            radius=5,
            color=color,
            fill=True,
            fill_opacity=0.8,
            popup=f"Bus {v['id']}<br>Route {v['route']}<br>Delay: {v['delay']} sec"
        ).add_to(m)

    st_folium(m, width=1000, height=700)
    st.caption("Data: Zarząd Transportu Publicznego w Krakowie (GTFS Realtime)")


if __name__ == "__main__":
    main()
