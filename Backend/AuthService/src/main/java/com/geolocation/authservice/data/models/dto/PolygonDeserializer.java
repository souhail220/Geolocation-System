package com.geolocation.authservice.data.models.dto;

import org.springframework.data.geo.Point;
import org.springframework.data.geo.Polygon;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.deser.std.StdDeserializer;

import java.util.ArrayList;
import java.util.List;

public class PolygonDeserializer extends StdDeserializer<Polygon> {

    public PolygonDeserializer() {
        super(Polygon.class);
    }

    @Override
    public Polygon deserialize(JsonParser parser, DeserializationContext context) throws JacksonException {
        JsonNode root = context.readTree(parser);
        JsonNode pointsNode = root.path("points");

        if (!pointsNode.isArray()) {
            return context.reportInputMismatch(Polygon.class, "Expected geom.points to be an array");
        }

        List<Point> points = new ArrayList<>();
        for (int i = 0; i < pointsNode.size(); i++) {
            JsonNode pointNode = pointsNode.get(i);
            if (!pointNode.hasNonNull("x") || !pointNode.hasNonNull("y")) {
                return context.reportInputMismatch(Polygon.class, "Expected each geom point to contain x and y");
            }

            points.add(new Point(pointNode.path("x").asDouble(), pointNode.path("y").asDouble()));
        }

        return new Polygon(points);
    }
}
