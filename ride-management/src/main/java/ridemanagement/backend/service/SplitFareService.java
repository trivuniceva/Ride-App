package ridemanagement.backend.service;

import com.rideapp.usermanagement.model.EmailService;
import com.rideapp.usermanagement.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.FavoriteRouteDTO;
import ridemanagement.backend.dto.PointDTO;
import ridemanagement.backend.dto.RideRequestDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.model.Ride;
import ridemanagement.backend.repository.RideRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SplitFareService {

    @Autowired
    private EmailService emailService;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private DriverService driverService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private RideRepository rideRepository;
    @Autowired
    private PointService pointService;
    @Autowired
    private FavoriteRouteService favoriteRouteService;

    public Ride initiateRideRequest(RideRequestDTO rideRequestDTO) {
        Ride ride = new Ride(rideRequestDTO);

        if (rideRequestDTO.getStartLocation() != null) {
            Point startPoint = pointService.findByLatitudeAndLongitude(
                    rideRequestDTO.getStartLocation().getLatitude(),
                    rideRequestDTO.getStartLocation().getLongitude()
            ).orElseGet(() -> pointService.save(
                    new Point(rideRequestDTO.getStartLocation().getLatitude(), rideRequestDTO.getStartLocation().getLongitude())
            ));
            ride.setStartLocation(startPoint);
        }

        if (rideRequestDTO.getDestinationLocation() != null) {
            Point destinationPoint = pointService.findByLatitudeAndLongitude(
                    rideRequestDTO.getDestinationLocation().getLatitude(),
                    rideRequestDTO.getDestinationLocation().getLongitude()
            ).orElseGet(() -> pointService.save(
                    new Point(rideRequestDTO.getDestinationLocation().getLatitude(), rideRequestDTO.getDestinationLocation().getLongitude())
            ));
            ride.setDestinationLocation(destinationPoint);
        }

        if (rideRequestDTO.getStopLocations() != null && !rideRequestDTO.getStopLocations().isEmpty()) {
            List<Point> stopPoints = rideRequestDTO.getStopLocations().stream().map(stopDto -> {
                return pointService.findByLatitudeAndLongitude(
                        stopDto.getLatitude(),
                        stopDto.getLongitude()
                ).orElseGet(() -> pointService.save(new Point(stopDto.getLatitude(), stopDto.getLongitude())));
            }).collect(Collectors.toList());
            ride.setStopLocations(stopPoints);
        }

        ride.setRideStatus("PENDING_DRIVER_RESPONSE");
        ride.setPaymentStatus("PENDING_DRIVER_CONFIRMATION");
        ride = rideRepository.save(ride);

        tryAssignNextDriver(ride, rideRequestDTO);

        return ride;
    }

    public void acceptRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Vožnja sa ID " + rideId + " nije pronađena."));

        if (!"PENDING_DRIVER_RESPONSE".equals(ride.getRideStatus())) {
            throw new IllegalStateException("Vožnju " + rideId + " nije moguće prihvatiti u trenutnom statusu: " + ride.getRideStatus());
        }

        confirmAndProcessPayment(ride.getFullPrice(), ride.getPassengers());

        ride.setRideStatus("ACCEPTED");
        ride.setPaymentStatus("PAID");
        rideRepository.save(ride);

        FavoriteRouteDTO favoriteRouteDTO = new FavoriteRouteDTO();
        favoriteRouteDTO.setUserEmail(ride.getRequestorEmail());
        favoriteRouteDTO.setStartAddress(ride.getStartAddress());
        favoriteRouteDTO.setStops(ride.getStops());
        favoriteRouteDTO.setDestinationAddress(ride.getDestinationAddress());
        favoriteRouteDTO.setVehicleType(ride.getVehicleType());
        favoriteRouteDTO.setCarriesBabies(ride.isCarriesBabies());
        favoriteRouteDTO.setCarriesPets(ride.isCarriesPets());

        if (ride.getStartLocation() != null) {
            favoriteRouteDTO.setStartLocation(new ridemanagement.backend.dto.PointDTO(ride.getStartLocation().getId(), ride.getStartLocation().getLatitude(), ride.getStartLocation().getLongitude()));
        }
        if (ride.getDestinationLocation() != null) {
            favoriteRouteDTO.setDestinationLocation(new ridemanagement.backend.dto.PointDTO(ride.getDestinationLocation().getId(), ride.getDestinationLocation().getLatitude(), ride.getDestinationLocation().getLongitude()));
        }
        if (ride.getStopLocations() != null) {
            favoriteRouteDTO.setStopLocations(ride.getStopLocations().stream()
                    .map(p -> new ridemanagement.backend.dto.PointDTO(p.getId(), p.getLatitude(), p.getLongitude()))
                    .collect(Collectors.toList()));
        }

        try {
            favoriteRouteService.saveFavoriteRoute(favoriteRouteDTO);
            System.out.println("Ruta automatski dodata u omiljene nakon uspešne vožnje.");
        } catch (Exception e) {
            System.err.println("Greška prilikom automatskog dodavanja rute u omiljene: " + e.getMessage());
        }
    }

    public void rejectRide(Long rideId, Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Vožnja sa ID " + rideId + " nije pronađena."));

        if (ride.getDriverId() != null && !driverId.equals(ride.getDriverId())) {
            return;
        }

        ride.addRefusedDriver(driverId);
        ride.setDriverId(null);
        ride.setRideStatus("DRIVER_REFUSED");
        rideRepository.save(ride);

        PointDTO startLocationDTO = null;
        if(ride.getStartLocation() != null) {
            startLocationDTO = new PointDTO(ride.getStartLocation().getId(), ride.getStartLocation().getLatitude(), ride.getStartLocation().getLongitude());
        }
        PointDTO destinationLocationDTO = null;
        if(ride.getDestinationLocation() != null) {
            destinationLocationDTO = new PointDTO(ride.getDestinationLocation().getId(), ride.getDestinationLocation().getLatitude(), ride.getDestinationLocation().getLongitude());
        }

        List<PointDTO> stopLocationDTOs = null;
        if (ride.getStopLocations() != null) {
            stopLocationDTOs = ride.getStopLocations().stream()
                    .map(p -> new PointDTO(p.getId(), p.getLatitude(), p.getLongitude()))
                    .collect(Collectors.toList());
        }


        RideRequestDTO reconstructedRideRequestDTO = new RideRequestDTO(
                ride.getStartAddress(),
                ride.getStops(),
                ride.getDestinationAddress(),
                startLocationDTO,
                stopLocationDTOs,
                destinationLocationDTO,
                ride.getVehicleType(),
                ride.isCarriesBabies(),
                ride.isCarriesPets(),
                ride.getPassengers(),
                ride.getPaymentStatus(),
                ride.getFullPrice(),
                ride.getRequestorEmail()
        );

        tryAssignNextDriver(ride, reconstructedRideRequestDTO);
    }

    private void tryAssignNextDriver(Ride ride, RideRequestDTO dto) {
        Set<Long> refusedDriverIds = ride.getRefusedDriverIds();

        try {
            Driver nextDriver = driverService.findNextEligibleDriver(dto, refusedDriverIds);

            if (nextDriver != null && driverService.isDriverCurrentlyLoggedIn(nextDriver.getId())) {
                System.out.println("nextDriver: " + nextDriver.getId() + " is logged in.");
                ride.setDriverId(nextDriver.getId());
                ride.setRideStatus("PENDING_DRIVER_RESPONSE");
                rideRepository.save(ride);

                String msg = "Imate novu vožnju od korisnika " + ride.getRequestorEmail() +
                        ". Detalji: od " + ride.getStartAddress() +
                        " do " + ride.getDestinationAddress();

                notificationService.notifyDriver(nextDriver.getId(), msg, dto, ride.getId());
            } else {
                System.out.println("Next eligible driver is not logged in or not found. Trying to find another driver.");
                if (nextDriver != null) {
                    ride.addRefusedDriver(nextDriver.getId());
                    rideRepository.save(ride);
                }
                tryAssignNextDriver(ride, dto);
            }

        } catch (NoSuchElementException e) {
            ride.setRideStatus("ALL_DRIVERS_REFUSED");
            ride.setDriverId(null);
            rideRepository.save(ride);
            System.out.println("Nema više odgovarajućih vozača za vožnju " + ride.getId());
        }
    }

    private void confirmAndProcessPayment(double fullPrice, List<String> passengers) {
        int totalPeople = passengers.size() + 1;
        BigDecimal fullPriceDecimal = new BigDecimal(fullPrice);
        BigDecimal totalPeopleDecimal = new BigDecimal(totalPeople);

        BigDecimal pricePerPerson = fullPriceDecimal.divide(totalPeopleDecimal, 2, RoundingMode.HALF_UP);

        String token = tokenService.generateToken();

        for(String email: passengers) {
            // emailService.sendPaymentConfirmation(email, token , pricePerPerson);
        }
    }
}