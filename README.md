🚦 TG_3SIXO: Predictive Transport Intelligence System

Travel Guardian 360 (codename: TG 3SIX O) is a real-time, AI-driven transport forecasting platform.
It combines live transit feeds, community reports, and a C++17 predictive engine to forecast upcoming delays, recommend alternative routes, and alert users before disruptions hit.

✨ Key Highlights
Module	Purpose
🧭 Routing Engine (C++)	Graph-based shortest path routing (Dijkstra) with live weight adjustment for incidents.
⚙️ Transit DNA Predictor	Learns from historical disruptions to forecast probable future delays (+X minutes).
👥 Persona System	Simulates commuter journeys (e.g., “Sarah”) with personalized delay predictions.
🕒 Calendar Conflict Detection	Detects ETA clashes with user events from .ics files.
🛰️ GTFS Live Integration (Python)	Sidecar microservice that fetches real-time Kraków bus & tram data and feeds it to C++.
🔄 SSE Streaming	Continuous server-sent events push live ETA, delay, and prediction updates to frontend.
🧰 User Reports + Dispatcher API	FastAPI microservice for crowdsourced incident reports and verified dispatcher inputs.
🎯 Proactive Alerts	AI proactively warns “⚠️ Likely +12 min delay” before it happens.
🧱 Architecture Overview
<img width="400" height="600" alt="Architecture" src="https://github.com/user-attachments/assets/fb62c843-b2c5-4289-9a17-2869384cf7f0" />

💡 How It Works

==Official feeds (GTFS Realtime) and user reports stream into the backend.
==Transit DNA analyzes recent incident patterns to predict upcoming delays.
==Routing Engine recomputes paths with adjusted weights in real time.
==Frontend (Leaflet dashboard) displays baseline vs. adjusted routes, ETAs, and proactive alerts.
==Personas simulate daily commuters, while calendar integration detects potential conflicts (“⚠ Meeting at 09:00 may conflict with ETA 09:10”).

🧮 Predictive Engine

Powered by a lightweight ML heuristic system:
Rolling averages & node severity models.
Optional integration with Amazon Chronos (time-series model) via Python.

Predicts delay windows, e.g.
96% chance of +12 min delay at Stop 4.

💾 Tech Stack
Layer	Technology
Backend Core	C++17, cpp-httplib, nlohmann::json
Concurrency	std::thread, mutex, condition_variable
Prediction	Custom TransitDNA engine / Chronos (Python)
APIs	FastAPI (Python), REST, SSE
Frontend	Vanilla JS + Leaflet (map visualization)
Data	GTFS-RT (Kraków), .ics Calendar, User Reports
Future DB	SQLite / PostgreSQL planned


⚙️ Installation & Running
1️⃣ Backend (C++)
# Compile and run
mkdir build && cd build
cmake ..
make
./journey_radar
Server starts on http://localhost:8080

2️⃣ Frontend
Open frontend/index.html in your browser.
It connects automatically via SSE to backend on port 8080.

3️⃣ Python Services
a) GTFS Sidecar
cd python_code
uvicorn gtfs_sidecar:app --port 9999

b) User API
cd python_code/UserAPI
python main.py
# Docs at: http://127.0.0.1:8000/docs

📹 Demo Videos & Links
Part	Link
🎥 Full System Demo	YouTube – Journey Radar Demo

🧭 Routing Engine Explained	 Watch → Add link here for youTube
🔮 Transit DNA Prediction Showcase	Watch →
//Please add more video links here // 

🆚 Why It’s Better Than Existing Solutions
Problem with existing systems	How Journey Radar solves it
Reactive apps (Google Maps, Jak Dojadę) show delays after they happen	Predictive alerts forecast upcoming disruptions
Data silos between operators and users	Unified intelligence merges GTFS, reports, and calendar data
No personalization	Personas adapt forecasts to individual journeys
No open APIs for dispatchers	REST endpoints allow seamless dispatcher integration
Limited local insights	Community-verified reports enhance accuracy

🌍 Scalability & Market
Works with any city providing GTFS Realtime feeds.
Extendable to sensors on buses/trams or IoT traffic devices.
Cloud-ready microservice design (FastAPI + C++).
Potential integration with city dashboards, Google Transit, or MaaS platforms.

🧑‍💻 Team & Credits
Lead Developer: Swastik — C++ Systems Engineer & Product Architect
Collaborators: Data & AI Integration – Marvellous, Frontend Design – [Your teammate name]

🏁 Future Roadmap
Persistent database (SQLite → Postgres + Timescale).
Extended AI pipeline (Chronos + Prophet models).
Mobile app & Push Notifications.
Reward system & gamified user submissions.
City dashboard for dispatchers and operators.

🛡️ License
MIT License — free for non-commercial and educational use.
