package com.schoolsync.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.schoolsync.exception.ResourceAlreadyExistsException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "An error occurred");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
    
    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleResourceExists(
            ResourceAlreadyExistsException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("field", ex.getField());
        body.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getBindingResult().getAllErrors().get(0).getDefaultMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
    
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DataIntegrityViolationException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);

        String msg = ex.getMostSpecificCause().getMessage();

        if (msg.contains("roll_no")) {
            body.put("field", "rollNo");
            body.put("message", "Roll number already exists");
        } else if (msg.contains("email")) {
            body.put("field", "email");
            body.put("message", "Email already exists");
        } else if (msg.contains("phone")) {
            body.put("field", "phone");
            body.put("message", "Phone number already exists");
        } else {
            body.put("message", "Duplicate record exists");
        }

        return ResponseEntity.badRequest().body(body);
    }
}
