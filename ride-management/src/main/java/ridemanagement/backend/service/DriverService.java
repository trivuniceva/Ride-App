package ridemanagement.backend.service;

import com.rideapp.usermanagement.dto.BlockUserRequestDTO;
import com.rideapp.usermanagement.model.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.dto.PointDTO;
import ridemanagement.backend.dto.RideRequestDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.repository.DriverRepository;

import jakarta.transaction.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PointService pointService;

    public Driver findEligibleDriver(RideRequestDTO rideRequestDTO) {
        return findNextEligibleDriver(rideRequestDTO, null);
    }

    public Driver findNextEligibleDriver(RideRequestDTO rideRequestDTO, Set<Long> refusedDriverIds) {
        List<Driver> allDrivers = driverRepository.findAll();

        if (allDrivers.isEmpty()) {
            throw new NoSuchElementException("Nema prijavljenih vozaca u sistemu. Voznja se odbija.");
        }

        PointDTO rideStartLocationDTO = rideRequestDTO.getStartLocation();
        if (rideStartLocationDTO == null) {
            if (rideRequestDTO.getStartLocation() != null && rideRequestDTO.getStartLocation().getId() != null) {
                Point startPoint = pointService.findById(rideRequestDTO.getStartLocation().getId())
                        .orElseThrow(() -> new NoSuchElementException("Start location point not found for ID: " + rideRequestDTO.getStartLocation().getId()));
                rideStartLocationDTO = new PointDTO(startPoint.getId(), startPoint.getLatitude(), startPoint.getLongitude());
            } else {
                throw new IllegalArgumentException("Koordinate početne lokacije (startLocation) nedostaju u zahtevu za vožnju.");
            }
        }

        List<Driver> availableDriversConsidered = allDrivers.stream()
                .filter(driver -> refusedDriverIds == null || !refusedDriverIds.contains(driver.getId()))
                .collect(Collectors.toList());

        if (availableDriversConsidered.isEmpty()) {
            throw new NoSuchElementException("Nema više vozača za razmatranje (svi su odbili ili nema dostupnih).");
        }

        List<Driver> trulyAvailableDrivers = getTrulyAvailableDrivers(availableDriversConsidered);

        if (!trulyAvailableDrivers.isEmpty()) {
            return findClosestDriverByLocation(trulyAvailableDrivers, rideStartLocationDTO);
        }

        List<Driver> busyDriversWithoutFutureRides = getBusyDriversWithoutFutureRides(availableDriversConsidered);

        if (!busyDriversWithoutFutureRides.isEmpty()) {
            return findClosestDriverByLocation(busyDriversWithoutFutureRides, rideStartLocationDTO);
        }

        throw new NoSuchElementException("Nema više dostupnih vozača za ovu vožnju.");
    }

    private List<Driver> getAllDriversFromRepository() {
        return driverRepository.findAll();
    }

    private List<Driver> getTrulyAvailableDrivers(List<Driver> drivers) {
        return drivers.stream()
                .filter(Driver::isAvailable)
                .filter(driver -> !driver.getHasFutureDrive())
                .collect(Collectors.toList());
    }

    private List<Driver> getBusyDriversWithoutFutureRides(List<Driver> drivers) {
        return drivers.stream()
                .filter(driver -> !driver.isAvailable())
                .filter(driver -> !driver.getHasFutureDrive())
                .collect(Collectors.toList());
    }

    private Driver findClosestDriverByLocation(List<Driver> drivers, PointDTO targetLocation) {
        if (drivers.isEmpty()) {
            throw new NoSuchElementException("No drivers in the list to find the closest from.");
        }
        return drivers.stream()
                .min(Comparator.comparingDouble(driver ->
                        calculateDistance(driver.getLocation(), targetLocation)))
                .orElseThrow(() -> new NoSuchElementException("Failed to find closest driver."));
    }

    private double calculateDistance(Point driverLocation, PointDTO targetLocation) {
        if (driverLocation == null || targetLocation == null) {
            return Double.MAX_VALUE;
        }
        double dx = driverLocation.getLatitude() - targetLocation.getLatitude();
        double dy = driverLocation.getLongitude() - targetLocation.getLongitude();
        return Math.sqrt(dx * dx + dy * dy);
    }

    public List<DriverDTO> getAllDrivers() {
        List<Driver> drivers = driverRepository.findAll();
        return drivers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DriverDTO blockDriver(BlockUserRequestDTO request) {
        Optional<Driver> driverOptional = driverRepository.findById(request.getUserId());
        if (driverOptional.isEmpty()) {
            throw new NoSuchElementException("Driver not found with ID: " + request.getUserId());
        }

        Driver driver = driverOptional.get();

        if (driver.getUserRole().equals(UserRole.ADMINISTRATOR)) {
            throw new IllegalArgumentException("Administrators cannot be blocked/deactivated.");
        }

        driver.setActive(!request.getIsBlocked());
        driver.setBlockNote(request.getBlockNote());

        if (!driver.isActive()) {
            driver.setAvailable(false);
            driver.setHasFutureDrive(false);
        }

        driverRepository.save(driver);
        return convertToDTO(driver);
    }

    public DriverDTO convertToDTO(Driver driver) {
        PointDTO pointDTO = null;
        Point location = driver.getLocation();
        if (location != null) {
            pointDTO = new PointDTO(location.getId(), location.getLatitude(), location.getLongitude());
        }

        return new DriverDTO(
                driver.getId(),
                driver.getEmail(),
                driver.getFirstname(),
                driver.getLastname(),
                driver.isActive(),
                driver.getBlockNote(),
                driver.isAvailable(),
                driver.getTimeOfLogin(),
                driver.getHasFutureDrive(),
                pointDTO
        );
    }
}