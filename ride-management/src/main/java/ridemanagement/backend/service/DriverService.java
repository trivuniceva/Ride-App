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
import ridemanagement.backend.model.Vehicle;
import ridemanagement.backend.model.WorkSession;
import ridemanagement.backend.repository.*;
import jakarta.transaction.Transactional;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private WorkSessionRepository workSessionRepository;

    @Autowired
    private PointService pointService;

    @Autowired
    private RideRatingRepository rideRatingRepository;
    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private RideRepository rideRepository;

    public Driver findById(Long driverId) {
        return driverRepository.findById(driverId)
                .orElseThrow(() -> new NoSuchElementException("Driver not found with ID: " + driverId));
    }

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

    public boolean isDriverCurrentlyLoggedIn(Long driverId) {
        Optional<Driver> driverOptional = driverRepository.findById(driverId);
        if (driverOptional.isEmpty()) {
            return false;
        }
        Driver driver = driverOptional.get();
        return workSessionRepository.findTopByDriverAndLogoutTimeIsNullOrderByLoginTimeDesc(driver).isPresent();
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

        Driver closestDriver = null;
        double minDistance = Double.MAX_VALUE;

        for (Driver driver : drivers) {
            if (driver.getLocation() != null) {
                double distance = calculateDistance(driver.getLocation(), targetLocation);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestDriver = driver;
                }
            }
        }

        if (closestDriver == null) {
            throw new NoSuchElementException("Failed to find closest driver with a valid location among the provided list.");
        }

        return closestDriver;
    }

    private double calculateDistance(Point driverLocation, PointDTO targetLocation) {
        if (driverLocation == null || targetLocation == null) {
            return Double.MAX_VALUE;
        }
        double dx = driverLocation.getLatitude() - targetLocation.getLatitude();
        double dy = driverLocation.getLongitude() - targetLocation.getLongitude();
        return Math.sqrt(dx * dx + dy * dy);
    }

    private Double calculateAverageDriverRating(Long driverId) {
        List<Integer> ratings = rideRatingRepository.findByDriverId(driverId)
                .stream()
                .map(rating -> rating.getDriverRating())
                .collect(Collectors.toList());

        if (ratings.isEmpty()) {
            return null;
        }

        OptionalDouble average = ratings.stream()
                .mapToDouble(Integer::doubleValue)
                .average();

        if (average.isPresent()) {
            return average.getAsDouble();
        } else {
            return null;
        }
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

        System.out.println(driver.toString());

        driver.setActive(request.getIsBlocked());
        driver.setBlockNote(request.getBlockNote());

        driverRepository.save(driver);
        System.out.println(driver.toString());

        return convertToDTO(driver);
    }

    public DriverDTO convertToDTO(Driver driver) {
        PointDTO pointDTO = null;
        Point location = driver.getLocation();
        if (location != null) {
            pointDTO = new PointDTO(location.getId(), location.getLatitude(), location.getLongitude());
        }

        Double averageRating = calculateAverageDriverRating(driver.getId());

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
                pointDTO,
                averageRating
        );
    }

    public void recordDriverLoginTime(Long driverId) {
        Optional<Driver> driverOptional = driverRepository.findById(driverId);
        if (driverOptional.isPresent()) {
            Driver driver = driverOptional.get();

            Optional<WorkSession> existingOpenSession = workSessionRepository.findTopByDriverAndLogoutTimeIsNullOrderByLoginTimeDesc(driver);
            if (existingOpenSession.isPresent()) {
                WorkSession oldSession = existingOpenSession.get();
                oldSession.setLogoutTime(new Timestamp(System.currentTimeMillis()));
                workSessionRepository.save(oldSession);
                System.out.println("Closed previous open session for driver ID " + driverId);
            }

            WorkSession newSession = new WorkSession(driver, new Timestamp(System.currentTimeMillis()));
            workSessionRepository.save(newSession);
            System.out.println("New work session started for driver ID " + driverId + " at: " + newSession.getLoginTime());

        } else {
            throw new NoSuchElementException("Driver with ID " + driverId + " not found.");
        }
    }

    public void recordDriverLogoutTime(Long driverId) {
        Optional<Driver> driverOptional = driverRepository.findById(driverId);
        if (driverOptional.isPresent()) {
            Driver driver = driverOptional.get();

            Optional<WorkSession> openSession = workSessionRepository.findTopByDriverAndLogoutTimeIsNullOrderByLoginTimeDesc(driver);

            if (openSession.isPresent()) {
                WorkSession sessionToClose = openSession.get();
                sessionToClose.setLogoutTime(new Timestamp(System.currentTimeMillis()));
                workSessionRepository.save(sessionToClose);
                System.out.println("Work session ended for driver ID " + driverId + " at: " + sessionToClose.getLogoutTime());
            } else {
                System.out.println("No open session found for driver ID " + driverId + " to close. Possibly already logged out or application crashed.");
            }

        } else {
            throw new NoSuchElementException("Driver with ID " + driverId + " not found.");
        }
    }

    public Duration calculateTotalWorkTime(Long driverId, Timestamp startDate, Timestamp endDate) {
        Optional<Driver> driverOptional = driverRepository.findById(driverId);
        if (driverOptional.isEmpty()) {
            throw new NoSuchElementException("Driver with ID " + driverId + " not found.");
        }
        Driver driver = driverOptional.get();

        List<WorkSession> sessions = workSessionRepository
                .findByDriverAndLoginTimeBetween(driver, startDate, endDate);

        long totalSeconds = 0;
        for (WorkSession session : sessions) {
            if (session.getLogoutTime() != null) {
                LocalDateTime login = session.getLoginTime().toLocalDateTime();
                LocalDateTime logout = session.getLogoutTime().toLocalDateTime();
                totalSeconds += Duration.between(login, logout).getSeconds();
            }
        }
        return Duration.ofSeconds(totalSeconds);
    }

    public DriverDTO getDriverDTOById(Long id) {
        Optional<Driver> driverOptional = driverRepository.findById(id);
        if (driverOptional.isPresent()) {
            return convertToDTO(driverOptional.get());
        } else {
            throw new NoSuchElementException("Driver with ID " + id + " not found.");
        }
    }

    public Driver save(Driver driver) {
        return driverRepository.save(driver);
    }

    public Vehicle findVehicleById(Long vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new NoSuchElementException("Vozilo sa ID " + vehicleId + " nije pronađeno."));
    }

    @Transactional
    public void updateDriverAvailabilityAfterRideCompletion(Long driverId) {
        Driver driver = findById(driverId);

        boolean hasFutureRides = rideRepository.existsByDriverIdAndRideStatusIn(
                driverId,
                List.of("ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS")
        );

        driver.setHasFutureDrive(hasFutureRides);

        if (hasFutureRides) {
            driver.setAvailable(false);
            System.out.println("Vozač " + driverId + " završio vožnju, ali ima budućih vožnji. Postavljen na: isAvailable=false, hasFutureDrive=true.");
        } else {
            driver.setAvailable(true);
            System.out.println("Vozač " + driverId + " završio vožnju i nema budućih vožnji. Postavljen na: isAvailable=true, hasFutureDrive=false.");
        }

        driverRepository.save(driver);
    }

    @Transactional
    public void setDriverBusyForNewRide(Long driverId) {
        Driver driver = findById(driverId);
        if (driver.isAvailable()) {
            driver.setAvailable(false);
            driver.setHasFutureDrive(true);
            driverRepository.save(driver);
            System.out.println("Vozač " + driverId + " je prihvatio vožnju. Postavljen na: isAvailable=false, hasFutureDrive=true.");
        }
    }
}
