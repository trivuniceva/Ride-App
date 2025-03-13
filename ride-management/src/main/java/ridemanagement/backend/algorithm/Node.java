package ridemanagement.backend.algorithm;

import java.util.Comparator;

public class Node {
    String name;
    int distance;

    public Node(String name, int distance) {
        this.name = name;
        this.distance = distance;
    }

    public String getName() {
        return name;
    }

    public int getDistance() {
        return distance;
    }

    // Poredjenje čvorova prema udaljenosti, potrebna za PriorityQueue
    public static final Comparator<Node> COMPARE_BY_DISTANCE = Comparator.comparingInt(Node::getDistance);
}
