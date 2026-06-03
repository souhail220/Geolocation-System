package com.geolocation.radiomanagement.repositories;

import com.geolocation.radiomanagement.data.entities.LocationHistory;
import com.geolocation.radiomanagement.data.model.RadioHistoryLocationProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationHistoryRepository extends JpaRepository<LocationHistory, String> {

    @Query(value = """
    SELECT
      lh.radio_id AS radioId,
      lh.latitude AS latitude,
      lh.longitude AS longitude,
      lh.battery_level AS batteryLevel,
      lh.signal_strength AS signalStrength,
      lh.recorded_at AS recordedAt
    FROM location_history lh
    WHERE lh.radio_id = :radioId
    ORDER BY lh.recorded_at ASC
    """, nativeQuery = true)
    List<RadioHistoryLocationProjection> findTrailByRadioId(@Param("radioId") String radioId);
}
