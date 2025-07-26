package com.rideapp.usermanagement.repository;

import com.rideapp.usermanagement.dto.DriverProfileUpdateRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DriverProfileUpdateRequestRepository extends JpaRepository<DriverProfileUpdateRequest, Long> {
    List<DriverProfileUpdateRequest> findByStatus(DriverProfileUpdateRequest.UpdateRequestStatus status);
}
