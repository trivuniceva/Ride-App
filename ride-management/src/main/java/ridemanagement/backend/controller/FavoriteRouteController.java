package ridemanagement.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ridemanagement.backend.dto.FavoriteRouteDTO;
import ridemanagement.backend.model.FavoriteRoute;
import ridemanagement.backend.service.FavoriteRouteService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorite-routes")
@CrossOrigin(origins = "http://localhost:4200")
public class FavoriteRouteController {

    @Autowired
    private FavoriteRouteService favoriteRouteService;


    @PostMapping
    public ResponseEntity<Map<String, String>> addFavoriteRoute(@RequestBody FavoriteRouteDTO favoriteRouteDTO) {
        try {
            FavoriteRoute savedRoute = favoriteRouteService.saveFavoriteRoute(favoriteRouteDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Ruta uspešno dodata u omiljene.", "id", savedRoute.getId().toString()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Greška prilikom dodavanja rute u omiljene: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userEmail}")
    public ResponseEntity<List<FavoriteRouteDTO>> getFavoriteRoutesByUser(@PathVariable String userEmail) {
        List<FavoriteRoute> favoriteRoutes = favoriteRouteService.getFavoriteRoutesByUserEmail(userEmail);

        List<FavoriteRouteDTO> dtos = favoriteRoutes.stream().map(route -> {
            FavoriteRouteDTO dto = new FavoriteRouteDTO();
            dto.setId(route.getId());
            dto.setUserEmail(route.getUserEmail());
            dto.setStartAddress(route.getStartAddress());
            dto.setStops(route.getStops());
            dto.setDestinationAddress(route.getDestinationAddress());

            if (route.getStartLocation() != null) {
                dto.setStartLocation(new ridemanagement.backend.dto.PointDTO(route.getStartLocation().getId(), route.getStartLocation().getLatitude(), route.getStartLocation().getLongitude()));
            }
            if (route.getDestinationLocation() != null) {
                dto.setDestinationLocation(new ridemanagement.backend.dto.PointDTO(route.getDestinationLocation().getId(), route.getDestinationLocation().getLatitude(), route.getDestinationLocation().getLongitude()));
            }
            if (route.getStopLocations() != null) {
                dto.setStopLocations(route.getStopLocations().stream()
                        .map(p -> new ridemanagement.backend.dto.PointDTO(p.getId(), p.getLatitude(), p.getLongitude()))
                        .collect(Collectors.toList()));
            }
            dto.setVehicleType(route.getVehicleType());
            dto.setCarriesBabies(route.isCarriesBabies());
            dto.setCarriesPets(route.isCarriesPets());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFavoriteRoute(@PathVariable Long id) {
        try {
            favoriteRouteService.deleteFavoriteRoute(id);
            return ResponseEntity.ok(Map.of("message", "Ruta uspešno uklonjena iz omiljenih."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Greška prilikom uklanjanja rute iz omiljenih: " + e.getMessage()));
        }
    }
}