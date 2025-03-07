package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.repository.DriverRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    public List<DriverDTO> getAllDrivers() {
        List<Driver> drivers = driverRepository.findAll();
        return drivers.stream()
                .map(driver -> new DriverDTO(
                        driver.getId(),
                        driver.getEmail(),
                        driver.getFirstname(),
                        driver.getLastname(),
                        driver.isBlocked(),
                        driver.isAvailable(),
                        driver.getTimeOfLogin(),
                        driver.getHasFutureDrive()))
                .collect(Collectors.toList());
    }
}
