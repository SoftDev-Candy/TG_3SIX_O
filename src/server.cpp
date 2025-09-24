    #include "server.hpp"
    #include <iostream>
    #include <thread>
    #include <chrono>
    #include <cmath>   // for std::ceil vimp forgot add it last time i'm dum dum 
    #include <condition_variable>
    #include <atomic>


// Simple monitor structure
struct Monitor {
    int id;
    int src, dst;
    int threshold_minutes;
    long long created_at;
};
static std::mutex g_mon_mutex;
static std::vector<Monitor> g_monitors;
static int g_next_monitor_id = 1;

static std::mutex g_events_mutex;
static std::condition_variable g_events_cv;
static std::atomic<bool> g_events_flag{ false };

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

    // POST /monitor
        svr.Post("/monitor", [&set_cors](const httplib::Request& req, httplib::Response& res) {
            set_cors(res);
            try {
                auto body = nlohmann::json::parse(req.body);
                int src = body.value("src", 0);
                int dst = body.value("dst", 0);
                int threshold = body.value("threshold", 3);
                Monitor m;
                m.id = g_next_monitor_id++;
                m.src = src;
                m.dst = dst;
                m.threshold_minutes = threshold;
                m.created_at = (long long)std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
                {
                    std::lock_guard<std::mutex> lg(g_mon_mutex);
                    g_monitors.push_back(m);
                }
                res.set_content(nlohmann::json({ {"monitor_id", m.id} }).dump(), "application/json");
            }
            catch (const std::exception& e) {
                res.status = 400;
                res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
            }
            });

        // GET /monitors
        svr.Get("/monitors", [&set_cors](const httplib::Request&, httplib::Response& res) {
            set_cors(res);
            nlohmann::json arr = nlohmann::json::array();
            {
                std::lock_guard<std::mutex> lk(g_mon_mutex);
                for (auto& m : g_monitors) {
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

                Graph baseline = GRAPH;
                Graph adjusted = GRAPH;

                const double INCIDENT_WEIGHT_MULTIPLIER = 2.0;

                auto incidents = STORE.get_incidents_copy();
                // for each incident:
                for (const auto& inc : incidents) {
                    int node = inc.node_or_edge;
                    int severity = inc.severity;
                    double multiplier = 1.0;
                    if (severity <= 1) multiplier = 1.5;      // minor : 1.5x
                    else if (severity == 2) multiplier = 2.2; // moderate : 2.2x
                    else multiplier = 3.0;                   // major : 3x

                    // increase outgoing
                    for (auto& e : adjusted.adj[node]) {
                        e.w = static_cast<long long>(std::ceil(e.w * multiplier));
                    }
                    // increase incoming
                    for (int u = 0; u < adjusted.n; ++u) {
                        for (auto& e : adjusted.adj[u]) {
                            if (e.to == node) e.w = static_cast<long long>(std::ceil(e.w * multiplier));
                        }
                    }
                }
                g_events_flag.store(true);
                g_events_cv.notify_all();


                auto res_base = dijkstra(baseline, src);
                auto path_base = recover_path(res_base, src, dst);
                long long eta_base = (res_base.dist[dst] == INF) ? -1 : res_base.dist[dst];

                auto res_adj = dijkstra(adjusted, src);
                auto path_adj = recover_path(res_adj, src, dst);
                long long eta_adj = (res_adj.dist[dst] == INF) ? -1 : res_adj.dist[dst];

                if (eta_base >= 0 && eta_adj >= 0 && eta_adj > eta_base) {
                    long long diff = eta_adj - eta_base;
                    if (!incidents.empty()) {
                        DNA.logIncidentImpact(
                            incidents[0].node_or_edge,
                            incidents[0].severity,
                            diff
                        );
                    }
                }

                nlohmann::json r;
                r["baseline"] = { {"path", path_base}, {"eta_minutes", eta_base} };
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
                res.set_content(r.dump(), "application/json");
            }
            catch (const std::exception& e) {
                res.status = 400;
                res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
            }
            });

        svr.Get("/dna", [&set_cors](const httplib::Request&, httplib::Response& res) {
            set_cors(res);
            res.set_content(DNA.exportSummaryJSON(), "application/json");
            });

        // New endpoint to register monitor
        svr.Post("/monitor", [&set_cors](const httplib::Request& req, httplib::Response& res) {
            set_cors(res);
            try {
                auto body = nlohmann::json::parse(req.body);
                int src = body.value("src", 0);
                int dst = body.value("dst", 0);
                int threshold = body.value("threshold", 3);
                Monitor m; m.id = g_next_monitor_id++; m.src = src; m.dst = dst; m.threshold_minutes = threshold;
                {
                    std::lock_guard<std::mutex> lg(g_mon_mutex);
                    g_monitors.push_back(m);
                }
                nlohmann::json r = { {"monitor_id", m.id} };
                res.set_content(r.dump(), "application/json");
            }
            catch (const std::exception& e) {
                res.status = 400;
                res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
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



        // GET /events  (Server-Sent Events)
      // GET /events  (Server-Sent Events)
        svr.Get("/events", [&set_cors, &GRAPH](const httplib::Request&, httplib::Response& res) {
            set_cors(res);
            res.set_header("Content-Type", "text/event-stream");
            res.set_header("Cache-Control", "no-cache");
            res.set_header("Connection", "keep-alive");

            res.set_chunked_content_provider(
                "text/event-stream",
                [&GRAPH](size_t /*offset*/, httplib::DataSink& sink) {
                    // send initial greeting
                    std::string init = "event: connected\ndata: {\"status\":\"ok\"}\n\n";
                    sink.write(init.c_str(), init.size());

                    std::unique_lock<std::mutex> lk(g_events_mutex);
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

                    while (sink.is_writable()) {
                        g_events_cv.wait_for(lk, std::chrono::seconds(2));

                        nlohmann::json j;
                        j["incidents"] = STORE.list_incidents();

                        // Optional: DNA summary
                        try { j["dna_summary"] = nlohmann::json::parse(DNA.exportSummaryJSON()); }
                        catch (...) { j["dna_summary"] = nlohmann::json::object(); }

                        // Alerts for monitors
                        std::vector<Monitor> monitors_copy;
                        {
                            std::lock_guard<std::mutex> lg(g_mon_mutex); // correct mutex
                            monitors_copy = g_monitors;
                        }


                        std::string msg = "data: " + j.dump() + "\n\n";
                        if (!sink.is_writable()) break;
                        sink.write(msg.c_str(), msg.size());
                    }
                    return true;
                }
            );
            });


        std::cout << "Server starting on port " << port << " ...\n";
        svr.listen("0.0.0.0", port);
    }
