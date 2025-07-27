package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.FavoriteRouteDTO;
import ridemanagement.backend.model.FavoriteRoute;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.repository.FavoriteRouteRepository;
import ridemanagement.backend.repository.PointRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FavoriteRouteService {

    @Autowired
    private FavoriteRouteRepository favoriteRouteRepository;

    @Autowired
    private PointRepository pointRepository;

    public FavoriteRoute saveFavoriteRoute(FavoriteRouteDTO dto) {

        List<FavoriteRoute> potentialDuplicates = favoriteRouteRepository.findByUserEmailAndStartAddressAndDestinationAddress(
                dto.getUserEmail(), dto.getStartAddress(), dto.getDestinationAddress()
        );

        for (FavoriteRoute existingRoute : potentialDuplicates) {
            if (areStopsEqual(existingRoute.getStops(), dto.getStops()) &&
                    Objects.equals(existingRoute.getVehicleType(), dto.getVehicleType()) &&
                    existingRoute.isCarriesBabies() == dto.isCarriesBabies() &&
                    existingRoute.isCarriesPets() == dto.isCarriesPets()) {
                System.out.println("Ruta (sa istim stajalištima i opcijama) već postoji kao omiljena za ovog korisnika. Neće se dodavati ponovo.");
                return existingRoute;
            }
        }

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

        // Handle stopLocations - Ensure new collection and proper Point management
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

    private boolean areStopsEqual(List<String> existingStops, List<String> newStops) {
        return Objects.equals(existingStops, newStops);
    }

    public List<FavoriteRoute> getFavoriteRoutesByUserEmail(String userEmail) {
        return favoriteRouteRepository.findByUserEmail(userEmail);
    }

    public void deleteFavoriteRoute(Long id) {
        if (favoriteRouteRepository.existsById(id)) {
            favoriteRouteRepository.deleteById(id);
        } else {
            throw new NoSuchElementException("Favorite route with ID " + id + " not found for deletion.");
        }
    }
}