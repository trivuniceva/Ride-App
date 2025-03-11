package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.algorithm.RouteA;
import ridemanagement.backend.algorithm.RouteAlgorithm;
import ridemanagement.backend.dto.PointDTO;
import ridemanagement.backend.model.Route;
import ridemanagement.backend.repository.RouteRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private RouteAlgorithm routeAlgorithm;

    public List<PointDTO> getRoutePoints(Integer routeId) {
        Route route = routeRepository.findById(routeId).orElse(null);
        if (route != null) {
            return route.getWaypoints().stream()
                    .map(point -> new PointDTO(point.getId(), point.getLatitude(), point.getLongitude()))
                    .collect(Collectors.toList());
        }
        return null;
    }

    public List<RouteA> findShortestPaths(String start, String end) {
        List<RouteA> paths = new ArrayList<>();
        // Pozivanje algoritma za tri različita puta koristeći novu klasu RouteA
        paths.add(routeAlgorithm.findShortestPath(start, end));
        paths.add(routeAlgorithm.findAlternativePath(start, end));
        paths.add(routeAlgorithm.findAnotherAlternativePath(start, end));
        return paths;
    }
}
