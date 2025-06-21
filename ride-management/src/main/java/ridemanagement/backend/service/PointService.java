package ridemanagement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.repository.PointRepository;

import java.util.Optional;

@Service
public class PointService {

    @Autowired
    private PointRepository pointRepository;

    public Optional<Point> findById(Long id) {
        return pointRepository.findById(id);
    }

    public Point save(Point point) {
        return pointRepository.save(point);
    }

    public Optional<Point> findByLatitudeAndLongitude(double latitude, double longitude) {
        return pointRepository.findByLatitudeAndLongitude(latitude, longitude);
    }
}