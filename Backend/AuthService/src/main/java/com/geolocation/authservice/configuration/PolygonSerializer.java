package com.geolocation.authservice.configuration;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.Polygon;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonGenerator;
import tools.jackson.databind.SerializationContext;
import tools.jackson.databind.ser.std.StdSerializer;

public class PolygonSerializer extends StdSerializer<Polygon> {

    public PolygonSerializer() {
        super(Polygon.class);
    }

    @Override
    public void serialize(Polygon value, JsonGenerator gen, SerializationContext ctxt) throws JacksonException {
        gen.writeStartObject();
        gen.writeStringProperty("type", "Polygon");
        gen.writeArrayPropertyStart("coordinates");
        writeRing(gen, value.getExteriorRing());
        for (int i = 0; i < value.getNumInteriorRing(); i++) {
            writeRing(gen, value.getInteriorRingN(i));
        }
        gen.writeEndArray();
        gen.writeEndObject();
    }

    private void writeRing(JsonGenerator gen, LineString ring) throws JacksonException {
        gen.writeStartArray();
        for (Coordinate coordinate : ring.getCoordinates()) {
            gen.writeStartArray();
            gen.writeNumber(coordinate.x);
            gen.writeNumber(coordinate.y);
            gen.writeEndArray();
        }
        gen.writeEndArray();
    }
}
