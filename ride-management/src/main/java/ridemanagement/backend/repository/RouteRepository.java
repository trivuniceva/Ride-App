package ridemanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ridemanagement.backend.model.Route;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {
}