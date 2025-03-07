package ridemanagement.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ridemanagement.backend.dto.PointDTO;
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
}