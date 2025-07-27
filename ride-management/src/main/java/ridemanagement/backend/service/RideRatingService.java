package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import ridemanagement.backend.dto.RideRatingDTO;
import ridemanagement.backend.model.RideRating;
import ridemanagement.backend.repository.RideRatingRepository;

import java.time.ZonedDateTime;
import java.time.Duration;
import java.util.Optional;

@Service
public class RideRatingService {

    @Autowired
    private RideRatingRepository rideRatingRepository;

    private static final Duration RATING_WINDOW = Duration.ofDays(3);

    @Transactional
    public RideRating saveOrUpdateRideRating(RideRatingDTO ratingDTO) {
        Optional<RideRating> existingRatingOptional = rideRatingRepository.findByRideIdAndReviewerUserId(
                ratingDTO.getRideId(),
                ratingDTO.getReviewerUserId()
        );

        RideRating rideRating;

        if (existingRatingOptional.isPresent()) {
            rideRating = existingRatingOptional.get();

            ZonedDateTime now = ZonedDateTime.now();
            if (Duration.between(rideRating.getRatingDate(), now).compareTo(RATING_WINDOW) > 0) {
                throw new IllegalStateException("Rating for ride ID " + ratingDTO.getRideId() + " cannot be updated as the 3-day window has expired.");
            }

            rideRating.setDriverRating(ratingDTO.getDriverRating());
            rideRating.setVehicleRating(ratingDTO.getVehicleRating());
            rideRating.setComment(ratingDTO.getComment());
            System.out.println("Updating existing ride rating for ride ID: " + ratingDTO.getRideId() + " by user: " + ratingDTO.getReviewerUserId());

        } else {
            rideRating = new RideRating(
                    ratingDTO.getRideId(),
                    ratingDTO.getReviewerUserId(),
                    ratingDTO.getDriverId(),
                    ratingDTO.getVehicleId(),
                    ratingDTO.getDriverRating(),
                    ratingDTO.getVehicleRating(),
                    ratingDTO.getComment()
            );
            System.out.println("Creating new ride rating for ride ID: " + ratingDTO.getRideId() + " by user: " + ratingDTO.getReviewerUserId());
        }

        return rideRatingRepository.save(rideRating);
    }

}