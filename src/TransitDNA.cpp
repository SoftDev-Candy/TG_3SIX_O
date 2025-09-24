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

long long TransitDNA::predictDelay(int node_or_edge, int severity) {
    std::lock_guard<std::mutex> lock(mtx);
    auto it = delayBuckets.find({ node_or_edge, severity });
    if (it == delayBuckets.end() || it->second.empty()) return 0;

    auto& v = it->second;
    long long sum = std::accumulate(v.begin(), v.end(), 0LL);
    return sum / v.size();
}

double TransitDNA::computeRiskScore(int node_or_edge, int severity) {
    // Simple heuristic: higher severity = higher risk, scaled by variance
    std::lock_guard<std::mutex> lock(mtx);
    auto it = delayBuckets.find({ node_or_edge, severity });
    if (it == delayBuckets.end() || it->second.empty()) return 0.2 * severity;

    double avg = predictDelay(node_or_edge, severity);
    double risk = std::min(1.0, (avg / 20.0) + (0.3 * severity));
    return risk;
}

std::string TransitDNA::exportSummaryJSON() {
    std::lock_guard<std::mutex> lock(mtx);
    nlohmann::json j;
    for (auto& [key, delays] : delayBuckets) {
        int node = key.first;
        int sev = key.second;
        if (!delays.empty()) {
            long long avg = std::accumulate(delays.begin(), delays.end(), 0LL) / delays.size();
            j.push_back({ {"node", node}, {"severity", sev}, {"avg_delay", avg} });
        }
    }
    return j.dump();
}

double TransitDNA::predict_delay_for_path(const std::vector<int>& path)
{
    // Simple stub: just return 0 for now
    return 0.0;
}

std::string TransitDNA::summary_short()
{
    // Simple stub: return "ok" for now
    return "ok";
}
