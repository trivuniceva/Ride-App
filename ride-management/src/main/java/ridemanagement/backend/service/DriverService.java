package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.dto.PointDTO;
import ridemanagement.backend.dto.RideRequestDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.repository.DriverRepository;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    public Driver findEligibleDriver(RideRequestDTO rideRequestDTO) {
        List<Driver> allDrivers = getAllDriversFromRepository();

        if (allDrivers.isEmpty()) {
            System.out.println("Sistem: Nema prijavljenih vozaca u sistemu.");
            throw new NoSuchElementException("Nema prijavljenih vozaca u sistemu. Voznja se odbija.");
        }

        PointDTO rideStartLocation = rideRequestDTO.getStartLocation();
        if (rideStartLocation == null) {
            System.out.println("Sistem: Koordinate početne lokacije (startLocation) nedostaju u zahtevu za vožnju.");
            throw new IllegalArgumentException("Koordinate početne lokacije (startLocation) nedostaju u zahtevu za vožnju.");
        }

        List<Driver> trulyAvailableDrivers = getTrulyAvailableDrivers(allDrivers);

        if (!trulyAvailableDrivers.isEmpty()) {
            System.out.println("Sistem: Pronađeni dostupni vozači. Biram najbližeg.");
            return findClosestDriverByLocation(trulyAvailableDrivers, rideStartLocation);
        }

        if (areAllDriversBusyOrHaveFutureRides(allDrivers)) {
            System.out.println("Sistem: Svi vozači su trenutno zauzeti ili imaju već zakazanu buduću vožnju. Vožnja se odbija.");
            throw new NoSuchElementException("Svi vozači su zauzeti ili imaju zakazanu buduću vožnju.");
        }

        List<Driver> busyDriversWithoutFutureRides = getBusyDriversWithoutFutureRides(allDrivers);

        if (!busyDriversWithoutFutureRides.isEmpty()) {
            System.out.println("Sistem: Slobodnih vozača nema. Biram najbližeg zauzetog vozača koji nema buduću vožnju.");
            return findClosestDriverByLocation(busyDriversWithoutFutureRides, rideStartLocation);
        }

        System.out.println("Sistem: Nema vozača koji ispunjavaju kriterijume za vožnju.");
        throw new NoSuchElementException("Nema dostupnih vozača za ovu vožnju.");
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

    private boolean areAllDriversBusyOrHaveFutureRides(List<Driver> drivers) {
        return drivers.stream()
                .allMatch(driver -> !driver.isAvailable() || driver.getHasFutureDrive());
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
            System.err.println("Upozorenje: Jedna od lokacija je null prilikom izračunavanja distance.");
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
                driver.isBlocked(),
                driver.isAvailable(),
                driver.getTimeOfLogin(),
                driver.getHasFutureDrive(),
                pointDTO
        );
    }
}