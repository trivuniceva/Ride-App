package backend.rideapp.repository;

import ridemanagement.backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepositoryMain extends JpaRepository<Vehicle, Long> {
}
