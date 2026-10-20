package com.campuspulse.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("error", ex.getMessage());
        body.put("message", ex.getMessage());
        body.put("status", HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DuplicateComplaintException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateComplaint(
            DuplicateComplaintException ex) {
        log.info("Duplicate complaint detected: {}", ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("duplicate", true);
        body.put("message", ex.getMessage());
        body.put("error", ex.getMessage());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("existingComplaint", ex.getExistingComplaint());
        body.put("existingTicket", ex.getExistingComplaint());
        body.put("canUpvote", true);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(ConflictException ex) {
        log.warn("Conflict exception: {}", ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("success", false);
        body.put("message", ex.getMessage());
        body.put("error", ex.getMessage());
        body.put("status", HttpStatus.CONFLICT.value());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataConflict(DataIntegrityViolationException ex) {
        // Log full exception details server-side for diagnostics, but never expose raw SQL or PII to the client
        log.error("Database data integrity violation: {}", ex.getMessage(), ex);

        String causeMessage = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        String lowerCause = causeMessage != null ? causeMessage.toLowerCase() : "";

        boolean isUniqueViolation = lowerCause.contains("unique") || lowerCause.contains("duplicate") || lowerCause.contains("23505");
        boolean isStatusConstraint = lowerCause.contains("status") || lowerCause.contains("complaints_status_check");

        String userSafeMessage;
        if (isUniqueViolation) {
            userSafeMessage = "This request conflicts with an existing record.";
        } else if (isStatusConstraint) {
            userSafeMessage = "Unable to update complaint status. Please try again or contact support.";
        } else {
            userSafeMessage = "Unable to process request due to a database integrity restriction. Please try again or contact support.";
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("success", false);
        body.put("message", userSafeMessage);
        body.put("error", userSafeMessage);
        body.put("status", HttpStatus.CONFLICT.value());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("error", "Forbidden");
        body.put("message", ex.getMessage());
        body.put("status", HttpStatus.FORBIDDEN.value());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("error", "Validation failed");
        body.put("message", "Validation failed");
        body.put("fieldErrors", fieldErrors);
        body.put("status", HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("Unhandled runtime exception: ", ex);
        String rawMsg = ex.getMessage();
        // Prevent database or SQL detail leakage if a runtime exception wraps database error
        String safeMessage = (rawMsg != null && !rawMsg.toLowerCase().contains("sql") && !rawMsg.toLowerCase().contains("constraint") && !rawMsg.toLowerCase().contains("violat"))
                ? rawMsg
                : "Unable to process request. Please try again or contact support.";

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("error", safeMessage);
        body.put("message", safeMessage);
        body.put("status", HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unhandled internal server error: ", ex);
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("error", "Internal server error");
        body.put("message", "An unexpected error occurred. Please try again or contact support.");
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
