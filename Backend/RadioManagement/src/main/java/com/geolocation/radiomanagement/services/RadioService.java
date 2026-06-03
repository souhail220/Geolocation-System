package com.geolocation.radiomanagement.services;

import com.geolocation.radiomanagement.data.model.RadioSimDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Objects;

@Service
@Slf4j
public class RadioService {

    private static final String UPSERT_RADIO_SQL = """
            INSERT INTO radios (id, serial_number, name, active, team_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
                serial_number = EXCLUDED.serial_number,
                name = EXCLUDED.name,
                active = EXCLUDED.active,
                team_id = EXCLUDED.team_id,
                updated_at = EXCLUDED.updated_at
            """;

    private final WebClient webClient;
    private final JdbcTemplate jdbcTemplate;
    private final TransactionTemplate transactionTemplate;

    @Autowired
    public RadioService(
            WebClient.Builder builder,
            JdbcTemplate jdbcTemplate,
            TransactionTemplate transactionTemplate
    ) {
        this.webClient = builder.baseUrl("http://localhost:80").build();
        this.jdbcTemplate = jdbcTemplate;
        this.transactionTemplate = transactionTemplate;
    }

    public Flux<RadioSimDTO> streamRadios() {
        return webClient
                .get()
                .uri("/radios")
                .retrieve()
                .onStatus(
                        HttpStatusCode::isError,
                        res -> res.bodyToMono(String.class)
                                .map(body -> new RuntimeException(
                                        "Radio service error " + res.statusCode() + ": " + body
                                ))
                )
                .bodyToFlux(RadioSimDTO.class)
                .timeout(Duration.ofSeconds(30))
                .doOnNext(radio -> log.debug(
                        "Received radio — id: {}, serial: {}, name: {}, active: {}, team: {}",
                        radio.getId(),
                        radio.getSerialNumber(),
                        radio.getName(),
                        radio.isActive(),
                        radio.getTeam()
                ))
                .doOnComplete(() -> log.info("Finished streaming all radios"))
                .doOnError(ex -> log.error("Stream error: {}", ex.getMessage()))
                .onErrorResume(ex -> Flux.empty());
    }

    public Mono<String> saveRadioSim() {

        return streamRadios()
                .buffer(500)
                .concatMap(batch ->
                        Mono.fromCallable(() -> upsertRadios(batch))
                                .subscribeOn(Schedulers.boundedElastic()),
                        1
                )
                .reduce(0, Integer::sum)
                .map(total -> "Saved " + total + " radios successfully")
                .doOnError(ex -> log.error("Failed saving radios", ex));
    }

    private int upsertRadios(java.util.List<RadioSimDTO> batch) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        Timestamp timestamp = Timestamp.from(now.toInstant());

        return Objects.requireNonNullElse(transactionTemplate.execute(status -> {
            int[][] updateCounts = jdbcTemplate.batchUpdate(UPSERT_RADIO_SQL, batch, batch.size(), (ps, radio) -> {
                ps.setString(1, radio.getId());
                ps.setString(2, radio.getSerialNumber());
                ps.setString(3, radio.getName());
                ps.setBoolean(4, radio.isActive());
                ps.setInt(5, radio.getTeam());
                ps.setTimestamp(6, timestamp);
                ps.setTimestamp(7, timestamp);
            });
            return Arrays.stream(updateCounts)
                    .flatMapToInt(Arrays::stream)
                    .map(this::updatedRowCount)
                    .sum();
        }), 0);
    }

    private int updatedRowCount(int updateCount) {
        if (updateCount == Statement.SUCCESS_NO_INFO) {
            return 1;
        }
        if (updateCount == Statement.EXECUTE_FAILED) {
            return 0;
        }
        return updateCount;
    }

}
