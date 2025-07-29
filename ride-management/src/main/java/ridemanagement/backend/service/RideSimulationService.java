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


    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    @Async
    @Transactional
    public void startSimulation(Ride ride, Long requestorUserId) {
        try {
            Driver driver = driverService.findById(ride.getDriverId());

            simulateDriverPickup(ride, driver, requestorUserId);

            simulateActualRide(ride, driver, requestorUserId);

            ride.setRideStatus("COMPLETED");
            ride.setDriverId(null);
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

        ride.setRideStatus("DRIVING_TO_PICKUP");
        rideRepository.save(ride);

        simulatePathMovement(ride, driver, pickupPath, "DRIVER_EN_ROUTE", requestorUserId);

        if (requestorUserId != null) {
            notificationService.notifyUser(requestorUserId, "DRIVER_ARRIVED_PICKUP", "Vozač je stigao na vašu lokaciju preuzimanja!", ride.getId(), driver.getFirstname(), driver.getLastname(), driver.getProfilePic());
        }

        System.out.println("Vozač " + driver.getId() + " stigao na lokaciju preuzimanja za vožnju " + ride.getId());
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

        ride.setRideStatus("IN_PROGRESS");
        rideRepository.save(ride);

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
