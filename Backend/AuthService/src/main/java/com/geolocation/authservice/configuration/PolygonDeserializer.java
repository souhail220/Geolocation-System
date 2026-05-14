package com.geolocation.authservice.configuration;

import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ValueDeserializer;   // ← not JsonDeserializer
import org.locationtech.jts.geom.*;

import java.util.ArrayList;
import java.util.List;

public class PolygonDeserializer extends ValueDeserializer<Polygon> {

    private static final GeometryFactory GEOMETRY_FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Override
    public Polygon deserialize(JsonParser p, DeserializationContext ctx) {
        try {
            JsonNode geojson = p.readValueAsTree();
            JsonNode coordinates = readPolygonCoordinates(geojson);

            LinearRing shell = toLinearRing(coordinates.get(0));
            LinearRing[] holes = new LinearRing[Math.max(0, coordinates.size() - 1)];
            for (int i = 1; i < coordinates.size(); i++) {
                holes[i - 1] = toLinearRing(coordinates.get(i));
            }

            return GEOMETRY_FACTORY.createPolygon(shell, holes);
        } catch (Exception e) {
            throw new RuntimeException("Invalid GeoJSON polygon: " + e.getMessage(), e);
        }
    }

    private JsonNode readPolygonCoordinates(JsonNode geojson) {
        if (geojson == null || !geojson.isObject()) {
            throw new IllegalArgumentException("expected a GeoJSON object");
        }

        JsonNode type = geojson.get("type");
        if (type == null || !"Polygon".equalsIgnoreCase(type.asString())) {
            throw new IllegalArgumentException("expected GeoJSON type Polygon");
        }

        JsonNode coordinates = geojson.get("coordinates");
        if (coordinates == null || !coordinates.isArray() || coordinates.isEmpty()) {
            throw new IllegalArgumentException("Polygon coordinates must contain at least one ring");
        }

        return coordinates;
    }

    private LinearRing toLinearRing(JsonNode ring) {
        if (ring == null || !ring.isArray() || ring.size() < 4) {
            throw new IllegalArgumentException("Polygon rings must contain at least four positions");
        }

        List<Coordinate> coordinates = new ArrayList<>();
        for (JsonNode position : ring) {
            coordinates.add(toCoordinate(position));
        }

        if (!coordinates.get(0).equals2D(coordinates.get(coordinates.size() - 1))) {
            coordinates.add(new Coordinate(coordinates.get(0)));
        }

        return GEOMETRY_FACTORY.createLinearRing(coordinates.toArray(Coordinate[]::new));
    }

    private Coordinate toCoordinate(JsonNode position) {
        if (position == null || !position.isArray() || position.size() < 2) {
            throw new IllegalArgumentException("Polygon positions must contain longitude and latitude");
        }

        return new Coordinate(position.get(0).asDouble(), position.get(1).asDouble());
    }
}
