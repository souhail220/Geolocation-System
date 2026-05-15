package com.geolocation.radiomanagement.repositories;

import com.geolocation.radiomanagement.data.entities.CurrentLocation;
import com.geolocation.radiomanagement.data.model.ClusterProjection;
import com.geolocation.radiomanagement.data.model.RadioMapProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CurrentLocationRepository extends JpaRepository<CurrentLocation, String> {

    // High zoom: individual points in viewport
    @Query(value = """
    SELECT
      cl.radio_id AS radioId,
      cl.latitude AS latitude,
      cl.longitude AS longitude,
      cl.battery_level AS batteryLevel,
      cl.signal_strength AS signalStrength,
      cl.timestamp AS timestamp,
      r.name AS name,
      r.status AS status,
      r.is_stolen AS isStolen,
      r.serial_number AS serialNumber,
      r.team_id AS teamId
    FROM current_location cl
    JOIN radio r  ON r.id = cl.radio_id
    WHERE ST_Within(
      cl.geom::geometry,
      ST_MakeEnvelope(:minLng,:minLat,:maxLng,:maxLat,4326)
    )
    LIMIT 500
    """, nativeQuery = true)
    List<RadioMapProjection> findInBounds(
            @Param("minLng") double minLng, @Param("minLat") double minLat,
            @Param("maxLng") double maxLng, @Param("maxLat") double maxLat
    );

    // Low zoom: geohash clusters
    @Query(value = """
    SELECT
      ST_X(ST_Centroid(ST_Collect(cl.geom::geometry))) AS lng,
      ST_Y(ST_Centroid(ST_Collect(cl.geom::geometry))) AS lat,
      COUNT(*) AS count,
      SUM(CASE WHEN r.is_stolen THEN 1 ELSE 0 END) AS stolenCount,
      SUM(CASE WHEN r.status = 'INACTIVE' THEN 1 ELSE 0 END) AS inactiveCount,
      AVG(cl.battery_level) AS avgBattery
    FROM current_location cl
    JOIN radio r ON r.id = cl.radio_id
    WHERE ST_Within(
      cl.geom::geometry,
      ST_MakeEnvelope(:minLng,:minLat,:maxLng,:maxLat,4326)
    )
    GROUP BY ST_GeoHash(cl.geom::geometry, :precision)
    """, nativeQuery = true)
    List<ClusterProjection> clusterInBounds(
            @Param("minLng") double minLng, @Param("minLat") double minLat,
            @Param("maxLng") double maxLng, @Param("maxLat") double maxLat,
            @Param("precision") int precision
    );

    // Geofence check: radios outside their assigned zone
    @Query(value = """
    SELECT cl.radio_id
    FROM current_location cl
    JOIN radio   r  ON r.id = cl.radio_id
    JOIN geofences g ON g.team_id = r.team_id
    WHERE NOT ST_Within(cl.geom::geometry, g.geom::geometry)
    """, nativeQuery = true)
    List<UUID> findRadiosOutsideZone();
}
