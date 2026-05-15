package com.geolocation.radiomanagement.repositories;

import com.geolocation.radiomanagement.data.entities.LocationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationHistoryRepository extends JpaRepository<LocationHistory, String> {
}
