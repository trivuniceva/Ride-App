package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.Ride;
import ridemanagement.backend.repository.DriverRepository;
import ridemanagement.backend.repository.RideRepository;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Service
public class RideService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DriverService driverService;

    @Autowired
    private RideRepository rideRepository;

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public DriverDTO convertToDTO(Driver driver) {
        return driverService.convertToDTO(driver);
    }

    public List<Ride> getRideHistoryForUser(Long userId, String userRole, String userEmail) {
        if ("DRIVER".equalsIgnoreCase(userRole)) {
            return rideRepository.findByDriverIdOrderByCreatedAtDesc(userId);
        } else if ("REGISTERED_USER".equalsIgnoreCase(userRole) || "REQUESTOR".equalsIgnoreCase(userRole)) {
            return rideRepository.findByRequestorEmailOrderByCreatedAtDesc(userEmail);
        }
        return List.of();
    }

        public List<Ride> getAllRidesSortedByCreatedAtDesc() {
        return rideRepository.findAllByOrderByCreatedAtDesc();
    }
}
