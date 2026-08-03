package com.schoolsync.exception;

public class ResourceAlreadyExistsException extends RuntimeException {

    private final String field;

    public ResourceAlreadyExistsException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
