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
    int node_or_edge = 0; // using node id for demo
    std::string description;
    long long timestamp = 0;
};

class Store {
public:
    Store();
    int add_trip(const Trip& t);
    int add_incident(const Incident& inc);
    nlohmann::json list_incidents();
    std::vector<Incident> get_incidents_copy();
private:
    std::mutex mutex_;
    int nextTrip_;
    int nextIncident_;
    std::unordered_map<int, Trip> trips_;
    std::unordered_map<int, Incident> incidents_;
};
