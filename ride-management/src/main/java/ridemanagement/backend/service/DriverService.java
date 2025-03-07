package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.repository.DriverRepository;

import java.util.List;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;


    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }
}
