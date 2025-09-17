#pragma once
#include <vector>
#include <limits>
#include <utility>

using NodeId = int;
const long long INF = std::numeric_limits<long long>::max();

struct Edge { NodeId to; long long w; };

struct Graph {
    int n = 0;
    std::vector<std::vector<Edge>> adj;
    Graph() = default;
    Graph(int n_) : n(n_), adj(n_) {}
    void add_edge(int u, int v, long long w) {
        if (u >= (int)adj.size() || v >= (int)adj.size()) return;
        adj[u].push_back({ v,w });
    }
};

struct DijkstraResult {
    std::vector<long long> dist;
    std::vector<int> prev;
};

DijkstraResult dijkstra(const Graph& g, int src);
std::vector<int> recover_path(const DijkstraResult& res, int src, int dest);
