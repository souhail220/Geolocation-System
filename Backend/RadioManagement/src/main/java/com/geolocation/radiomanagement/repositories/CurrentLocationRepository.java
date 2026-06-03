package com.geolocation.radiomanagement.repositories;

import com.geolocation.radiomanagement.data.entities.CurrentLocation;
import com.geolocation.radiomanagement.data.model.ClusterProjection;
import com.geolocation.radiomanagement.data.model.RadioLocationProjection;
import com.geolocation.radiomanagement.data.model.RadioMapProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface CurrentLocationRepository extends JpaRepository<CurrentLocation, String> {

    @Query(value = """
    SELECT
      cl.radio_id AS radioId,
      cl.latitude AS latitude,
      cl.longitude AS longitude,
      cl.battery_level AS batteryLevel,
      cl.signal_strength AS signalStrength,
      cl.timestamp AS timestamp,
      r.name AS name,
      r.serial_number AS serialNumber,
      r.team_id AS teamId,
      cl.active AS active,
      cl.stolen AS stolen,
      cl.outside_zone AS outsideZone
    FROM current_location cl
    JOIN radios r ON r.id = cl.radio_id
    ORDER BY cl.timestamp DESC
    """, nativeQuery = true)
    List<RadioLocationProjection> findAllForLocationStream();

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
      r.serial_number AS serialNumber,
      r.team_id AS teamId
    FROM current_location cl
    JOIN radios r  ON r.id = cl.radio_id
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
      ST_X(ST_Centroid(ST_Collect(cl.geom::geometry))) AS "longitude",
      ST_Y(ST_Centroid(ST_Collect(cl.geom::geometry))) AS "latitude",
      COUNT(*) AS "count",
      SUM(CASE WHEN NOT r.active THEN 1 ELSE 0 END) AS "inactiveCount",
      AVG(cl.battery_level) AS "avgBattery"
    FROM current_location cl
    JOIN radios r ON r.id = cl.radio_id
    WHERE ST_Within(
      cl.geom::geometry,
      ST_MakeEnvelope(:minLng,:minLat,:maxLng,:maxLat,4326)
    )
    GROUP BY ST_GeoHash(cl.geom::geometry, CAST(:precision AS integer))
    """, nativeQuery = true)
    List<ClusterProjection> clusterInBounds(
            @Param("minLng") double minLng, @Param("minLat") double minLat,
            @Param("maxLng") double maxLng, @Param("maxLat") double maxLat,
            @Param("precision") int precision
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query(value = """
    UPDATE current_location
    SET outside_zone = :outsideZone
    WHERE radio_id = :radioId
    """, nativeQuery = true)
    int updateOutsideZoneStatus(@Param("radioId") String radioId, @Param("outsideZone") boolean outsideZone);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query(value = """
    UPDATE current_location
    SET stolen = :stolen
    WHERE radio_id = :radioId
    """, nativeQuery = true)
    int updateStolenStatus(@Param("radioId") String radioId, @Param("stolen") boolean stolen);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query(value = """
    UPDATE current_location
    SET active = :active
    WHERE radio_id = :radioId
    """, nativeQuery = true)
    int updateActiveStatus(@Param("radioId") String radioId, @Param("active") boolean active);
}
