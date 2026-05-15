package com.geolocation.radiomanagement.repositories;

import com.geolocation.radiomanagement.data.entities.Radio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface RadioRepository extends JpaRepository<Radio, UUID> {
}
