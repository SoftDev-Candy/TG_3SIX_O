#include "store.hpp"
#include <chrono>

Store::Store() : nextTrip_(1), nextIncident_(1) {}

int Store::add_trip(const Trip& t) {
    std::lock_guard<std::mutex> g(mutex_);
    int id = nextTrip_++;
    Trip copy = t;
    copy.id = id;
    trips_[id] = copy;
    return id;
}

int Store::add_incident(const Incident& inc) {
    std::lock_guard<std::mutex> g(mutex_);
    int id = nextIncident_++;
    Incident copy = inc;
    copy.id = id;
    if (copy.timestamp == 0) copy.timestamp = (long long)std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    incidents_[id] = copy;
    return id;
}

nlohmann::json Store::list_incidents() {
    std::lock_guard<std::mutex> g(mutex_);
    nlohmann::json a = nlohmann::json::array();
    for (auto& p : incidents_) {
        a.push_back({
            {"id", p.second.id},
            {"node_or_edge", p.second.node_or_edge},
            {"description", p.second.description},
            {"timestamp", p.second.timestamp}
            });
    }
    return a;
}

std::vector<Incident> Store::get_incidents_copy() {
    std::lock_guard<std::mutex> g(mutex_);
    std::vector<Incident> out;
    out.reserve(incidents_.size());
    for (auto& p : incidents_) out.push_back(p.second);
    return out;
}
