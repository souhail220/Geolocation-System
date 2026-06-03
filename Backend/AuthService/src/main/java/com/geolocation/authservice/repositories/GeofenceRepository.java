package com.geolocation.authservice.repositories;

import com.geolocation.authservice.data.entities.Geofences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GeofenceRepository extends JpaRepository<Geofences, UUID> {
    List<Geofences> findByTeam_Id(long teamId);
}
