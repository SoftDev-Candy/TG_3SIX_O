    #include "server.hpp"
    #include <iostream>
    #include <thread>
    #include <chrono>
    #include <cmath>   // for std::ceil vimp forgot add it last time i'm dum dum 
    #include <condition_variable>
    #include <atomic>
    #include<mutex> //for th
    #include<vector>

// ---------------- Calendar (in-memory, simple .ics parser) ----------------
struct CalendarEvent {
    long long start_epoch = 0; // epoch seconds UTC
    std::string summary;
};

// monitor struct
struct Monitor {
    int id;
    int src;
    int dst;
    int threshold_minutes; // alert when adjusted ETA - baseline ETA >= threshold
    long long created_at;
};
static std::mutex g_monitors_mutex;
static std::vector<Monitor> g_monitors;
static int g_next_monitor_id = 1;
    
    static std::mutex g_events_mutex;
    static std::condition_variable g_events_cv;
    static std::atomic<bool> g_events_flag{ false };
    
    //For da Calenders 
    static std::mutex g_calendar_mutex;
    static std::vector<CalendarEvent> g_calendar_events;



// Very small helper: parse a single DTSTART line like "DTSTART:20250930T090000Z" or "DTSTART:20250930T090000"
static long long parse_ics_dtstart(const std::string& line) {
    // find the colon
    auto pos = line.find(':');
    if (pos == std::string::npos) return 0;
    std::string dt = line.substr(pos + 1);
    // Accept YYYYMMDD or YYYYMMDDTHHMMSS or with trailing Z
    // We'll parse YYYYMMDD[T]HHMM[SS] permissively.
    std::tm tm{};
    if (dt.size() < 8) return 0;
    try {
        int year = std::stoi(dt.substr(0, 4));
        int month = std::stoi(dt.substr(4, 2));
        int day = std::stoi(dt.substr(6, 2));
        int hour = 0, min = 0, sec = 0;
        if (dt.size() >= 15 && (dt[8] == 'T' || dt[8] == 't')) {
            // e.g. YYYYMMDDTHHMMSS or YYYYMMDDTHHMM
            hour = std::stoi(dt.substr(9, 2));
            min = std::stoi(dt.substr(11, 2));
            if (dt.size() >= 15) sec = std::stoi(dt.substr(13, 2));
        }
        tm.tm_year = year - 1900;
        tm.tm_mon = month - 1;
        tm.tm_mday = day;
        tm.tm_hour = hour;
        tm.tm_min = min;
        tm.tm_sec = sec;
        // treat as local time and convert to epoch (portable enough for demo)
        return (long long)std::mktime(&tm);
    }
    catch (...) {
        return 0;
    }
}

//------------------------Store Object here---------------------//
Store STORE;

// Build demo graph
Graph build_demo_graph() {
    Graph g(6);
    g.add_edge(0, 1, 5); g.add_edge(1, 0, 5);
    g.add_edge(1, 2, 5); g.add_edge(2, 1, 5);
    g.add_edge(0, 3, 10); g.add_edge(3, 0, 10);
    g.add_edge(3, 4, 3); g.add_edge(4, 3, 3);
    g.add_edge(4, 2, 2); g.add_edge(2, 4, 2);
    g.add_edge(2, 5, 7); g.add_edge(5, 2, 7);
    g.add_edge(4, 5, 6); g.add_edge(5, 4, 6);
    g.n = 6;
    return g;
}
// made it global might need it late for other purposes
nlohmann::json compute_route_pair(const Graph& GRAPH, int src, int dst) {
    Graph baseline = GRAPH;
    Graph adjusted = GRAPH;

    auto incidents = STORE.get_incidents_copy();

    for (const auto& inc : incidents) {
        int node = inc.node_or_edge;
        double multiplier = (inc.severity <= 1) ? 1.5 : (inc.severity == 2 ? 2.2 : 3.0);

        if (node >= 0 && node < adjusted.n) {
            for (auto& e : adjusted.adj[node])
                e.w = static_cast<long long>(std::ceil(e.w * multiplier));

            for (int u = 0; u < adjusted.n; ++u)
                for (auto& e : adjusted.adj[u])
                    if (e.to == node)
                        e.w = static_cast<long long>(std::ceil(e.w * multiplier));
        }
    }

    auto res_base = dijkstra(baseline, src);
    auto path_base = recover_path(res_base, src, dst);
    long long eta_base = (res_base.dist[dst] == INF) ? -1 : res_base.dist[dst];

    auto res_adj = dijkstra(adjusted, src);
    auto path_adj = recover_path(res_adj, src, dst);
    long long eta_adj = (res_adj.dist[dst] == INF) ? -1 : res_adj.dist[dst];

    nlohmann::json r;
    r["baseline"] = { {"path", path_base}, {"eta_minutes", eta_base} };
    r["adjusted"] = { {"path", path_adj}, {"eta_minutes", eta_adj} };
    return r;
}

    void run_server(int port) {
        httplib::Server svr;
        Graph GRAPH = build_demo_graph();
        // start background cleaner thread: removes expired incidents periodically
        std::thread([]() {
            while (true) {
                std::this_thread::sleep_for(std::chrono::seconds(2));
                try {
                    STORE.remove_expired(); // ensure Store::remove_expired is thread-safe
                    // notify SSE clients that incidents may have changed
                    g_events_flag.store(true);
                    g_events_cv.notify_all();
                }
                catch (const std::exception& e) {
                    std::cerr << "[cleaner] exception: " << e.what() << "\n";
                }
            }
            }).detach();



        // CORS helper
        auto set_cors = [](httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type");
            };

        // Preflight handler
        svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type");
            res.status = 200;
            });





        // POST /monitor { "src":0, "dst":5, "threshold": 3 }
        svr.Post("/monitor", [&set_cors, &GRAPH](const httplib::Request& req, httplib::Response& res) {
            set_cors(res);
            try {
                auto body = nlohmann::json::parse(req.body);
                Monitor m;
                m.src = body.value("src", 0);
                m.dst = body.value("dst", 0);
                m.threshold_minutes = body.value("threshold", 3);
                m.created_at = (long long)std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());

                {
                    std::lock_guard<std::mutex> lk(g_monitors_mutex);
                    m.id = g_next_monitor_id++;
                    g_monitors.push_back(m);
                }

                // signal SSE clients (they'll evaluate monitors on next tick)
                g_events_flag.store(true);
                g_events_cv.notify_all();

                res.set_content(nlohmann::json({ {"monitor_id", m.id} }).dump(), "application/json");
            }
            catch (const std::exception& e) {
                res.status = 400;
                res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
            }
            });

        // --- GET /monitors (unchanged, safe copy) ---
        svr.Get("/monitors", [&set_cors](const httplib::Request&, httplib::Response& res) {
            set_cors(res);
            nlohmann::json arr = nlohmann::json::array();
            {
                std::lock_guard<std::mutex> lk(g_monitors_mutex);
                for (const auto& m : g_monitors) {
                    arr.push_back({ {"id", m.id}, {"src", m.src}, {"dst", m.dst}, {"threshold", m.threshold_minutes}, {"created_at", m.created_at} });
                }
            }
            res.set_content(arr.dump(), "application/json");
            });

        // ----------- Handlers ------------

        // /status
        svr.Get("/status", [&set_cors](const httplib::Request&, httplib::Response& res) {
            set_cors(res);
            res.set_content(nlohmann::json({ {"status","ok"} }).dump(), "application/json");
            });

        // POST /trip
        svr.Post("/trip", [&set_cors](const httplib::Request& req, httplib::Response& res) {
            set_cors(res);
            try {
                auto body = nlohmann::json::parse(req.body);
                int src = body.value("src", 0);
                int dst = body.value("dst", 0);
                Trip t; t.src = src; t.dst = dst; t.user = body.value("user", "demo");
                int id = STORE.add_trip(t);
                res.set_content(nlohmann::json({ {"trip_id", id} }).dump(), "application/json");
                std::cout << "[trip] id=" << id << " src=" << src << " dst=" << dst << "\n";
            }
            catch (const std::exception& e) {
                res.status = 400;
                res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
            }
            });

        // POST /report
        svr.Post("/report", [&set_cors](const httplib::Request& req, httplib::Response& res) {
            set_cors(res);
            try {
                auto body = nlohmann::json::parse(req.body);
                Incident inc;
                inc.node_or_edge = body.value("node", 0);
                inc.description = body.value("desc", std::string("reported incident"));
                int id = STORE.add_incident(inc);
                res.set_content(nlohmann::json({ {"incident_id", id} }).dump(), "application/json");
                std::cout << "[report] id=" << id << " node=" << inc.node_or_edge << " desc=" << inc.description << "\n";
            }
            catch (const std::exception& e) {
                res.status = 400;
                res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
            }
            });

        // POST /simulate
        svr.Post("/simulate", [&set_cors](const httplib::Request& req, httplib::Response& res) {
            set_cors(res);
            try {
                auto body = nlohmann::json::parse(req.body);
                int node = body.value("node", 0);
                std::string desc = body.value("desc", "simulated incident");
                int delay_ms = body.value("delay_ms", 0);
                int severity = body.value("severity", 1);
                int duration_s = body.value("duration_s", 60);

                res.set_content(nlohmann::json({
                    {"scheduled", true},
                    {"node", node},
                    {"delay_ms", delay_ms},
                    {"severity", severity},
                    {"duration_s", duration_s}
                    }).dump(), "application/json");

                std::thread([node, desc, delay_ms, severity, duration_s]() {
                    if (delay_ms > 0) std::this_thread::sleep_for(std::chrono::milliseconds(delay_ms));
                    else std::this_thread::sleep_for(std::chrono::milliseconds(100));

                    Incident inc;
                    inc.node_or_edge = node;
                    inc.description = desc;
                    inc.severity = severity;
                    auto now = (long long)std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
                    inc.timestamp = now;
                    if (duration_s > 0) inc.expires_at = now + duration_s;
                    int id = STORE.add_incident(inc);
                    std::cout << "[simulate] injected incident id=" << id << " node=" << node
                        << " severity=" << severity << " expires_at=" << inc.expires_at << "\n";
                    }).detach();

            }
            catch (const std::exception& e) {
                res.status = 400;
                res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
            }
            });

        // POST /calendar  (body = raw .ics text)
        svr.Post("/calendar", [&set_cors](const httplib::Request& req, httplib::Response& res) {
            set_cors(res);
            try {
                const std::string ics = req.body;
                if (ics.empty()) {
                    res.status = 400;
                    res.set_content(nlohmann::json({ {"error","empty body"} }).dump(), "application/json");
                    return;
                }

                // parse lines: collect events
                std::istringstream iss(ics);
                std::string line;
                CalendarEvent cur;
                bool inEvent = false;
                std::vector<CalendarEvent> parsed;

                while (std::getline(iss, line)) {
                    // trim CR
                    if (!line.empty() && line.back() == '\r') line.pop_back();

                    if (line.rfind("BEGIN:VEVENT", 0) == 0) {
                        inEvent = true;
                        cur = CalendarEvent{};
                    }
                    else if (line.rfind("END:VEVENT", 0) == 0) {
                        inEvent = false;
                        if (cur.start_epoch != 0) parsed.push_back(cur);
                    }
                    else if (inEvent) {
                        if (line.rfind("DTSTART", 0) == 0) {
                            long long t = parse_ics_dtstart(line);
                            if (t > 0) cur.start_epoch = t;
                        }
                        else if (line.rfind("SUMMARY", 0) == 0) {
                            auto pos = line.find(':');
                            if (pos != std::string::npos) cur.summary = line.substr(pos + 1);
                        }
                    }
                }

                // store parsed events (replace existing in-memory calendar)
                {
                    std::lock_guard<std::mutex> lg(g_calendar_mutex);
                    g_calendar_events = parsed; // overwrite easy demo behavior
                }

                nlohmann::json out;
                out["imported"] = (int)parsed.size();
                res.set_content(out.dump(), "application/json");
            }
            catch (const std::exception& e) {
                res.status = 500;
                res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
            }
            });


        // GET /incidents
        svr.Get("/incidents", [&set_cors](const httplib::Request&, httplib::Response& res) {
            set_cors(res);
            res.set_content(STORE.list_incidents().dump(), "application/json");
            g_events_flag.store(true);
            g_events_cv.notify_all();

            });

        // POST /route
        svr.Post("/route", [&set_cors, &GRAPH](const httplib::Request& req, httplib::Response& res) {
            set_cors(res);
            try {
                auto body = nlohmann::json::parse(req.body);
                int src = body.value("src", 0);
                int dst = body.value("dst", 0);
                if (src < 0 || src >= GRAPH.n || dst < 0 || dst >= GRAPH.n) {
                    res.status = 400;
                    res.set_content(nlohmann::json({ {"error","invalid node"} }).dump(), "application/json");
                    return;
                }

                // use helper to compute both baseline and adjusted results
                auto pair = compute_route_pair(GRAPH, src, dst);

                long long eta_base = pair["baseline"]["eta_minutes"].get<long long>();
                long long eta_adj = pair["adjusted"]["eta_minutes"].get<long long>();
                auto path_base = pair["baseline"]["path"].get<std::vector<int>>();
                auto path_adj = pair["adjusted"]["path"].get<std::vector<int>>();

                // notify SSE watchers that route/incidents may have changed
                g_events_flag.store(true);
                g_events_cv.notify_all();

                // keep your DNA logging if you want to record impacts
                if (eta_base >= 0 && eta_adj >= 0 && eta_adj > eta_base) {
                    long long diff = eta_adj - eta_base;
                    auto incidents = STORE.get_incidents_copy();
                    if (!incidents.empty()) {
                        DNA.logIncidentImpact(
                            incidents[0].node_or_edge,
                            incidents[0].severity,
                            diff
                        );
                    }
                }
                                // --- DNA prediction (safe) ---
                double dna_pred = 0.0;
                try {
                    // use baseline path as canonical representative for persona prediction
                    auto path_for_dna = path_base;
                    // if baseline path empty, try adjusted path
                    if (path_for_dna.empty()) path_for_dna = path_adj;
                    if (!path_for_dna.empty()) {
                        dna_pred = DNA.predict_delay_for_path(path_for_dna);
                    } else {
                        dna_pred = 0.0;
                    }
                } catch (const std::exception& ex) {
                    std::cerr << "[route] DNA predict exception: " << ex.what() << "\n";
                    dna_pred = 0.0;
                } catch (...) {
                    dna_pred = 0.0;
                }

                nlohmann::json r;
                r["baseline"] = { {"path", path_base}, {"eta_minutes", eta_base} };
                // attach DNA info for clients
                r["dna_predicted_extra_minutes"] = dna_pred;
                r["dna_message"] = DNA.summary_short();
                r["adjusted"] = { {"path", path_adj}, {"eta_minutes", eta_adj} };
                if (eta_base >= 0 && eta_adj >= 0) {
                    if (eta_adj > eta_base) r["recommendation"] = "baseline_faster";
                    else if (eta_adj < eta_base) r["recommendation"] = "adjusted_faster";
                    else r["recommendation"] = "equal";
                }
                else if (eta_base >= 0) {
                    r["recommendation"] = "baseline_available";
                }
                else if (eta_adj >= 0) {
                    r["recommendation"] = "adjusted_available";
                }
                else {
                    r["recommendation"] = "no_path";
                }

                // --- Calendar conflict check (simple) ---
                try {
                    bool conflict = false;
                    std::string conflict_msg;
                    auto now_ts = (long long)std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());

                    // choose ETA to compare: use adjusted ETA if available else baseline
                    long long eta_to_use = (eta_adj >= 0) ? eta_adj : eta_base;
                    if (eta_to_use >= 0) {
                        // compute arrival epoch (seconds)
                        long long arrival_epoch = now_ts + (eta_to_use * 60LL);

                        // allow small buffer (e.g., person needs 10 minutes to get to stop)
                        const long long buffer_seconds = 10 * 60LL;

                        std::lock_guard<std::mutex> lg(g_calendar_mutex);
                        for (const auto& ev : g_calendar_events) {
                            if (ev.start_epoch == 0) continue;
                            // if event starts within [arrival - buffer, arrival + buffer] consider conflict
                            if (ev.start_epoch >= (arrival_epoch - buffer_seconds) && ev.start_epoch <= (arrival_epoch + buffer_seconds)) {
                                conflict = true;
                                // human friendly message
                                std::time_t t = (std::time_t)ev.start_epoch;
                                char buf[64];
                                std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M", std::localtime(&t));
                                conflict_msg = std::string("Calendar: '") + (ev.summary.empty() ? "event" : ev.summary) + "' at " + buf + " may conflict with ETA";
                                break;
                            }
                        }
                    }
                    r["calendar_conflict"] = conflict;
                    r["calendar_conflict_msg"] = conflict ? conflict_msg : "";
                }
                catch (...) {
                    r["calendar_conflict"] = false;
                    r["calendar_conflict_msg"] = "";
                }




                res.set_content(r.dump(), "application/json");
            }
            catch (const std::exception& e) {
                res.status = 400;
                res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
            }
            });

        svr.Get("/dna", [&set_cors](const httplib::Request&, httplib::Response& res) {
            set_cors(res);
            try {
                auto s = DNA.exportSummaryJSON();
                if (s.empty() || s == "null") s = "{}";
                res.set_content(s, "application/json");
            }
            catch (...) {
                res.set_content("{}", "application/json");
            }
            });

        // POST /predict  { "src":0, "dst":5, "persona": { ... } }
        svr.Post("/predict", [&set_cors, &GRAPH](const httplib::Request& req, httplib::Response& res) {
            set_cors(res);
            try {
                auto body = nlohmann::json::parse(req.body);
                int src = body.value("src", 0);
                int dst = body.value("dst", 0);
                if (src < 0 || src >= GRAPH.n || dst < 0 || dst >= GRAPH.n) {
                    res.status = 400;
                    res.set_content(nlohmann::json({ {"error","invalid node"} }).dump(), "application/json");
                    return;
                }

                auto compute_route_pair = [&GRAPH](int src, int dst) -> nlohmann::json {
                    Graph baseline = GRAPH;
                    Graph adjusted = GRAPH;
                    auto incidents = STORE.get_incidents_copy();

                    for (const auto& inc : incidents) {
                        int node = inc.node_or_edge;
                        double multiplier = (inc.severity <= 1) ? 1.5 : (inc.severity == 2 ? 2.2 : 3.0);

                        for (auto& e : adjusted.adj[node])
                            e.w = static_cast<long long>(std::ceil(e.w * multiplier));

                        for (int u = 0; u < adjusted.n; ++u)
                            for (auto& e : adjusted.adj[u])
                                if (e.to == node)
                                    e.w = static_cast<long long>(std::ceil(e.w * multiplier));
                    }

                    auto res_base = dijkstra(baseline, src);
                    auto path_base = recover_path(res_base, src, dst);
                    long long eta_base = (res_base.dist[dst] == INF) ? -1 : res_base.dist[dst];

                    auto res_adj = dijkstra(adjusted, src);
                    auto path_adj = recover_path(res_adj, src, dst);
                    long long eta_adj = (res_adj.dist[dst] == INF) ? -1 : res_adj.dist[dst];

                    nlohmann::json r;
                    r["baseline"] = { {"path", path_base}, {"eta_minutes", eta_base} };
                    r["adjusted"] = { {"path", path_adj}, {"eta_minutes", eta_adj} };
                    return r;
                    };

                auto pair = compute_route_pair(src, dst);

                long long eta_base = pair["baseline"]["eta_minutes"].get<long long>();
                long long eta_adj = pair["adjusted"]["eta_minutes"].get<long long>();

                double dna_pred = 0.0;
                try {
                    auto path = pair["baseline"]["path"].get<std::vector<int>>();
                    dna_pred = DNA.predict_delay_for_path(path);
                }
                catch (...) { dna_pred = 0.0; }

                // Debug/logging for predict
                try {
                    auto incs_json = STORE.list_incidents();
                    size_t inc_count = incs_json.is_array() ? inc_count = incs_json.size() : 0;
                    std::cout << "[PREDICT] src=" << src
                        << " dst=" << dst
                        << " eta_base=" << eta_base
                        << " eta_adj=" << eta_adj
                        << " dna_pred=" << dna_pred
                        << " incidents=" << inc_count
                        << std::endl;
                }
                catch (...) {
                    std::cout << "[PREDICT] src=" << src << " dst=" << dst
                        << " eta_base=" << eta_base << " eta_adj=" << eta_adj
                        << " dna_pred=" << dna_pred << " incidents=?" << std::endl;
                }


                nlohmann::json r;
                r["baseline"] = pair["baseline"];
                r["adjusted"] = pair["adjusted"];
                r["dna_predicted_extra_minutes"] = dna_pred;
                r["dna_message"] = DNA.summary_short();
                res.set_content(r.dump(), "application/json");
            }
            catch (const std::exception& e) {
                res.status = 400;
                res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
            }
            });



        // --- GET /events SSE (cleaned) ---
        svr.Get("/events", [&set_cors, &GRAPH](const httplib::Request&, httplib::Response& res) {
            set_cors(res);
            res.set_header("Content-Type", "text/event-stream");
            res.set_header("Cache-Control", "no-cache");
            res.set_header("Connection", "keep-alive");

            // last incidents string used to avoid re-sending identical payloads
            std::string last_incidents_str;

            res.set_chunked_content_provider(
                "text/event-stream",
                [&GRAPH, last_incidents_str = std::string()](size_t /*offset*/, httplib::DataSink& sink) mutable -> bool {
                   // send initial greeting (check writability)
                    std::string init = "event: connected\ndata: {\"status\":\"ok\"}\n\n";
                    if (!sink.is_writable() || !sink.write(init.c_str(), init.size())) {
                        return false;
                    }
                    std::unique_lock<std::mutex> lk(g_events_mutex);

                    // heartbeat counter (keeps heart local to lambda)
                    int heartbeat_counter = 0;

                    while (sink.is_writable()) {
                        // Wait until notified or timeout (keeps connection alive)
                        g_events_cv.wait_for(lk, std::chrono::seconds(2));

                        // Release the g_events_mutex quickly — do not hold while calling STORE/DNA/compute
                        lk.unlock();

                        try {
                            // 1) Get a safe copy of incidents (STORE should return by value)
                            nlohmann::json incidents_json;
                            try {
                                incidents_json = STORE.list_incidents(); // MUST return by value and be thread-safe
                            }
                            catch (...) {
                                incidents_json = nlohmann::json::array();
                            }
                            const std::string incidents_str = incidents_json.dump();

                            // 2) Build payload JSON locally
                            nlohmann::json payload;
                            payload["incidents"] = incidents_json;

                            // Add DNA summary safely (normalize to { node_stats: { node: { avg_delay, count } } })
                                                        // Add DNA summary safely (normalize to { node_stats: { node: { avg_delay, count } } })
                            try {
                                auto dna_json_str = DNA.exportSummaryJSON(); // must be thread-safe
                                nlohmann::json dna_out = nlohmann::json::object();

                                if (dna_json_str.empty() || dna_json_str == "null") {
                                    dna_out["node_stats"] = nlohmann::json::object();
                                }
                                else {
                                    auto parsed = nlohmann::json::parse(dna_json_str);
                                    // If parsed is an array of {node, severity, avg_delay, samples}
                                    if (parsed.is_array()) {
                                        nlohmann::json node_stats = nlohmann::json::object();
                                        for (auto& item : parsed) {
                                            try {
                                                int node = item.value("node", -1);
                                                double avg = item.value("avg_delay", 0.0);
                                                int samples = item.value("samples", 0);
                                                if (node < 0) continue;
                                                std::string key = std::to_string(node);

                                                // ensure object exists
                                                if (!node_stats.contains(key) || !node_stats[key].is_object()) {
                                                    node_stats[key] = nlohmann::json::object();
                                                    node_stats[key]["avg_delay"] = 0.0;
                                                    node_stats[key]["count"] = 0;
                                                }

                                                double prev_avg = node_stats[key].value("avg_delay", 0.0);
                                                int prev_count = node_stats[key].value("count", 0);

                                                // aggregate: keep the maximum average delay seen across severities,
                                                // and sum samples as a simple count.
                                                double new_avg = std::max(prev_avg, avg);
                                                int new_count = prev_count + samples;

                                                node_stats[key]["avg_delay"] = new_avg;
                                                node_stats[key]["count"] = new_count;
                                            }
                                            catch (...) { /* ignore bad items */ }
                                        }
                                        dna_out["node_stats"] = node_stats;
                                    }
                                    // If parsed is an object and already contains node_stats, use it directly
                                    else if (parsed.is_object() && parsed.contains("node_stats")) {
                                        // normalize to our preferred shape (ensure node entries are objects)
                                        nlohmann::json node_stats = nlohmann::json::object();
                                        for (auto it = parsed["node_stats"].begin(); it != parsed["node_stats"].end(); ++it) {
                                            const std::string key = it.key();
                                            auto val = it.value();
                                            if (val.is_object()) {
                                                double avg = val.value("avg_delay", 0.0);
                                                int cnt = val.value("count", 0);
                                                node_stats[key] = nlohmann::json::object();
                                                node_stats[key]["avg_delay"] = avg;
                                                node_stats[key]["count"] = cnt;
                                            }
                                            else {
                                                // if value isn't object, skip or set defaults
                                                node_stats[key] = nlohmann::json::object();
                                                node_stats[key]["avg_delay"] = 0.0;
                                                node_stats[key]["count"] = 0;
                                            }
                                        }
                                        dna_out["node_stats"] = node_stats;
                                    }
                                    // otherwise return the parsed object under "raw" and provide empty node_stats
                                    else {
                                        dna_out["raw"] = parsed;
                                        dna_out["node_stats"] = nlohmann::json::object();
                                    }
                                }
                                payload["dna_summary"] = dna_out;
                            }
                            catch (...) {
                                payload["dna_summary"] = nlohmann::json::object();
                            }



                            // 3) Evaluate monitors using copies (avoid long locks)
                            std::vector<Monitor> monitors_copy;
                            {
                                std::lock_guard<std::mutex> lg(g_monitors_mutex);
                                monitors_copy = g_monitors; // copy under monitor mutex
                            }

                            if (!monitors_copy.empty()) {
                                nlohmann::json alerts = nlohmann::json::array();

                                const long long ADD_PENALTY_MINOR = 2;
                                const long long ADD_PENALTY_MODERATE = 5;
                                const long long ADD_PENALTY_MAJOR = 10;

                                for (const auto& m : monitors_copy) {
                                    if (m.src < 0 || m.dst < 0 || m.src >= GRAPH.n || m.dst >= GRAPH.n) continue;

                                    // Use a local snapshot of the graph (copy)
                                    Graph baseline = GRAPH;
                                    Graph adjusted = GRAPH;

                                    // apply additive penalties per current incidents
                                    auto incs = STORE.get_incidents_copy(); // must be thread-safe and return copy
                                    for (const auto& inc : incs) {
                                        int node = inc.node_or_edge;
                                        if (node < 0 || node >= adjusted.n) continue;
                                        long long add = (inc.severity <= 1) ? ADD_PENALTY_MINOR :
                                            (inc.severity == 2) ? ADD_PENALTY_MODERATE : ADD_PENALTY_MAJOR;
                                        for (auto& e : adjusted.adj[node]) e.w += add;
                                        for (int u = 0; u < adjusted.n; ++u)
                                            for (auto& e : adjusted.adj[u])
                                                if (e.to == node) e.w += add;
                                    }

                                    // compute routes (using local graphs)
                                    auto rb = dijkstra(baseline, m.src);
                                    auto path_b = recover_path(rb, m.src, m.dst);
                                    long long eta_b = (rb.dist[m.dst] == INF) ? -1 : rb.dist[m.dst];

                                    auto ra = dijkstra(adjusted, m.src);
                                    auto path_a = recover_path(ra, m.src, m.dst);
                                    long long eta_a = (ra.dist[m.dst] == INF) ? -1 : ra.dist[m.dst];

                                    if (eta_b >= 0 && eta_a >= 0) {
                                        long long delta = eta_a - eta_b;
                                        if (delta >= m.threshold_minutes) {
                                            alerts.push_back({
                                                {"monitor_id", m.id},
                                                {"src", m.src},
                                                {"dst", m.dst},
                                                {"eta_base", eta_b},
                                                {"eta_adj", eta_a},
                                                {"delta", delta},
                                                {"timestamp", (long long)std::chrono::system_clock::to_time_t(std::chrono::system_clock::now())}
                                                });
                                        }
                                    }
                                } // for monitors

                                if (!alerts.empty()) payload["monitor_alerts"] = alerts;
                            } // if monitors

                            // 4) Decide whether to send (last_incidents_str is local per-connection so safe)
                            if (incidents_str != last_incidents_str) {
                                last_incidents_str = incidents_str;
                                const std::string msg = "data: " + payload.dump() + "\n\n";
                                if (!sink.is_writable()) break;
                                if (!sink.write(msg.c_str(), msg.size())) break;
                                heartbeat_counter = 0;
                            }
                            else {
                                // heartbeat roughly every 5 cycles (~10s)
                                if (++heartbeat_counter % 5 == 0) {
                                    const std::string hk = "data: {\"heartbeat\":true}\n\n";
                                    if (!sink.is_writable()) break;
                                    if (!sink.write(hk.c_str(), hk.size())) break;
                                }
                            }
                        }
                        catch (const std::exception& ex) {
                            // send error message but don't rethrow
                            try {
                                const std::string err = std::string("data: ") + nlohmann::json({ {"error", ex.what()} }).dump() + "\n\n";
                                if (sink.is_writable()) sink.write(err.c_str(), err.size());
                            }
                            catch (...) {}
                            break;
                        }

                        // re-lock and loop again (wait)
                        lk.lock();
                    } // while
                    return true;
                }
            );
            });


        std::cout << "Server starting on port " << port << " ...\n";
        svr.listen("0.0.0.0", port);
    }
