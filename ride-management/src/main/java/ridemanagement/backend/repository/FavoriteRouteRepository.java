package ridemanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ridemanagement.backend.model.FavoriteRoute;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRouteRepository extends JpaRepository<FavoriteRoute, Long> {
    List<FavoriteRoute> findByUserEmail(String userEmail);
    List<FavoriteRoute> findByUserEmailAndStartAddressAndDestinationAddress(String userEmail, String startAddress, String destinationAddress);
}