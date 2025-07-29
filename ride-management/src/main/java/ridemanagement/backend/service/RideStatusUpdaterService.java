package ridemanagement.backend.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.model.Ride;
import ridemanagement.backend.repository.RideRepository;

import java.util.NoSuchElementException;

@Service
public class RideStatusUpdaterService {

    @Autowired
    private RideRepository rideRepository;

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void updateRideStatus(Long rideId, String newStatus) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Vožnja sa ID " + rideId + " nije pronađena za ažuriranje statusa."));
        ride.setRideStatus(newStatus);
        rideRepository.save(ride);
        System.out.println("DEBUG: Ride " + rideId + " status updated to " + newStatus + " in a NEW transaction by RideStatusUpdaterService.");
    }
}