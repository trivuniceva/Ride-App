package ridemanagement.backend.algorithm;

import java.util.*;

public class Graph {
    private Map<String, List<Edge>> adjList;

    public Graph() {
        adjList = new HashMap<>();
    }

    public void addNode(String node) {
        adjList.putIfAbsent(node, new ArrayList<>());
    }

    public void addEdge(String from, String to, int weight) {
        adjList.get(from).add(new Edge(to, weight));
        adjList.get(to).add(new Edge(from, weight)); // Ako je graf nesmeran
    }

    public List<String> getNodes() {
        return new ArrayList<>(adjList.keySet());
    }

    public List<Edge> getEdges(String node) {
        return adjList.getOrDefault(node, Collections.emptyList());
    }
}
