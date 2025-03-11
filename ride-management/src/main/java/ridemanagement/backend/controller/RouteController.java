package ridemanagement.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ridemanagement.backend.algorithm.RouteA;
import ridemanagement.backend.dto.PointDTO;
import ridemanagement.backend.model.Route;
import ridemanagement.backend.service.RouteService;

import java.util.List;

@RestController
@RequestMapping("/routes")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @GetMapping("/{routeId}/points")
    public List<PointDTO> getRoutePoints(@PathVariable Integer routeId) {
        return routeService.getRoutePoints(routeId);
    }

    @GetMapping("/shortest-paths")
    public ResponseEntity<List<RouteA>> getShortestPaths(@RequestParam("start") String start, @RequestParam("end") String end) {
        List<RouteA> shortestPaths = routeService.findShortestPaths(start, end);
        return ResponseEntity.ok(shortestPaths);
    }


}