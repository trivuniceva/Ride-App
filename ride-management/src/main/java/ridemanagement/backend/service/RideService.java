package ridemanagement.backend.service;

import com.rideapp.usermanagement.repository.UserRepository;
import jakarta.transaction.Transactional;
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
import java.util.NoSuchElementException;

@Service
public class RideService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DriverService driverService;

    @Autowired
    private RideRepository rideRepository;
    @Autowired
    private RideSimulationService rideSimulationService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private UserRepository userRepository;


    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public DriverDTO convertToDTO(Driver driver) {
        return driverService.convertToDTO(driver);
    }

    public List<Ride> getRideHistoryForUser(Long userId, String userRole, String userEmail) {

        if ("ADMINISTRATOR".equalsIgnoreCase(userRole)) {
            return rideRepository.findAllByOrderByCreatedAtDesc();
        }

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

    @Transactional
    public void startRideByDriver(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Vožnja sa ID " + rideId + " nije pronađena."));

        System.out.println("DEBUG: startRideByDriver - Ride ID: " + rideId + ", Current Status: " + ride.getRideStatus());

        if (!"ARRIVED_AT_PICKUP".equals(ride.getRideStatus())) {
            System.err.println("ERROR: startRideByDriver - Invalid status for ride " + rideId + ". Expected ARRIVED_AT_PICKUP, but was " + ride.getRideStatus());
            throw new IllegalStateException("Vožnju " + rideId + " nije moguće započeti u trenutnom statusu: " + ride.getRideStatus() + ". Očekivani status: ARRIVED_AT_PICKUP.");
        }

        ride.setRideStatus("IN_PROGRESS");
        rideRepository.save(ride);

        System.out.println("DEBUG: startRideByDriver - Ride ID: " + rideId + ", Status changed to: IN_PROGRESS");

        rideSimulationService.resumeRideSimulation(rideId);

        Long requestorUserId = ride.getRequestorEmail() != null ? userRepository.findByEmail(ride.getRequestorEmail()).getId() : null;
        if (requestorUserId != null) {
            notificationService.notifyUser(requestorUserId, "RIDE_STARTED", "Vaša vožnja je započeta!", rideId, null, null, null);
        }
    }

    @Transactional
    public void cancelRideByDriver(Long rideId, String reason) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Vožnja sa ID " + rideId + " nije pronađena."));

        ride.setRideStatus("CANCELLED_BY_DRIVER");
        ride.setDriverId(null);
        rideRepository.save(ride);

        rideSimulationService.cancelRideSimulation(rideId);

        Long requestorUserId = ride.getRequestorEmail() != null ? userRepository.findByEmail(ride.getRequestorEmail()).getId() : null;
        if (requestorUserId != null) {
            notificationService.notifyUser(requestorUserId, "RIDE_CANCELLED_BY_DRIVER", "Vožnja je otkazana od strane vozača. Razlog: " + reason, rideId, null, null, null);
        }
    }

    @Transactional
    public void completeRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Ride not found with ID: " + rideId));

        ride.setRideStatus("COMPLETED");
        rideRepository.save(ride);

        if (ride.getDriverId() != null) {
            driverService.updateDriverAvailabilityAfterRideCompletion(ride.getDriverId());
        }

    }
}