package com.bookportal.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Welcome", description = "Health check and welcome endpoints")
public class WelcomeController {

    @GetMapping("/welcome")
    @Operation(summary = "Welcome message", description = "Health check endpoint returning a welcome message")
    public ResponseEntity<Map<String, String>> welcome() {
        return ResponseEntity.ok(Map.of("message", "Hola Mundo"));
    }
}
