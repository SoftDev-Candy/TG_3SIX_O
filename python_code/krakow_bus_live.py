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
    """Fetch and parse a GTFS Realtime protobuf feed."""
    feed = gtfs_realtime_pb2.FeedMessage()
    try:
        r = requests.get(url, timeout=10, verify=False)
        r.raise_for_status()
        feed.ParseFromString(r.content)
    except Exception as e:
        st.warning(f"Error fetching {url}: {e}")
    return feed

def get_trip_delays() -> dict[str, int | None]:
    """Extract delays for trips from the TripUpdates feed."""
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
    """Load vehicle positions and associate them with trip delays."""
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
    if delay is None:
        return "gray"
    if delay > 120:
        return "red"
    if delay < -60:
        return "blue"
    return "green"

def format_delay(delay: int | None) -> str:
    if delay is None:
        return "No info"
    minutes = round(delay / 60)
    sign = "+" if minutes > 0 else ""
    return f"{sign}{minutes} min"

def main():
    """Render the Kraków public transport live map."""

    # Manual refresh button
    st.sidebar.header("Options")
    st.sidebar.button("Refresh Map")
    st.sidebar.caption("Click to refresh. Data cached for 60 seconds.")

    vehicles = load_vehicle_data()

    # Sidebar: select single route or All
    st.sidebar.header("Select a Route")
    all_routes = sorted(set(v["route"] for v in vehicles))
    route_option = st.sidebar.selectbox(
        "Route to display",
        options=["All"] + all_routes,
        index=0  # default to "All"
    )

    # Filter vehicles
    if route_option != "All":
        vehicles = [v for v in vehicles if v["route"] == route_option]

    # Center map on Kraków
    m = folium.Map(location=[50.0647, 19.945], zoom_start=12)

    # Add vehicle markers
    for v in vehicles:
        color = delay_color(v["delay"])
        folium.CircleMarker(
            location=[v["lat"], v["lon"]],
            radius=5,
            color=color,
            fill=True,
            fill_opacity=0.8,
            popup=f"Bus/Tram {v['id']}<br>Route {v['route']}<br>Delay: {format_delay(v['delay'])}"
        ).add_to(m)

    # Add legend
    legend_html = """
    <div style="position: fixed; 
                bottom: 50px; left: 50px; width: 150px; height: 110px; 
                background-color: white; z-index:9999; font-size:14px;
                border:2px solid grey; border-radius:5px; padding: 10px;">
      <b>Delay Legend</b><br>
      <span style="color:green;">● On time / minor delay</span><br>
      <span style="color:red;">● > 2 min late</span><br>
      <span style="color:blue;">● Early > 1 min</span><br>
      <span style="color:gray;">● No info</span>
    </div>
    """
    m.get_root().html.add_child(folium.Element(legend_html))

    st_folium(m, width=1000, height=700)
    st.caption("Data: Zarząd Transportu Publicznego w Krakowie (GTFS Realtime)")

if __name__ == "__main__":
    main()
