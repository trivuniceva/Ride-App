package ridemanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ridemanagement.backend.model.Ride;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
}