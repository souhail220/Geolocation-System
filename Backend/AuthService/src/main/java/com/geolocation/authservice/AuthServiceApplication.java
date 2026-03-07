package com.geolocation.authservice;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthServiceApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("./") // Specify the path to your .env file if not in root
                .ignoreIfMissing() // Ignore if the .env file is missing
                .load();

        // Set environment variables from the .env file
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );
        SpringApplication.run(AuthServiceApplication.class, args);
    }

}
