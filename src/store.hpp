#pragma once
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>
#include "json.hpp"
#include "dijkstra.hpp"

struct Trip {
    int id = 0;
    int src = 0;
    int dst = 0;
    std::string user;
    long long start_time = 0;
    bool active = true;
};

struct Incident {
    int id = 0;
    int node_or_edge = 0; // node id for demo
    std::string description;
    long long timestamp = 0;     // creation time (epoch)
    int severity = 1;            // 1=minor,2=moderate,3=major
    long long expires_at = 0;    // epoch when this incident should be removed (0 = never)
};

// Helper for consistent JSON conversion
nlohmann::json to_json(const Incident& inc);

class Store {
public:
    Store();
    int add_trip(const Trip& t);
    int add_incident(const Incident& inc);

    // Returns only active (non-expired) incidents as JSON array (by value, thread-safe).
    nlohmann::json list_incidents();

    // Returns safe vector copy of active incidents.
    std::vector<Incident> get_incidents_copy();

    // Purges expired incidents from storage (thread-safe).
    void remove_expired();

private:
    std::mutex mutex_;
    int nextTrip_;
    int nextIncident_;
    std::unordered_map<int, Trip> trips_;
    std::unordered_map<int, Incident> incidents_;
};
