package com.geolocation.authservice.data.models;

import lombok.Data;

@Data
public class APIResponse<T> {
    private boolean success;
    private T result;
    private String message;
    private String error;

    private APIResponse(T result, boolean success, String error) {
        this.result = result;
        this.success = success;
        this.error = error;
    }

    private APIResponse(boolean success, String error) {
        this.success = success;
        this.error = error;
    }

    private APIResponse(boolean success, T data) {
        this.success = success;
        this.result = data;
    }

    private APIResponse(boolean success, T data, String message) {
        this.success = success;
        this.result = data;
        this.message = message;
    }

    public static <T> APIResponse<T> success(T data){
        return new APIResponse<T>(true, data);
    }
    public static <T> APIResponse<T> success(T data, String message){
        return new APIResponse<T>(true, data, message);
    }

    public static <T> APIResponse<T> error(T data, String error){
        return new APIResponse<>(data, false, error);
    }

    public static <T> APIResponse<T> error(String error){
        return new APIResponse<T>(false, error);
    }
}
