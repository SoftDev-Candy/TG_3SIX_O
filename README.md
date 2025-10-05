🚦 Guardian: Real-Time Traffic Intelligence System
Guardian is a high-performance C++17 traffic simulation system that provides real-time routing intelligence with dynamic incident handling and live frontend visualization.
✨ Features

🗺️ Graph-Based Routing: Advanced shortest path calculation using Dijkstra's algorithm
⚠️ Dynamic Incident Processing: Real-time road incidents (minor, moderate, severe) with automatic travel time adjustments and configurable severity multipliers
📡 Live Updates: Backend streams adjusted ETAs and routes continuously via Server-Sent Events (SSE)
🔄 Concurrency & Thread Safety: Robust multi-threading with mutexes, atomics, and condition variables for safe live state management
🏗️ Modern C++ Architecture: Clean header/implementation separation following modern C++17 best practices
🌐 Frontend Integration: React dashboard with real-time SSE stream visualization showing baseline vs. adjusted routes

🛠️ Tech Stack
ComponentTechnologyBackendC++17, Custom HTTP Server, nlohmann::jsonFrontendReact, Server-Sent Events (SSE)AlgorithmsDijkstra's shortest path, dynamic graph adjustmentsConcurrencystd::thread, std::mutex, std::condition_variable, std::atomic
🚀 Quick Start
Prerequisites

C++17 compatible compiler (GCC 7+, Clang 5+, MSVC 2017+)
Node.js 14+ (for frontend)
nlohmann::json library

Installation and demo 
(COMING SOON)

-------
How to run Python backend:

make sure your venv is active and you have all modules installed <br>
navigate to ./pythonsrc/UserAPI/ <br>
python main.py <br>
in order to view api docs goto <br>
go to http://127.0.0.1:8000/docs/ <br>
