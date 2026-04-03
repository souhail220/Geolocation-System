package com.geolocation.authservice.repositories;

import com.geolocation.authservice.data.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);

    User findByEmail(String email);
    List<User> findAllByTeamId(int teamId);
}
