package ridemanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ridemanagement.backend.model.Point;

@Repository
public interface PointRepository extends JpaRepository<Point, Long> {
}