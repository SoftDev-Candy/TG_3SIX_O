<h1 align="center">TG_3SIXO / Journey Radar</h1>

<p align="center">
  <strong>Predictive Transport Intelligence System</strong><br/>
  Real-time disruption monitoring + routing + lightweight forecasting which is built around a <strong>C++17</strong> core.
</p>

<p align="center">
  <!-- Optional badges (edit as you like) -->
  <img alt="C++" src="https://img.shields.io/badge/C%2B%2B-17-blue" />
  <img alt="Build" src="https://img.shields.io/badge/build-CMake-success" />
  <img alt="Backend" src="https://img.shields.io/badge/backend-cpp--httplib%20%2B%20FastAPI-informational" />
  <img alt="Frontend" src="https://img.shields.io/badge/frontend-Vanilla%20JS%20%2B%20Leaflet-orange" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-lightgrey" />
</p>

<p align="center">
  <a href="#-demos">Demos</a> •
  <a href="#-why-this-exists">Why</a> •
  <a href="#-system-overview">System Overview</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-services--modules">Modules</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## What is TG_3SIXO?

**TG_3SIXO (Journey Radar / Travel Guardian 360)** is a real-time transport platform that combines:
- **official live transit feeds** (GTFS Realtime),
- **community + dispatcher reports**, and
- a **C++17 routing + prediction engine**

…to **forecast delays**, **recompute routes** under incidents, and **push proactive alerts** to a live map UI.

It’s designed as a hackathon-style proof-of-concept that is **fast, debuggable, and modular** (C++ performance core + Python sidecars).

---

## ✨ Key Highlights

| Module | Purpose |
|---|---|
| 🧭 **Routing Engine (C++)** | Graph shortest-path routing (Dijkstra) with incident-aware live weight updates |
| ⚙️ **TransitDNA Predictor** | Lightweight forecasting from rolling disruption history (predict “likely +X min”) |
| 👥 **Persona Journeys** | Simulated commuter profiles (e.g., “Sarah”) for personalized delay impact |
| 🕒 **Calendar Conflict Detection** | Detect ETA clashes with user events from `.ics` calendar files |
| 🛰️ **GTFS Live Sidecar (Python)** | Fetches/normalizes live vehicle + trip updates and feeds the C++ backend |
| 🔄 **SSE Streaming** | Server-Sent Events push ETAs, incidents, and predictions to the frontend live |
| 🧰 **User Reports + Dispatcher API (Python)** | REST endpoints for crowdsourced incidents + verified operator input |
| 🎯 **Proactive Alerts** | “⚠ Likely +12 min delay” warnings before the delay is visible in typical apps |

---

## 📹 Demos

**Website (demos hub)**  
- https://tg3sixo.surge.sh/#demos

- **Full System Demo (video)** 
## 🎥 Full Demo

▶ **[Watch on GitHub](https://github.com/SoftDev-Candy/TG_3SIX_O/blob/main/docs/TG_3IXO.mp4)**

</div>
       

**Krakow live bus map (video)**  

<p align="center">
  <img width="820" alt="KrakowBusmap"
       src="https://raw.githubusercontent.com/SoftDev-Candy/TG_3SIX_O/main/docs/realtime1.png" />
</p>




---

## 🧱 Architecture (Preview)

<p align="center">
  <img width="820" alt="Architecture Overview"
       src="https://raw.githubusercontent.com/SoftDev-Candy/TG_3SIX_O/main/docs/Architecture-min.png" />
</p>

- Full doc: `docs/Architecture.md` (TODO: update path/name if different)
- Diagram: `docs/Architecture-min.png`

---

## ❓ Why this exists

Most popular transit apps are **reactive**: they show delays *after* they happen and often can’t merge operator + community context.

Journey Radar aims to be **predictive and explainable**:
- predict delay likelihood from recent patterns,
- recompute routes instantly as incidents arrive,
- stream changes live to the UI,
- optionally simulate “personas” + calendar conflicts.

---

## ⚙️ System Overview

1) **Live data + reports** stream into the backend  
2) **TransitDNA** updates a rolling model of recent disruption severity  
3) **Routing Engine** recomputes shortest path with incident-adjusted weights  
4) **Frontend dashboard (Leaflet)** shows:
   - baseline vs adjusted route
   - ETA and delay
   - proactive warnings
5) **Personas + calendar** flag real-world impact:
   - “⚠ Meeting at 09:00 may conflict with ETA 09:10”

---

## 🧠 Predictive Engine (TransitDNA)

TransitDNA is intentionally lightweight and hackathon-friendly:
- rolling averages
- node/segment severity scores
- “recent history” heuristics for probability + delay windows

Example output:
- **96% chance of +12 min delay at Stop 4**

Optional experiment:
- time-series model integration via Python (e.g., Amazon Chronos or similar)

> Note: This is not a full ML product — it’s a proof-of-concept prediction layer designed to evolve.

---

## 💾 Tech Stack

| Layer | Technology |
|---|---|
| Core backend | **C++17**, cpp-httplib, nlohmann::json |
| Concurrency | std::thread, mutex, condition_variable |
| Prediction | TransitDNA heuristic engine (optional Python model integration) |
| APIs | REST + SSE, FastAPI sidecars |
| Frontend | Vanilla JS + Leaflet |
| Data | GTFS Realtime, `.ics` calendar files, user/dispatcher reports |
| Planned DB | SQLite → PostgreSQL/Timescale (roadmap) |

---

## 🚀 Quickstart

### 1) Build & run backend (C++)

```bash
mkdir build
cd build
cmake ..
cmake --build .
./journey_radar
```

**Server default:**  
- http://localhost:8080

> If you’re on **Windows**, use your usual CMake generator (**MSVC/MinGW**). The commands still apply via **CLion** or terminal.

### 2) Run frontend
Open:
- `frontend/index.html`

The frontend connects to the backend via **SSE** (port `8080`).

### 3) Run Python services (sidecars)

#### a) GTFS sidecar
```
cd python_code
uvicorn gtfs_sidecar:app --port 9999
b) User reports / dispatcher API
bash
Copy code
cd python_code/UserAPI
python main.py
```

## 🧩 Services & Modules
C++ Core (Performance-Critical)
Route graph + Dijkstra
Incident-weight adjustment
SSE event stream
Prediction integration (TransitDNA outputs)
Python Sidecars (Replaceable / Iteration-Friendly)
GTFS-RT ingestion & normalization
Incident report endpoints
Experimentation hooks for model pipelines

## 🆚 How it compares to “reactive” apps
Problem in typical systems	Journey Radar approach
Delays appear after they happen	Forecast likely delays from recent patterns
Data silos (operator vs user)	Merge GTFS + crowdsourced + dispatcher inputs
No personalization	Persona journeys simulate real commuter impact
Limited integration surfaces	REST + SSE built for dashboards + operator workflows

## 🧑‍💻 Team & Credits
Lead Developer: Swastik — C++ Systems Engineer & Product Architect

Collaborators

Data & AI integration — Marvellous

Frontend design — Swastik, Thofeeq

Traffic data visualization API — Kubo

Project management — Binh

🏁 Roadmap
 Persist prediction + incident history (SQLite → Postgres/Timescale)
 Improve forecasting pipeline (Chronos/Prophet experiments)
 Mobile app + push notifications
 Reward system / gamified user submissions
 Operator dashboard mode (dispatcher tooling)

🛡️ License
MIT License — free for educational and non-commercial use.
 
 
 ## Kraków Public Transport Live Map (Streamlit)
A standalone Streamlit app that shows live bus and tram positions using GTFS Realtime data.

# Features
Real-time tracking of buses/trams
Vehicle delay display
Color-coded markers:
Green: on time / minor delay
Red: delayed > 2 minutes
Blue: early > 1 minute
Gray: delay unavailable
Interactive map via Folium

```
python -m venv venv
# Linux/Mac:
source venv/bin/activate

# Windows:
# .\venv\Scripts\activate

pip install -r requirements.txt
python -m streamlit run ./python_code/krakow_bus_live/app.py

```
## Notes
SSL verification may be disabled due to certificate issues with the source endpoint.

Vehicle positions + trip updates are combined to compute delays.

Data refresh is cached (e.g., 60s) for performance
