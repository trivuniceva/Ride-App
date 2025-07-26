package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.FavoriteRouteDTO;
import ridemanagement.backend.model.FavoriteRoute;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.repository.FavoriteRouteRepository;
import ridemanagement.backend.repository.PointRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors; // Added for stream processing

@Service
public class FavoriteRouteService {

    @Autowired
    private FavoriteRouteRepository favoriteRouteRepository;

    @Autowired
    private PointRepository pointRepository;

    public FavoriteRoute saveFavoriteRoute(FavoriteRouteDTO dto) {
        FavoriteRoute favoriteRoute = new FavoriteRoute();
        favoriteRoute.setUserEmail(dto.getUserEmail());
        favoriteRoute.setStartAddress(dto.getStartAddress());
        favoriteRoute.setStops(dto.getStops());
        favoriteRoute.setDestinationAddress(dto.getDestinationAddress());
        favoriteRoute.setVehicleType(dto.getVehicleType());
        favoriteRoute.setCarriesBabies(dto.isCarriesBabies());
        favoriteRoute.setCarriesPets(dto.isCarriesPets());

        // Handle startLocation - still find existing or create new
        if (dto.getStartLocation() != null) {
            Point startPoint = pointRepository.findByLatitudeAndLongitude(
                    dto.getStartLocation().getLatitude(),
                    dto.getStartLocation().getLongitude()
            ).orElseGet(() -> pointRepository.save(new Point(dto.getStartLocation().getLatitude(), dto.getStartLocation().getLongitude())));
            favoriteRoute.setStartLocation(startPoint);
        }

        // Handle destinationLocation - still find existing or create new
        if (dto.getDestinationLocation() != null) {
            Point destinationPoint = pointRepository.findByLatitudeAndLongitude(
                    dto.getDestinationLocation().getLatitude(),
                    dto.getDestinationLocation().getLongitude()
            ).orElseGet(() -> pointRepository.save(new Point(dto.getDestinationLocation().getLatitude(), dto.getDestinationLocation().getLongitude())));
            favoriteRoute.setDestinationLocation(destinationPoint);
        }

        // Handle stopLocations - CRITICAL CHANGE: Always ensure a new collection and proper Point management
        if (dto.getStopLocations() != null && !dto.getStopLocations().isEmpty()) {
            List<Point> managedStopPoints = new ArrayList<>();
            for (ridemanagement.backend.dto.PointDTO stopDto : dto.getStopLocations()) {
                Point pointToUse;
                // Try to find an existing point
                Optional<Point> existingStopPoint = pointRepository.findByLatitudeAndLongitude(
                        stopDto.getLatitude(),
                        stopDto.getLongitude()
                );
                if (existingStopPoint.isPresent()) {
                    pointToUse = existingStopPoint.get(); // Use the existing managed Point
                } else {
                    // If not found, create a new Point and save it.
                    // This ensures the Point is a managed entity in the current session.
                    pointToUse = pointRepository.save(new Point(stopDto.getLatitude(), stopDto.getLongitude()));
                }
                managedStopPoints.add(pointToUse);
            }
            favoriteRoute.setStopLocations(managedStopPoints);
        } else {
            favoriteRoute.setStopLocations(new ArrayList<>());
        }

        return favoriteRouteRepository.save(favoriteRoute);
    }

    public List<FavoriteRoute> getFavoriteRoutesByUserEmail(String userEmail) {
        return favoriteRouteRepository.findByUserEmail(userEmail);
    }

    public void deleteFavoriteRoute(Long id) {
        favoriteRouteRepository.deleteById(id);
    }
}