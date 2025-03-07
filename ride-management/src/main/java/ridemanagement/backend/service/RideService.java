package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.repository.DriverRepository;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Service
public class RideService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DriverService driverService;

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public DriverDTO convertToDTO(Driver driver) {
        return driverService.convertToDTO(driver);
    }


}
