package ridemanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ridemanagement.backend.model.Driver;

public interface DriverRepository extends JpaRepository<Driver, Long> {

}
