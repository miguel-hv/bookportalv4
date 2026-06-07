package com.bookportal.service;

import com.bookportal.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("jwtuser", "irrelevant");
        testUser.setId(42L);
    }

    @Test
    void shouldGenerateAccessToken() {
        String token = jwtService.generateAccessToken(testUser);
        assertThat(token).isNotBlank();
    }

    @Test
    void shouldGenerateRefreshToken() {
        String token = jwtService.generateRefreshToken(testUser);
        assertThat(token).isNotBlank();
    }

    @Test
    void shouldExtractUserIdFromToken() {
        String token = jwtService.generateAccessToken(testUser);
        Long userId = jwtService.getUserIdFromToken(token);
        assertThat(userId).isEqualTo(42L);
    }

    @Test
    void shouldValidateValidToken() {
        String token = jwtService.generateAccessToken(testUser);
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void shouldRejectInvalidToken() {
        assertThat(jwtService.isTokenValid("invalid.token.here")).isFalse();
    }

    @Test
    void shouldRejectMalformedToken() {
        assertThat(jwtService.isTokenValid("")).isFalse();
    }

    @Test
    void shouldReturnExpirationMillis() {
        assertThat(jwtService.getAccessTokenExpiration()).isPositive();
    }
}
