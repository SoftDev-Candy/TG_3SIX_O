import streamlit as st
import folium
from streamlit_folium import st_folium
from data import load_vehicle_data, REFRESH_INTERVAL
from map_helpers import add_vehicle_markers, add_legend

st.set_page_config(page_title="Kraków Public Transport Live Map", layout="wide")
st.title("🚌 Kraków Bus & Tram Live Tracker")

# ----------------------------
# Auto-refresh
# ----------------------------
# Only use st_autorefresh if it exists in your Streamlit version
if hasattr(st, "autorefresh"):
    st.autorefresh(interval=REFRESH_INTERVAL * 1000, key="map_refresh")
else:
    st.info(f"Map refreshes every {REFRESH_INTERVAL} seconds")

def main():
    # Sidebar: manual refresh
    st.sidebar.header("Options")
    if st.sidebar.button("Refresh Map Now"):
        if hasattr(st, "experimental_rerun"):
            st.experimental_rerun()
        else:
            st.info("Please reload the page manually")

    st.sidebar.caption(f"Data cached for {REFRESH_INTERVAL} seconds")

    vehicles = load_vehicle_data()

    # Sidebar: select route
    st.sidebar.header("Select a Route")
    all_routes = sorted(set(v["route"] for v in vehicles))
    route_option = st.sidebar.selectbox("Route to display", ["All"] + all_routes, index=0)
    if route_option != "All":
        vehicles = [v for v in vehicles if v["route"] == route_option]

    # Map
    m = folium.Map(location=[50.0647, 19.945], zoom_start=12)
    add_vehicle_markers(m, vehicles)
    add_legend(m)

    st_folium(m, width=1000, height=700)
    st.caption("Data: Zarząd Transportu Publicznego w Krakowie (GTFS Realtime)")

if __name__ == "__main__":
    main()
