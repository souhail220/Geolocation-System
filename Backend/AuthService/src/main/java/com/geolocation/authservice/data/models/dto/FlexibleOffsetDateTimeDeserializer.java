package com.geolocation.authservice.data.models.dto;

import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.deser.std.StdDeserializer;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public class FlexibleOffsetDateTimeDeserializer extends StdDeserializer<OffsetDateTime> {

    public FlexibleOffsetDateTimeDeserializer() {
        super(OffsetDateTime.class);
    }

    @Override
    public OffsetDateTime deserialize(JsonParser parser, DeserializationContext context) throws JacksonException {
        String value = parser.getValueAsString();

        try {
            return OffsetDateTime.parse(value);
        } catch (RuntimeException ignored) {
            return LocalDateTime.parse(value).atOffset(ZoneOffset.UTC);
        }
    }
}
