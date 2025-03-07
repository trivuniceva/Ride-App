package ridemanagement.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.dto.PointDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.service.RideService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/rides")
public class RideController {

    @Autowired
    private RideService rideService;

    @GetMapping("/active")
    public List<DriverDTO> getActiveDrivers() {
        List<Driver> drivers = rideService.getAllDrivers().stream()
                .filter(Driver::isAvailable)
                .collect(Collectors.toList());

        return drivers.stream()
                .map(rideService::convertToDTO) // Koristimo metodu iz RideService
                .collect(Collectors.toList());
    }

}
