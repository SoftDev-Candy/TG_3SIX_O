#include "server.hpp"
#include <iostream>
#include <thread>
#include <chrono>

Store STORE;

// Build a small demo graph (undirected with symmetrical edges for simplicity)
Graph build_demo_graph() {
    Graph g(6);
    // edges with weights (minutes)
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

    // CORS helper (call this at the start of every handler)
    auto set_cors = [](httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        };

    // Preflight handler for all endpoints
    svr.Options(".*", [](const httplib::Request& /*req*/, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 200;
        });

    // /status
    svr.Get("/status", [&set_cors](const httplib::Request&, httplib::Response& res) {
        set_cors(res);
        nlohmann::json j = { {"status","ok"} };
        res.set_content(j.dump(), "application/json");
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
            nlohmann::json r = { {"trip_id", id} };
            res.set_content(r.dump(), "application/json");
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
            nlohmann::json r = { {"incident_id", id} };
            res.set_content(r.dump(), "application/json");
            std::cout << "[report] id=" << id << " node=" << inc.node_or_edge << " desc=" << inc.description << "\n";
        }
        catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json({ {"error", e.what()} }).dump(), "application/json");
        }
        });

    // POST /simulate { "node":1, "desc":"accident", "delay_ms":0 }
    svr.Post("/simulate", [&set_cors](const httplib::Request& req, httplib::Response& res) {
        set_cors(res);
        try {
            auto body = nlohmann::json::parse(req.body);
            int node = body.value("node", 0);
            std::string desc = body.value("desc", std::string("simulated incident"));
            int delay_ms = body.value("delay_ms", 0);

            nlohmann::json r = { {"scheduled", true}, {"node", node}, {"delay_ms", delay_ms} };
            res.set_content(r.dump(), "application/json");
            std::cout << "[simulate] scheduled node=" << node << " delay_ms=" << delay_ms << " desc=" << desc << "\n";

            // schedule the incident asynchronously (capture delay_ms)
            std::thread([node, desc, delay_ms]() {
                if (delay_ms > 0) std::this_thread::sleep_for(std::chrono::milliseconds(delay_ms));
                else std::this_thread::sleep_for(std::chrono::milliseconds(100));
                Incident inc;
                inc.node_or_edge = node;
                inc.description = desc;
                int id = STORE.add_incident(inc);
                std::cout << "[simulate] injected incident id=" << id << " node=" << node << "\n";
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
        auto j = STORE.list_incidents();
        res.set_content(j.dump(), "application/json");
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

            // 1) baseline: copy original GRAPH as baseline_graph
            Graph baseline = GRAPH; // shallow copy of structure (adj lists)
            // 2) adjusted: make a copy and increase weights near incidents
            Graph adjusted = GRAPH;

            // Choose how much an incident increases adjacent travel time (tune for demo)
            const double INCIDENT_WEIGHT_MULTIPLIER = 2.0; // 2x slower for affected edges

            // Get incidents (thread-safe copy)
            auto incidents = STORE.get_incidents_copy();
            for (const auto& inc : incidents) {
                int node = inc.node_or_edge;
                if (node < 0 || node >= adjusted.n) continue;
                // Increase weight of every edge *from* the affected node
                for (auto& e : adjusted.adj[node]) {
                    e.w = static_cast<long long>(std::ceil(e.w * INCIDENT_WEIGHT_MULTIPLIER));
                }
                // Optionally increase weights of edges *to* the node as well (for undirected graph)
                for (int u = 0; u < adjusted.n; ++u) {
                    for (auto& e : adjusted.adj[u]) {
                        if (e.to == node) {
                            e.w = static_cast<long long>(std::ceil(e.w * INCIDENT_WEIGHT_MULTIPLIER));
                        }
                    }
                }
            }

            // Run Dijkstra on baseline and adjusted
            auto res_base = dijkstra(baseline, src);
            auto path_base = recover_path(res_base, src, dst);
            long long eta_base = (res_base.dist[dst] == INF) ? -1 : res_base.dist[dst];

            auto res_adj = dijkstra(adjusted, src);
            auto path_adj = recover_path(res_adj, src, dst);
            long long eta_adj = (res_adj.dist[dst] == INF) ? -1 : res_adj.dist[dst];

            // Build response
            nlohmann::json r;
            r["baseline"] = { {"path", path_base}, {"eta_minutes", eta_base} };
            r["adjusted"] = { {"path", path_adj}, {"eta_minutes", eta_adj} };
            // recommendation: which is better?
            if (eta_base >= 0 && eta_adj >= 0) {
                if (eta_adj > eta_base) {
                    r["recommendation"] = "baseline_faster";
                }
                else if (eta_adj < eta_base) {
                    r["recommendation"] = "adjusted_faster";
                }
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

    // GET /events  (Server-Sent Events)
    svr.Get("/events", [&set_cors](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Content-Type", "text/event-stream");
        res.set_header("Cache-Control", "no-cache");
        res.set_header("Connection", "keep-alive");

        // keep connection open
        res.set_chunked_content_provider(
            "text/event-stream",
            [](size_t /*offset*/, httplib::DataSink& sink) {
                while (true) {
                    // Get incidents snapshot
                    
                    auto incidents = STORE.get_incidents_copy();
                    nlohmann::json arr = nlohmann::json::array();
                    for (const auto& inc : incidents) {
                        arr.push_back({
                            {"id", inc.id},
                            {"node_or_edge", inc.node_or_edge},
                            {"description", inc.description},
                            {"timestamp", inc.timestamp}
                            });
                    }

                    nlohmann::json j;
                    j["incidents"] = arr;

                    // SSE format: "data: <json>\n\n"
                    std::string msg = "data: " + j.dump() + "\n\n";
                    sink.write(msg.c_str(), msg.size());

                    std::this_thread::sleep_for(std::chrono::seconds(2));
                }
                return true;
            }
        );
        });



    std::cout << "Server starting on port " << port << " ...\n";
    svr.listen("0.0.0.0", port);
}
