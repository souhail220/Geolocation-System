package com.geolocation.authservice.repositories;

import com.geolocation.authservice.data.entities.Geofences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GeofenceRepository extends JpaRepository<Geofences, Long> {
}
