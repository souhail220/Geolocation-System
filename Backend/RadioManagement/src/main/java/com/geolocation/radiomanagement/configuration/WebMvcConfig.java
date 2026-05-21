package com.geolocation.radiomanagement.configuration;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private static final long ASYNC_REQUEST_TIMEOUT_MILLIS = 300_000;
    private static final int WEBCLIENT_MAX_IN_MEMORY_SIZE = 16 * 1024 * 1024;

    @Bean
    public ModelMapper modelMapper(){
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT);
        modelMapper.addConverter(context -> {
            OffsetDateTime source = context.getSource();
            return source == null ? null : source.toLocalDateTime();
        }, OffsetDateTime.class, LocalDateTime.class);
        return modelMapper;
    }

    @Bean
    public WebClient.Builder webClientBuilder(){
        return WebClient.builder()
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(WEBCLIENT_MAX_IN_MEMORY_SIZE));
    }

    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        configurer.setDefaultTimeout(ASYNC_REQUEST_TIMEOUT_MILLIS);
    }

}
