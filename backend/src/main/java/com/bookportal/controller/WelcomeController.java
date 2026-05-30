package com.bookportal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class WelcomeController {

    @GetMapping("/welcome")
    public ResponseEntity<Map<String, String>> welcome() {
        return ResponseEntity.ok(Map.of("message", "Hola Mundo"));
    }
}
