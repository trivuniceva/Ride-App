package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import ridemanagement.backend.dto.RideRatingDTO;
import ridemanagement.backend.model.RideRating;
import ridemanagement.backend.model.Vehicle; // Dodaj import za Vehicle
import ridemanagement.backend.repository.RideRatingRepository;

import java.time.ZonedDateTime;
import java.time.Duration;
import java.util.NoSuchElementException; // Dodaj import za NoSuchElementException
import java.util.Optional;

@Service
public class RideRatingService {

    @Autowired
    private RideRatingRepository rideRatingRepository;
    @Autowired
    private DriverService driverService; // Pretpostavka da DriverService može da dohvati Vehicle po ID-u vozača ili direktno VehicleService

    // Ako imaš poseban VehicleService, koristi njega:
    // @Autowired
    // private VehicleService vehicleService;


    private static final Duration RATING_WINDOW = Duration.ofDays(3);

    @Transactional
    public RideRating saveOrUpdateRideRating(RideRatingDTO ratingDTO) {
        Optional<RideRating> existingRatingOptional = rideRatingRepository.findByRideIdAndReviewerUserId(
                ratingDTO.getRideId(),
                ratingDTO.getReviewerUserId()
        );

        RideRating rideRating;

        // **** Dohvati Vehicle objekat pre kreiranja RideRating ****
        Vehicle vehicle = null;
        if (ratingDTO.getVehicleId() != null) {
            try {
                // Pretpostavka: DriverService ima metodu za dohvaćanje vozila po ID-u vozila
                // Ako imaš VehicleService, onda bi bilo vehicleService.findById(ratingDTO.getVehicleId())
                vehicle = driverService.findVehicleById(ratingDTO.getVehicleId()); // Prilagodi ovu metodu ako je potrebno
            } catch (NoSuchElementException e) {
                System.err.println("Upozorenje: Vozilo sa ID " + ratingDTO.getVehicleId() + " nije pronađeno za ocenu vožnje. Nastavljam bez vozila.");
                // Možeš baciti izuzetak ili nastaviti bez vozila, zavisno od poslovne logike
            }
        }
        // *************************************************************

        if (existingRatingOptional.isPresent()) {
            rideRating = existingRatingOptional.get();

            ZonedDateTime now = ZonedDateTime.now();
            if (Duration.between(rideRating.getRatingDate(), now).compareTo(RATING_WINDOW) > 0) {
                throw new IllegalStateException("Rating for ride ID " + ratingDTO.getRideId() + " cannot be updated as the 3-day window has expired.");
            }

            rideRating.setDriverRating(ratingDTO.getDriverRating());
            rideRating.setVehicleRating(ratingDTO.getVehicleRating());
            rideRating.setComment(ratingDTO.getComment());
            rideRating.setVehicle(vehicle); // **** Postavi Vehicle objekat ****
            System.out.println("Updating existing ride rating for ride ID: " + ratingDTO.getRideId() + " by user: " + ratingDTO.getReviewerUserId());

        } else {
            rideRating = new RideRating(
                    ratingDTO.getRideId(),
                    ratingDTO.getReviewerUserId(),
                    ratingDTO.getDriverId(),
                    vehicle, // **** PROSLEDI VEHICLE OBJEKAT ****
                    ratingDTO.getDriverRating(),
                    ratingDTO.getVehicleRating(),
                    ratingDTO.getComment()
            );
            System.out.println("Creating new ride rating for ride ID: " + ratingDTO.getRideId() + " by user: " + ratingDTO.getReviewerUserId());
        }

        return rideRatingRepository.save(rideRating);
    }

}
