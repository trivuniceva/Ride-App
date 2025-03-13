package ridemanagement.backend.algorithm;

import java.util.List;

public class RouteA {
    private List<String> path;
    private int distance;

    public RouteA(List<String> path, int distance) {
        this.path = path;
        this.distance = distance;
    }

    public List<String> getPath() {
        return path;
    }

    public int getDistance() {
        return distance;
    }
}
