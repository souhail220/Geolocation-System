package com.geolocation.authservice.exceptions;

import org.springframework.dao.DataAccessException;

public class ServiceException extends RuntimeException {

    public ServiceException(String message) {
        super(message);
    }

    public ServiceException(String message, DataAccessException e) {
        super(message, e);
    }
}
