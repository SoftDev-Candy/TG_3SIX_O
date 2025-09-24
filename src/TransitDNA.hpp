// TransitDNA.h
#pragma once
#include <map>
#include <vector>
#include <string>
#include <mutex>
#include <chrono>
#include "json.hpp"

struct DNARecord {
    int node_or_edge;          // location of incident
    int severity;              // 1=minor, 2=moderate, 3=major
    long long observed_delay;  // minutes of extra delay observed
    long long timestamp;       // epoch seconds
};

class TransitDNA {
private:
    std::mutex mtx;
    std::vector<DNARecord> history;

    // Aggregated stats: key = (node_or_edge, severity)
    std::map<std::pair<int, int>, std::vector<long long>> delayBuckets;

public:
    void logIncidentImpact(int node_or_edge, int severity, long long delay_min);

    // Simple rule: moving average of past delays for this type+location
    long long predictDelay(int node_or_edge, int severity);

    // Optional: compute cascading "risk score"
    double computeRiskScore(int node_or_edge, int severity);

    // Export rules/statistics for frontend SSE
    std::string exportSummaryJSON();

    // 1️⃣ Predict extra delay for a path (vector of node indices)
    double predict_delay_for_path(const std::vector<int>& path);
    std::string summary_short();

};
