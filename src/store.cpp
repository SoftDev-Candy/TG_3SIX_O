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
    auto now = (long long)std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    for (auto it = incidents_.begin(); it != incidents_.end(); ) {
        const Incident& inc = it->second;
        if (inc.expires_at != 0 && inc.expires_at <= now) {
            // expired -> remove
            it = incidents_.erase(it);
            continue;
        }
        a.push_back({
            {"id", inc.id},
            {"node_or_edge", inc.node_or_edge},
            {"description", inc.description},
            {"timestamp", inc.timestamp},
            {"severity", inc.severity},
            {"expires_at", inc.expires_at}
            });
        ++it;
    }
    return a;
}

std::vector<Incident> Store::get_incidents_copy() {
    std::lock_guard<std::mutex> g(mutex_);
    std::vector<Incident> out;
    auto now = (long long)std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    for (auto& p : incidents_) {
        const Incident& inc = p.second;
        if (inc.expires_at != 0 && inc.expires_at <= now) continue;
        out.push_back(inc);
    }
    return out;
}

void Store::remove_expired() {
    std::lock_guard<std::mutex> g(mutex_);
    auto now = (long long)std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    for (auto it = incidents_.begin(); it != incidents_.end(); ) {
        if (it->second.expires_at != 0 && it->second.expires_at <= now) {
            it = incidents_.erase(it);
        }
        else ++it;
    }
}
