package com.bookportal.controller;

import com.bookportal.dto.request.LoginRequest;
import com.bookportal.dto.request.RegisterRequest;
import com.bookportal.dto.response.AuthResponse;
import com.bookportal.dto.response.ErrorResponse;
import com.bookportal.dto.response.UserResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void shouldRegisterAndReturnAuthResponse() {
        RegisterRequest request = new RegisterRequest("testuser", "password123");

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                url("/api/auth/register"),
                request,
                AuthResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().accessToken()).isNotBlank();
        assertThat(response.getBody().refreshToken()).isNotBlank();
        assertThat(response.getBody().expiresIn()).isPositive();
        assertThat(response.getBody().user()).isNotNull();
        assertThat(response.getBody().user().name()).isEqualTo("testuser");
        assertThat(response.getBody().user().id()).isNotNull();
    }

    @Test
    void shouldLoginAndReturnAuthResponse() {
        // First register
        RegisterRequest registerReq = new RegisterRequest("loginuser", "password123");
        restTemplate.postForEntity(url("/api/auth/register"), registerReq, AuthResponse.class);

        // Then login
        LoginRequest loginReq = new LoginRequest("loginuser", "password123");
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                url("/api/auth/login"),
                loginReq,
                AuthResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().accessToken()).isNotBlank();
        assertThat(response.getBody().refreshToken()).isNotBlank();
        assertThat(response.getBody().user().name()).isEqualTo("loginuser");
    }

    @Test
    void shouldRefreshTokens() {
        // Register
        RegisterRequest registerReq = new RegisterRequest("refreshuser", "password123");
        AuthResponse registerRes = restTemplate.postForEntity(
                url("/api/auth/register"), registerReq, AuthResponse.class
        ).getBody();

        // Refresh
        java.util.Map<String, String> refreshRequest = java.util.Map.of("refreshToken", registerRes.refreshToken());
        ResponseEntity<AuthResponse> refreshResponse = restTemplate.postForEntity(
                url("/api/auth/refresh"),
                refreshRequest,
                AuthResponse.class
        );

        assertThat(refreshResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(refreshResponse.getBody()).isNotNull();
        assertThat(refreshResponse.getBody().accessToken()).isNotBlank();
        assertThat(refreshResponse.getBody().refreshToken()).isNotBlank();
    }

    @Test
    void shouldAccessMeEndpointWithValidToken() {
        // Register
        RegisterRequest registerReq = new RegisterRequest("meuser", "password123");
        AuthResponse registerRes = restTemplate.postForEntity(
                url("/api/auth/register"), registerReq, AuthResponse.class
        ).getBody();

        // Access /me with the access token
        var headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(registerRes.accessToken());
        var entity = new HttpEntity<>(headers);

        ResponseEntity<UserResponse> meResponse = restTemplate.exchange(
                url("/api/auth/me"),
                HttpMethod.GET,
                entity,
                UserResponse.class
        );

        assertThat(meResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(meResponse.getBody()).isNotNull();
        assertThat(meResponse.getBody().name()).isEqualTo("meuser");
    }

    @Test
    void shouldRejectInvalidCredentials() {
        LoginRequest request = new LoginRequest("nonexistent", "wrongpassword");

        ResponseEntity<ErrorResponse> response = restTemplate.postForEntity(
                url("/api/auth/login"),
                request,
                ErrorResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void shouldRejectDuplicateRegistration() {
        RegisterRequest request = new RegisterRequest("dupeuser", "password123");

        // First registration
        restTemplate.postForEntity(url("/api/auth/register"), request, AuthResponse.class);

        // Second registration should fail
        ResponseEntity<ErrorResponse> response = restTemplate.postForEntity(
                url("/api/auth/register"),
                request,
                ErrorResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void shouldRejectUnauthenticatedAccessToMe() {
        ResponseEntity<String> response = restTemplate.exchange(
                url("/api/auth/me"),
                HttpMethod.GET,
                null,
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
