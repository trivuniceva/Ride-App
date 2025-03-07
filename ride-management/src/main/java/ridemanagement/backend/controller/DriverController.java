package ridemanagement.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.service.DriverService;

import java.util.List;

@RestController
@RequestMapping("/drivers")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @GetMapping
    public List<DriverDTO> getDrivers() {
        System.out.println("elooo");
        System.out.println(driverService.getAllDrivers());
        return driverService.getAllDrivers();
    }

}
