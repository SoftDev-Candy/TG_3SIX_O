#include "TransitDNA.hpp"
#include <numeric>

void TransitDNA::logIncidentImpact(int node_or_edge, int severity, long long delay_min) {
    std::lock_guard<std::mutex> lock(mtx);
    DNARecord rec{ node_or_edge, severity, delay_min,
                    std::chrono::system_clock::to_time_t(std::chrono::system_clock::now()) };
    history.push_back(rec);

    delayBuckets[{node_or_edge, severity}].push_back(delay_min);
    if (delayBuckets[{node_or_edge, severity}].size() > 20) {
        delayBuckets[{node_or_edge, severity}].erase(delayBuckets[{node_or_edge, severity}].begin());
    }
}

static nlohmann::json to_json(const DNARecord& r) {
    return {
        {"node_or_edge", r.node_or_edge},
        {"severity", r.severity},
        {"observed_delay", r.observed_delay},
        {"timestamp", r.timestamp}
    };
}

long long TransitDNA::predictDelay(int node_or_edge, int severity) {
    std::lock_guard<std::mutex> lock(mtx);
    auto it = delayBuckets.find({ node_or_edge, severity });
    if (it == delayBuckets.end() || it->second.empty()) return 0;

    auto& v = it->second;
    long long sum = std::accumulate(v.begin(), v.end(), 0LL);
    return sum / static_cast<long long>(v.size());
}

double TransitDNA::computeRiskScore(int node_or_edge, int severity) {
    // Simple heuristic: higher severity = higher risk, scaled by variance
    
   /* std::lock_guard<std::mutex> lock(mtx);
    auto it = delayBuckets.find({ node_or_edge, severity });
    if (it == delayBuckets.end() || it->second.empty()) return 0.2 * severity;*/

   //Mentor said no need to lock here so we can use predict delay which will take the mutex//

    auto avg_ll = predictDelay(node_or_edge, severity);
    if (avg_ll == 0) return 0.2 * severity;

    double avg = static_cast<double>(avg_ll);
    double risk = std::min(1.0, (avg / 20.0) + (0.3 * severity));
    return risk;

}

std::string TransitDNA::exportSummaryJSON() {
    std::lock_guard<std::mutex> lock(mtx);
    nlohmann::json out;
    nlohmann::json node_stats = nlohmann::json::object();

    // aggregate per node irrespective of severity for summary view
    std::map<int, std::pair<long long, int>> agg; // node -> (sum, count)
    for (auto& kv : delayBuckets) {
        int node = kv.first.first;
        auto& delays = kv.second;
        if (delays.empty()) continue;
        long long sum = std::accumulate(delays.begin(), delays.end(), 0LL);
        agg[node].first += sum;
        agg[node].second += static_cast<int>(delays.size());
    }

    for (auto& p : agg) {
        int node = p.first;
        long long sum = p.second.first;
        int count = p.second.second;
        double avg = (count > 0) ? (double)sum / (double)count : 0.0;
        node_stats[std::to_string(node)] = {
            {"avg_delay", avg},
            {"count", count}
        };
    }

    out["node_stats"] = node_stats;
    out["history_count"] = static_cast<int>(history.size());
    return out.dump();
}


double TransitDNA::predict_delay_for_path(const std::vector<int>& path)
{
    // Conservative estimate: for each node in the path, take the worst
    // (max) predicted delay across severities 1..3, then sum them.
    std::lock_guard<std::mutex> lock(mtx);
    double total = 0.0;

    for (int node : path) {
        if (node < 0) continue;
        long long best = 0;
        // check all severities and take max observed moving average
        for (int sev = 1; sev <= 3; ++sev) {
            auto it = delayBuckets.find({ node, sev });
            if (it == delayBuckets.end() || it->second.empty()) continue;
            // compute average for this bucket (integer division OK here)
            long long sum = 0;
            for (auto d : it->second) sum += d;
            long long avg = sum / static_cast<long long>(it->second.size());
            if (avg > best) best = avg;
        }
        total += static_cast<double>(best);
    }

    return total; // minutes (double)
}


std::string TransitDNA::summary_short()
{
    std::lock_guard<std::mutex> lock(mtx);
    return "DNA rules=" + std::to_string(delayBuckets.size()) +
        ", history=" + std::to_string(history.size());
}

