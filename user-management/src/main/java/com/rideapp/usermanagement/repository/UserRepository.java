package com.rideapp.usermanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.rideapp.usermanagement.model.User;
import com.rideapp.usermanagement.model.UserRole;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    List<User> findByUserRole(UserRole userRole);
    Optional<User> findById(Long id);
}
