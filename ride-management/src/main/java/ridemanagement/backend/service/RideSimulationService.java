package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ridemanagement.backend.client.OpenRouteServiceApiClient;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.model.Ride;
import ridemanagement.backend.repository.RideRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class RideSimulationService {

    @Autowired
    private DriverService driverService;
    @Autowired
    private RideRepository rideRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private OpenRouteServiceApiClient openRouteServiceApiClient;
    @Autowired
    private PointService pointService;
    @Autowired
    private RideStatusUpdaterService rideStatusUpdaterService;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    private final ConcurrentHashMap<Long, CompletableFuture<Void>> rideCompletionFutures = new ConcurrentHashMap<>();


    @Async
    @Transactional
    public void startSimulation(Ride ride, Long requestorUserId) {
        try {
            Driver driver = driverService.findById(ride.getDriverId());

            simulateDriverPickup(ride, driver, requestorUserId);

            CompletableFuture<Void> currentRideFuture = new CompletableFuture<>();
            rideCompletionFutures.put(ride.getId(), currentRideFuture);
            Ride updatedRide = rideRepository.findById(ride.getId()).orElse(ride);
            System.out.println("Simulacija vožnje " + ride.getId() + " pauzirana, čeka se akcija vozača. Trenutni status (iz baze): " + updatedRide.getRideStatus());

            currentRideFuture.get();

            simulateActualRide(ride, driver, requestorUserId);

            ride.setRideStatus("COMPLETED");
            System.out.println(ride.getDriverId());
            rideRepository.save(ride);

            if (requestorUserId != null) {
                notificationService.notifyUser(requestorUserId, "RIDE_COMPLETED", "Vaša vožnja je završena! Hvala vam.", ride.getId(), null, null, null);
            }

            if (driver != null) {
                driver.setAvailable(true);
                driver.setHasFutureDrive(false);
                driverService.save(driver);
            }

        } catch (Exception e) {
            System.err.println("Greška tokom simulacije vožnje " + ride.getId() + ": " + e.getMessage());
            ride.setRideStatus("FAILED");
            rideRepository.save(ride);
            CompletableFuture<Void> future = rideCompletionFutures.remove(ride.getId());
            if (future != null) {
                future.completeExceptionally(e);
            }
        } finally {
            rideCompletionFutures.remove(ride.getId());
        }
    }

    public void resumeRideSimulation(Long rideId) {
        CompletableFuture<Void> future = rideCompletionFutures.get(rideId);
        if (future != null) {
            future.complete(null);
            System.out.println("Simulacija vožnje " + rideId + " nastavljena.");
        } else {
            System.err.println("Nije pronađena budućnost za vožnju " + rideId + ". Simulacija možda nije pauzirana.");
        }
    }

    public void cancelRideSimulation(Long rideId) {
        CompletableFuture<Void> future = rideCompletionFutures.remove(rideId);
        if (future != null) {
            future.completeExceptionally(new RuntimeException("Simulacija otkazana od strane vozača."));
            System.out.println("Simulacija vožnje " + rideId + " otkazana.");
        } else {
            System.err.println("Nije pronađena budućnost za vožnju " + rideId + ". Simulacija možda nije aktivna.");
        }
    }


    private void simulateDriverPickup(Ride ride, Driver driver, Long requestorUserId) throws IOException, InterruptedException {
        if (driver == null || driver.getLocation() == null || ride.getStartLocation() == null) {
            System.err.println("Nema dovoljno informacija za simulaciju preuzimanja putnika za vožnju " + ride.getId());
            return;
        }

        List<List<Double>> routeCoords = new ArrayList<>();
        routeCoords.add(List.of(driver.getLocation().getLongitude(), driver.getLocation().getLatitude()));
        routeCoords.add(List.of(ride.getStartLocation().getLongitude(), ride.getStartLocation().getLatitude()));

        List<Point> pickupPath = openRouteServiceApiClient.getRoute(routeCoords);

        System.out.println("Simulacija dolaska vozača po putnika za vožnju " + ride.getId() + ". Putanja ima " + pickupPath.size() + " tačaka.");

        simulatePathMovement(ride, driver, pickupPath, "DRIVER_EN_ROUTE", requestorUserId);

        rideStatusUpdaterService.updateRideStatus(ride.getId(), "ARRIVED_AT_PICKUP");

        if (requestorUserId != null) {
            notificationService.notifyUser(requestorUserId, "DRIVER_ARRIVED_PICKUP", "Vozač je stigao na vašu lokaciju preuzimanja!", ride.getId(), driver.getFirstname(), driver.getLastname(), driver.getProfilePic());
        }

        if (driver != null && driver.getId() != null) {
            notificationService.notifyDriverArrivedAtPickup(
                    driver.getId(),
                    ride.getId(),
                    "Stigli ste na početnu adresu vožnje. Da li želite da započnete vožnju ili je otkažete?"
            );
        }

        System.out.println("Vozač " + driver.getId() + " stigao na lokaciju preuzimanja za vožnju " + ride.getId() + ". Status vožnje bi trebalo da je ARRIVED_AT_PICKUP (komitovan).");
    }

    private void simulateActualRide(Ride ride, Driver driver, Long requestorUserId) throws IOException, InterruptedException {
        if (driver == null || ride.getStartLocation() == null || ride.getDestinationLocation() == null) {
            System.err.println("Nema dovoljno informacija za simulaciju stvarne vožnje za vožnju " + ride.getId());
            return;
        }

        List<List<Double>> routeCoords = new ArrayList<>();
        routeCoords.add(List.of(ride.getStartLocation().getLongitude(), ride.getStartLocation().getLatitude()));

        if (ride.getStopLocations() != null && !ride.getStopLocations().isEmpty()) {
            ride.getStopLocations().forEach(stop ->
                    routeCoords.add(List.of(stop.getLongitude(), stop.getLatitude()))
            );
        }
        routeCoords.add(List.of(ride.getDestinationLocation().getLongitude(), ride.getDestinationLocation().getLatitude()));

        List<Point> actualRidePath = openRouteServiceApiClient.getRoute(routeCoords);

        System.out.println("Simulacija stvarne vožnje za vožnju " + ride.getId() + ". Putanja ima " + actualRidePath.size() + " tačaka.");

        simulatePathMovement(ride, driver, actualRidePath, "RIDE_IN_PROGRESS", requestorUserId);

        System.out.println("Vožnja " + ride.getId() + " stigla na odredište.");
    }

    private void simulatePathMovement(Ride ride, Driver driver, List<Point> path, String notificationType, Long requestorUserId) throws InterruptedException {
        ride.setPathTaken("");

        for (int i = 0; i < path.size(); i++) {
            Point currentPoint = path.get(i);

            Point persistedPoint = pointService.findByLatitudeAndLongitude(
                    currentPoint.getLatitude(),
                    currentPoint.getLongitude()
            ).orElseGet(() -> pointService.save(currentPoint));

            driver.setLocation(persistedPoint);
            driverService.save(driver);

            notificationService.notifyUserDriverLocation(
                    requestorUserId,
                    ride.getId(),
                    driver.getId(),
                    currentPoint.getLatitude(),
                    currentPoint.getLongitude(),
                    notificationType
            );

            Thread.sleep(500);
        }
    }
}