#include "dijkstra.hpp"
#include <queue>
#include <algorithm>

DijkstraResult dijkstra(const Graph& g, int src) {
    int n = g.n;
    std::vector<long long> dist(n, INF);
    std::vector<int> prev(n, -1);
    if (src < 0 || src >= n) return { dist, prev };
    dist[src] = 0;
    using pli = std::pair<long long, int>;
    std::priority_queue<pli, std::vector<pli>, std::greater<pli>> pq;
    pq.push({ 0, src });
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d != dist[u]) continue;
        for (auto& e : g.adj[u]) {
            if (dist[e.to] > dist[u] + e.w) {
                dist[e.to] = dist[u] + e.w;
                prev[e.to] = u;
                pq.push({ dist[e.to], e.to });
            }
        }
    }
    return { dist, prev };
}

std::vector<int> recover_path(const DijkstraResult& res, int src, int dest) {
    std::vector<int> path;
    if (dest < 0 || dest >= (int)res.dist.size()) return path;
    if (res.dist[dest] == INF) return path;
    for (int v = dest; v != -1; v = res.prev[v]) path.push_back(v);
    std::reverse(path.begin(), path.end());
    return path;
}
