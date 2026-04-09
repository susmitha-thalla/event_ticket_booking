package com.event.ticketbooking.repository;

import com.event.ticketbooking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // =========================
    // BASIC
    // =========================

    Optional<User> findByEmail(String email);

    Optional<User> findByUserIdAndIsDeletedFalse(Long userId);

    boolean existsByEmail(String email);

    // =========================
    // ACTIVE USERS
    // =========================

    List<User> findByIsDeletedFalse();

    List<User> findByAccountStatusAndIsDeletedFalse(String accountStatus);

    // =========================
    // ROLE-BASED USERS
    // =========================

    List<User> findByRoleAndIsDeletedFalse(String role);

    List<User> findByRoleAndAccountStatusAndIsDeletedFalse(String role, String accountStatus);

    // =========================
    // ORGANIZERS
    // =========================

    List<User> findByRoleIgnoreCaseAndIsDeletedFalse(String role);

    List<User> findByRoleIgnoreCaseAndAccountStatusAndIsDeletedFalse(String role, String status);

    // =========================
    // ADMIN USE CASES
    // =========================

    long countByIsDeletedFalse();

    long countByRoleAndIsDeletedFalse(String role);

    long countByAccountStatusAndIsDeletedFalse(String status);
}