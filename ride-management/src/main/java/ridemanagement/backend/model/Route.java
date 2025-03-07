package ridemanagement.backend.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.Id;

import java.util.List;

@Entity
@Table(name = "routes")
public class Route {

    @jakarta.persistence.Id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Integer id;

    @Column(name = "route_name")
    private String routeName;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinTable(name = "route_waypoints", joinColumns = @JoinColumn(name = "route_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "point_id", referencedColumnName = "id"))
    private List<Point> waypoints;

    @Column(name = "expected_time", nullable = false)
    private double expectedTime;

    @Column(name = "length", nullable = false)
    private double length;

    @Column(name = "route_idx", nullable = false)
    private int routeIdx;


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public List<Point> getWaypoints() {
        return waypoints;
    }

    public void setWaypoints(List<Point> waypoints) {
        this.waypoints = waypoints;
    }

    public double getExpectedTime() {
        return expectedTime;
    }

    public void setExpectedTime(double expectedTime) {
        this.expectedTime = expectedTime;
    }

    public double getLength() {
        return length;
    }

    public void setLength(double length) {
        this.length = length;
    }

    public int getRouteIdx() {
        return routeIdx;
    }

    public void setRouteIdx(int routeIdx) {
        this.routeIdx = routeIdx;
    }
}