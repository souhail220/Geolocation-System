package com.geolocation.radiomanagement.repositories;

import com.geolocation.radiomanagement.data.entities.Radio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RadioRepository extends JpaRepository<Radio, String> {
}
