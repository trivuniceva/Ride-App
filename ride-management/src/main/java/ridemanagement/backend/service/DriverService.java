package ridemanagement.backend.service;

import com.rideapp.usermanagement.dto.BlockUserRequestDTO;
import com.rideapp.usermanagement.model.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.dto.PointDTO;
import ridemanagement.backend.dto.RideRequestDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.model.WorkSession;
import ridemanagement.backend.repository.DriverRepository;

import jakarta.transaction.Transactional;
import ridemanagement.backend.repository.WorkSessionRepository;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
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
    private WorkSessionRepository workSessionRepository;

    @Autowired
    private PointService pointService;

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

    public void recordDriverLoginTime(Long driverId) {
        Optional<Driver> driverOptional = driverRepository.findById(driverId);
        if (driverOptional.isPresent()) {
            Driver driver = driverOptional.get();

            // TODO: zatvori sve prethodne otvorene sesije ako postoje (zlu ne trebalo)
            Optional<WorkSession> existingOpenSession = workSessionRepository.findTopByDriverAndLogoutTimeIsNullOrderByLoginTimeDesc(driver);
            if (existingOpenSession.isPresent()) {
                WorkSession oldSession = existingOpenSession.get();
                oldSession.setLogoutTime(new Timestamp(System.currentTimeMillis()));
                workSessionRepository.save(oldSession);
                System.out.println("Zatvorena prethodna otvorena sesija za drajvera ID " + driverId);
            }

            WorkSession newSession = new WorkSession(driver, new Timestamp(System.currentTimeMillis()));
            workSessionRepository.save(newSession);
            System.out.println("Nova radna sesija započeta za drajvera ID " + driverId + " u: " + newSession.getLoginTime());

            // TODO: update is_available status drajvera
            // driver.setAvailable(true);
            // driverRepository.save(driver);

        } else {
            throw new NoSuchElementException("Drajver sa ID " + driverId + " nije pronađen.");
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
                System.out.println("Radna sesija završena za drajvera ID " + driverId + " u: " + sessionToClose.getLogoutTime());
            } else {
                System.out.println("Nema otvorene sesije za drajvera ID " + driverId + " za zatvaranje. Moguće da je već odjavljen ili se aplikacija srušila.");
            }

            // TODO: update is_available status drajvera
            // driver.setAvailable(false);
            // driverRepository.save(driver);

        } else {
            throw new NoSuchElementException("Drajver sa ID " + driverId + " nije pronađen.");
        }
    }

    public Duration calculateTotalWorkTime(Long driverId, Timestamp startDate, Timestamp endDate) {
        Optional<Driver> driverOptional = driverRepository.findById(driverId);
        if (driverOptional.isEmpty()) {
            throw new NoSuchElementException("Drajver sa ID " + driverId + " nije pronađen.");
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
            throw new NoSuchElementException("Vozač sa ID-jem " + id + " nije pronađen.");
        }
    }
}