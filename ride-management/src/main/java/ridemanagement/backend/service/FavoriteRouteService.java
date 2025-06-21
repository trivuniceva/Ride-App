package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.FavoriteRouteDTO;
import ridemanagement.backend.model.FavoriteRoute;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.repository.FavoriteRouteRepository;
import ridemanagement.backend.repository.PointRepository; // Dodato za PointRepository

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteRouteService {

    @Autowired
    private FavoriteRouteRepository favoriteRouteRepository;

    @Autowired
    private PointRepository pointRepository; // Potreban za čuvanje Point objekata

    public FavoriteRoute saveFavoriteRoute(FavoriteRouteDTO dto) {
        FavoriteRoute favoriteRoute = new FavoriteRoute();
        favoriteRoute.setUserEmail(dto.getUserEmail());
        favoriteRoute.setStartAddress(dto.getStartAddress());
        favoriteRoute.setStops(dto.getStops());
        favoriteRoute.setDestinationAddress(dto.getDestinationAddress());
        favoriteRoute.setVehicleType(dto.getVehicleType());
        favoriteRoute.setCarriesBabies(dto.isCarriesBabies());
        favoriteRoute.setCarriesPets(dto.isCarriesPets());

        if (dto.getStartLocation() != null) {
            Point startPoint = pointRepository.findByLatitudeAndLongitude(
                    dto.getStartLocation().getLatitude(),
                    dto.getStartLocation().getLongitude()
            ).orElseGet(() -> pointRepository.save(new Point(dto.getStartLocation().getLatitude(), dto.getStartLocation().getLongitude())));
            favoriteRoute.setStartLocation(startPoint);
        }

        if (dto.getDestinationLocation() != null) {
            Point destinationPoint = pointRepository.findByLatitudeAndLongitude(
                    dto.getDestinationLocation().getLatitude(),
                    dto.getDestinationLocation().getLongitude()
            ).orElseGet(() -> pointRepository.save(new Point(dto.getDestinationLocation().getLatitude(), dto.getDestinationLocation().getLongitude())));
            favoriteRoute.setDestinationLocation(destinationPoint);
        }

        // Proveri i sačuvaj/dohvati Point objekte za stop lokacije
        if (dto.getStopLocations() != null && !dto.getStopLocations().isEmpty()) {
            List<Point> stopPoints = dto.getStopLocations().stream().map(stopDto -> {
                return pointRepository.findByLatitudeAndLongitude(
                        stopDto.getLatitude(),
                        stopDto.getLongitude()
                ).orElseGet(() -> pointRepository.save(new Point(stopDto.getLatitude(), stopDto.getLongitude())));
            }).collect(Collectors.toList());
            favoriteRoute.setStopLocations(stopPoints);
        }

        return favoriteRouteRepository.save(favoriteRoute);
    }

    /**
     * Dohvata sve omiljene rute za određenog korisnika.
     * @param userEmail Email korisnika.
     * @return Lista omiljenih ruta.
     */
    public List<FavoriteRoute> getFavoriteRoutesByUserEmail(String userEmail) {
        return favoriteRouteRepository.findByUserEmail(userEmail);
    }

    /**
     * Briše omiljenu rutu po ID-u.
     * @param id ID omiljene rute.
     */
    public void deleteFavoriteRoute(Long id) {
        favoriteRouteRepository.deleteById(id);
    }
}