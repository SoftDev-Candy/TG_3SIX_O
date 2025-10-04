import os

import folium
from utils import delay_color, format_delay

def add_vehicle_markers(m: folium.Map, vehicles: list[dict]):
    """Add vehicle markers to the map."""
    for v in vehicles:
        folium.CircleMarker(
            location=[v["lat"], v["lon"]],
            radius=5,
            color=delay_color(v["delay"]),
            fill=True,
            fill_opacity=0.8,
            popup=f"Bus/Tram {v['id']}<br>Route {v['route']}<br>Delay: {format_delay(v['delay'])}"
        ).add_to(m)

def add_legend(m: folium.Map, legend_file: str = "assets/legend.html"):
    file_path = os.path.join(os.path.dirname(__file__), legend_file)
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            legend_html = f.read()
        m.get_root().html.add_child(folium.Element(legend_html))
    except FileNotFoundError:
        print(f"Legend file not found: {file_path}")