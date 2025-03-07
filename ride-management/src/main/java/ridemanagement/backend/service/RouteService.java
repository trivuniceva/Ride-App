package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.PointDTO;
import ridemanagement.backend.model.Route;
import ridemanagement.backend.repository.RouteRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    public List<PointDTO> getRoutePoints(Integer routeId) {
        Route route = routeRepository.findById(routeId).orElse(null);
        if (route != null) {
            return route.getWaypoints().stream()
                    .map(point -> new PointDTO(point.getId(), point.getLatitude(), point.getLongitude()))
                    .collect(Collectors.toList());
        }
        return null;
    }
}
