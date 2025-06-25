package ridemanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.WorkSession;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkSessionRepository extends JpaRepository<WorkSession, Long> {
    Optional<WorkSession> findTopByDriverAndLogoutTimeIsNullOrderByLoginTimeDesc(Driver driver);
    List<WorkSession> findByDriverAndLoginTimeBetween(Driver driver, Timestamp startDate, Timestamp endDate);
}
