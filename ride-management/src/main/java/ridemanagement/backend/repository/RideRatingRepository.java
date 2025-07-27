package ridemanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ridemanagement.backend.model.RideRating;

import java.util.List;
import java.util.Optional;

@Repository
public interface RideRatingRepository extends JpaRepository<RideRating, Long> {
    List<RideRating> findByDriverId(Long driverId);
    Optional<RideRating> findByRideIdAndReviewerUserId(Long rideId, Long reviewerUserId);

}