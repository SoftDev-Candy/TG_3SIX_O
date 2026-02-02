⚡ Elevator Pitch

Travel Guardian 360 is an intelligent public transit assistant that predicts, explains, and prevents commuter delays using live city data, behavioral profiles, and a predictive routing engine.
Unlike typical static maps, TG360 fuses real-time incident data, calendar awareness, and predictive analytics to proactively help commuters avoid disruption — before it happens.

🚀 High-Level System Architecture
Frontend (Leaflet + JS UI)
│
├── REST + SSE Bridge (http://localhost:8080)
│
└── Backend Core (C++17, cpp-httplib, nlohmann::json)
     │
     ├── Routing Engine (Dijkstra)
     ├── Incident Engine (Dynamic Graph Adjustments)
     ├── TransitDNA (Predictive Core)
     ├── Persona Engine (User Profiles + Behavior)
     ├── Calendar Engine (.ics Conflict Detection)
     └── SSE Event Stream (Live Push Updates)

Optional External Sidecars

Python GTFS Sidecar (FastAPI) – connects to live city GTFS feeds and maps real bus/tram delays into demo nodes.

ML Forecast Layer (Chronos) – optional future extension that turns historical route delays into probabilistic forecasts.

🧠 Core Modules & Terminology
🧩 1. Routing Engine

Implements Dijkstra’s shortest-path algorithm over an in-memory graph.

Computes both baseline and adjusted routes, where adjusted edges have weights modified by incident severity.

Returns ETA, path nodes, and comparison metrics:

{
  "baseline": { "eta_minutes": 17, "path": [0,1,2,5] },
  "adjusted": { "eta_minutes": 23, "path": [0,1,4,5] },
  "recommendation": "baseline_faster"
}

⚠️ 2. Incident Engine

Real-time disruption simulation: users or live feeds can inject “minor”, “moderate”, or “major” incidents.

Incidents increase edge weights → route recomputation adjusts ETAs dynamically.

Integrated with Server-Sent Events (SSE) — frontend instantly updates without polling.

Example:

[SSE] New: Major disruption at Stop 3 — expect +20 min delay

🧬 3. TransitDNA Predictive Core

Learns correlations between incident patterns and delay outcomes.

Maintains a rolling in-memory “DNA” history:

Node ID → list of past incident impacts

Rule extraction: average + predicted delay per severity

Used to forecast future travel impact even before the disruption fully propagates.

Example:

DNA rules=3, history=8
Predicted extra delay: +11 min

👩‍💼 4. Persona Engine

Simulates commuter behavior through “personas” (e.g., Sarah, a daily commuter).

Each persona has:

{ "name": "Sarah", "src": 0, "dst": 5, "preferred_departure": "08:15" }


System precomputes predicted ETA for each persona when new incidents occur.

Pushes proactive alerts:

⚠️ Persona "Sarah" likely delayed by 13 min — consider alternative route.

📅 5. Calendar Engine

Parses .ics files and integrates user events.

Compares next event time with computed ETA → detects conflicts in real-time:

Calendar: 'Demo meeting' at 09:00 may conflict with ETA (arrives 09:10)

🔄 6. SSE Push Engine

Keeps frontend in sync instantly with backend events.

Streams:

Incident updates

Persona predictions

Calendar conflicts

ETA recalculations

Enables reactive UI without refresh — judges love seeing live updates.

🖥️ Frontend Overview (Leaflet Map UI)
Element	Description
🗺️ Map	Leaflet-powered live map with dynamic route overlays
🚦 Route Lines	Baseline (dashed blue), Adjusted (solid red)
🧭 ETA Panel	Shows baseline vs adjusted ETAs, recommendation
🧬 DNA Indicator	Displays “Predicted extra minutes” based on TransitDNA
📅 Calendar Conflicts	Inline warnings about meetings overlapping with ETA
👤 Persona Dropdown	Select saved profiles like “Sarah”
⚠️ Live Log	Scrollable feed of all SSE alerts (incidents, predictions, etc.)
⚙️ Technology Stack
Layer	Tech
Backend	C++17, cpp-httplib (REST/SSE), nlohmann::json
Algorithms	Dijkstra’s shortest path, Moving Average (TransitDNA)
Frontend	HTML + JavaScript + Leaflet.js
Optional ML	Python FastAPI + Chronos Forecasting + GTFS Realtime
Deployment	Localhost (CLI or browser), lightweight, no database needed
OS Target	Linux / Windows compatible (Hackathon build runs locally)
🔍 Key Innovations (Pitch to Judges)
Innovation	Explanation
Proactive Routing	Predicts delays before they happen using historical and real-time signals
Persona-Driven Forecasts	Tailors alerts to specific commuter profiles (e.g., Sarah’s daily route)
Calendar-Aware Travel	Detects conflicts between meetings and travel time automatically
Dynamic Network Learning	TransitDNA evolves based on incidents and delay outcomes
SSE Live Updates	Fully real-time — no refresh or polling
GTFS Integration Ready	Hooks into live Kraków transit feeds for production scaling
Cross-Tech Fusion	Hybrid of C++ real-time core + Python predictive engine
Explainable Outputs	Transparent, human-friendly explanations: “+7 min delay due to accident”
🎯 For the Demo

Start the C++ backend → shows [server] listening on :8080

Open the frontend → map + control panel loads

Trigger incidents → route recomputes live

Load persona Sarah → predictive message appears

Upload calendar → show conflict warning










ADDDING HERE 


Here’s a detailed, professional project description you can hand over to your teammate — it summarizes the full concept, technical depth, user value, and future vision of your system.
 It’s written in a hackathon/project-report style (ideal for README, submission forms, or documentation).

🚍 Project Description — Travel Guardian 3SixO (Journey Radar)
🧭 Overview
Travel Guardian 3SixO, codenamed Journey Radar, is an intelligent public transport delay prediction and incident management system.
 It combines real-time data from official transport feeds (GTFS), community-driven reports, and machine learning forecasts to deliver a proactive mobility platform — one that anticipates delays before they happen rather than reacting to them.
The system serves as a bridge between passengers, dispatchers, and transport operators, ensuring that everyone—from daily commuters to city control centers—has access to accurate, verified, and predictive information about travel disruptions.

💡 Core Idea
Most existing systems (Google Maps, city transport apps) are reactive — they only show where a vehicle currently is or if it’s already late.
 Travel Guardian 3SixO flips that logic.
 It predicts what will happen next using historical data, community insights, and live sensor streams.
Imagine knowing that Bus 152 is 96% likely to be 12 minutes late at 09:30, 30 minutes before it actually happens — and being offered an alternative route in real time.
 That’s the experience TG_3SixO delivers.

🧩 Key Components
1️⃣ Incident & Community Reporting System
Users can instantly report accidents, jams, or blockages with title, description, coordinates, severity, and optional photos.


Each report appears live on the interactive map and is fed into the TransitDNA engine to recalibrate ETAs dynamically.


A reward system gamifies reporting — verified, early, or accurate reports earn points redeemable for partner discounts (e.g., Żabka).


Dispatcher integration allows reports to be validated, confirmed, or escalated to emergency services (Police, Fire, Ambulance).


2️⃣ Predictive Delay Engine (TransitDNA)
The brain of the system — written in C++17 with cpp-httplib and nlohmann::json.


Tracks and learns delay patterns over time using a rolling history and node-based severity mapping.


Generates predictive delay estimates like “+7 min expected at Node 3 due to recurring moderate congestion.”


Proactively triggers alerts via Server-Sent Events (SSE) when delays cross certain thresholds.


3️⃣ Routing & Transit Core
Uses a Dijkstra-based routing engine that dynamically adjusts path weights based on disruptions.


Maintains both baseline and adjusted routes — automatically recommending faster or more reliable paths.


Integrates with official GTFS Realtime feeds for vehicle positions and trip updates through a Python FastAPI sidecar service.


Supports “persona” journeys (e.g., Sarah’s daily commute) to personalize predictions.


4️⃣ Forecasting & Machine Learning (Python Integration)
Optional Chronos time-series model (Amazon’s forecasting library) integrated for data-driven delay prediction.


Processes historical trip delays and generates forward-looking forecasts stored in JSON (forecasts.json).


These predictions can be imported into the C++ backend via /ml/forecasts, enhancing DNA predictions with ML insights.


5️⃣ Frontend Visualization (Web App)
Built with Leaflet.js, using a single-page interface that shows:


Live map of routes, buses, and user-reported incidents.


Real-time ETA comparisons (baseline vs. adjusted).


Calendar conflict warnings (e.g., “Meeting at 9 collides with ETA 9:10”).


Persona-based forecasts and proactive alerts.


The event log records every incoming SSE event, alert, and incident for live debugging and demo impact.



⚙️ Technology Stack
Layer
Technology
Purpose
Frontend
HTML, JavaScript, Leaflet.js
Real-time visualization & interaction
Core Backend
C++17 (cpp-httplib, nlohmann::json)
High-performance routing, SSE, and logic
Data Layer
SQLite / JSON
Temporary in-memory + lightweight persistence
Predictive Sidecar
Python (FastAPI, gtfs-realtime-bindings)
GTFS integration + delay aggregation
Machine Learning
Python (Chronos, Torch, Pandas)
Predictive delay modeling
Communication
Server-Sent Events (SSE)
Instant frontend updates
Concurrency
C++ threads + mutex
Background cleanup, SSE safety
APIs
/route, /predict, /incidents, /monitor, /calendar, /personas, /ml/forecasts
Core endpoints for routing, prediction, and data exchange


🚦 End-to-End Flow
1️⃣ User submits a disruption report → stored in backend → instantly visible on map.
 2️⃣ Incident increases graph weight → routing engine recomputes adjusted route.
 3️⃣ TransitDNA logs the change → updates its prediction model.
 4️⃣ SSE pushes live update to frontend (red marker + updated ETA).
 5️⃣ Calendar & persona modules check for schedule conflicts.
 6️⃣ ML sidecar refines predictions using external delay feeds.
Result → real-time predictive insight for both passengers and operators.

🔮 Impact & Vision
Predictive Public Transport — transforms how cities manage real-time delays.


Community Intelligence Layer — turns everyday commuters into data contributors.


Proactive Alerts — warns users before disruption cascades begin.


Data Fusion Engine — merges human, machine, and sensor data for full-route awareness.


Scalable Future — compatible with live APIs, smart city sensors, and international GTFS datasets.



🏁 In One Line:
“Travel Guardian 3SixO turns raw disruption data into predictive, actionable mobility intelligence — empowering cities and commuters to move smarter, not just faster.”

