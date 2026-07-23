package com.bookportal.exception;

import com.bookportal.dto.response.ErrorResponse;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

@RestControllerAdvice
@Hidden
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex, WebRequest request) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        String error = (status != null) ? status.getReasonPhrase() : "Error";
        ErrorResponse body = new ErrorResponse(error, ex.getReason())
                .withPath(getPath(request));
        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));
        ErrorResponse body = new ErrorResponse(
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                "ERR_VALIDATION"
        ).withPath(getPath(request));
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex, WebRequest request) {
        String message = ex.getConstraintViolations().stream()
                .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
                .collect(Collectors.joining(", "));
        ErrorResponse body = new ErrorResponse(
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                "ERR_VALIDATION"
        ).withPath(getPath(request));
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleHandlerMethodValidation(HandlerMethodValidationException ex, WebRequest request) {
        String message = ex.getAllValidationResults().stream()
                .flatMap(r -> r.getResolvableErrors().stream())
                .map(e -> e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        ErrorResponse body = new ErrorResponse(
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message.isBlank() ? "Invalid request parameters" : message,
                "ERR_VALIDATION"
        ).withPath(getPath(request));
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(HttpMessageNotReadableException ex, WebRequest request) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Malformed request body: " + ex.getMostSpecificCause().getMessage(),
                "ERR_MALFORMED_BODY"
        ).withPath(getPath(request));
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex, WebRequest request) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Missing required parameter: " + ex.getParameterName(),
                "ERR_MISSING_PARAM"
        ).withPath(getPath(request));
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex, WebRequest request) {
        log.warn("Data integrity violation", ex);
        ErrorResponse body = new ErrorResponse(
                HttpStatus.CONFLICT.getReasonPhrase(),
                "Data conflict — the resource may already exist or a constraint was violated",
                "ERR_CONFLICT"
        ).withPath(getPath(request));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResource(NoResourceFoundException ex, WebRequest request) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                "Resource not found: " + ex.getResourcePath(),
                "ERR_NOT_FOUND"
        ).withPath(getPath(request));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.FORBIDDEN.getReasonPhrase(),
                "You do not have permission to perform this action",
                "ERR_FORBIDDEN"
        ).withPath(getPath(request));
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex, WebRequest request) {
        log.error("Unhandled exception", ex);
        ErrorResponse body = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "An unexpected error occurred. Please try again later.",
                "ERR_INTERNAL"
        ).withPath(getPath(request));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private String getPath(WebRequest request) {
        if (request instanceof ServletWebRequest swr) {
            return swr.getRequest().getRequestURI();
        }
        return null;
    }
}
