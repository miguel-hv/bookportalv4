package com.bookportal.controller;

import com.bookportal.dto.request.CreateReviewRequest;
import com.bookportal.dto.request.RegisterRequest;
import com.bookportal.dto.response.AuthResponse;
import com.bookportal.dto.response.ErrorResponse;
import com.bookportal.dto.response.ReviewResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class BookReviewControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;
    private String userName;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @BeforeEach
    void setUp() {
        String uniqueId = "reviewuser" + System.currentTimeMillis();
        RegisterRequest registerReq = new RegisterRequest(uniqueId, "password123");
        ResponseEntity<AuthResponse> registerRes = restTemplate.postForEntity(
                url("/api/auth/register"),
                registerReq,
                AuthResponse.class
        );
        jwtToken = registerRes.getBody().accessToken();
        userName = uniqueId;
    }

    @Test
    void shouldCreateReviewWithValidJwt() {
        CreateReviewRequest request = new CreateReviewRequest("Cien años de soledad", "Una obra maestra.");
        var headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        var entity = new HttpEntity<>(request, headers);

        ResponseEntity<ReviewResponse> response = restTemplate.exchange(
                url("/api/reviews"),
                HttpMethod.POST,
                entity,
                ReviewResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().id()).isNotNull();
        assertThat(response.getBody().bookTitle()).isEqualTo("Cien años de soledad");
        assertThat(response.getBody().reviewText()).isEqualTo("Una obra maestra.");
        assertThat(response.getBody().userName()).isEqualTo(userName);
        assertThat(response.getBody().createdAt()).isNotNull();
    }

    @Test
    void shouldRejectCreateReviewWithoutJwt() {
        CreateReviewRequest request = new CreateReviewRequest("Cien años de soledad", "Una obra maestra.");

        ResponseEntity<String> response = restTemplate.exchange(
                url("/api/reviews"),
                HttpMethod.POST,
                new HttpEntity<>(request),
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldReturn400ForBlankBookTitle() {
        CreateReviewRequest request = new CreateReviewRequest("", "Some review text");
        var headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        var entity = new HttpEntity<>(request, headers);

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                url("/api/reviews"),
                HttpMethod.POST,
                entity,
                ErrorResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void shouldReturn400ForBlankReviewText() {
        CreateReviewRequest request = new CreateReviewRequest("A title", "");
        var headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        var entity = new HttpEntity<>(request, headers);

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                url("/api/reviews"),
                HttpMethod.POST,
                entity,
                ErrorResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void shouldReturn400ForNullBookTitle() {
        CreateReviewRequest request = new CreateReviewRequest(null, "Some review text");
        var headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        var entity = new HttpEntity<>(request, headers);

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                url("/api/reviews"),
                HttpMethod.POST,
                entity,
                ErrorResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void shouldReturn400ForNullReviewText() {
        CreateReviewRequest request = new CreateReviewRequest("A title", null);
        var headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        var entity = new HttpEntity<>(request, headers);

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                url("/api/reviews"),
                HttpMethod.POST,
                entity,
                ErrorResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void shouldGetReviewsWithoutAuth() throws Exception {
        // Create a review first so there is data
        CreateReviewRequest createReq = new CreateReviewRequest("Cien años de soledad", "Una obra maestra.");
        var headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        restTemplate.exchange(
                url("/api/reviews"),
                HttpMethod.POST,
                new HttpEntity<>(createReq, headers),
                ReviewResponse.class
        );

        ResponseEntity<String> rawResponse = restTemplate.exchange(
                url("/api/reviews"),
                HttpMethod.GET,
                null,
                String.class
        );

        assertThat(rawResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(rawResponse.getBody()).isNotNull();

        Map<String, Object> pageMap = objectMapper.readValue(rawResponse.getBody(),
                new TypeReference<Map<String, Object>>() {});
        assertThat(pageMap.get("content")).isNotNull();
        assertThat((List<?>) pageMap.get("content")).isNotEmpty();
        assertThat(pageMap.get("totalElements")).isNotNull();
    }

    @Test
    void shouldGetReviewsWithPagination() throws Exception {
        // Create 2 reviews with the same user for this test
        CreateReviewRequest req1 = new CreateReviewRequest("Book 1", "Review 1");
        CreateReviewRequest req2 = new CreateReviewRequest("Book 2", "Review 2");
        var headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);

        restTemplate.exchange(url("/api/reviews"), HttpMethod.POST,
                new HttpEntity<>(req1, headers), ReviewResponse.class);
        restTemplate.exchange(url("/api/reviews"), HttpMethod.POST,
                new HttpEntity<>(req2, headers), ReviewResponse.class);

        ResponseEntity<String> rawResponse = restTemplate.exchange(
                url("/api/reviews?page=0&size=1"),
                HttpMethod.GET,
                null,
                String.class
        );

        assertThat(rawResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(rawResponse.getBody()).isNotNull();

        Map<String, Object> pageMap = objectMapper.readValue(rawResponse.getBody(),
                new TypeReference<Map<String, Object>>() {});

        List<?> content = (List<?>) pageMap.get("content");
        assertThat(content).hasSize(1);
        assertThat((int) pageMap.get("totalElements")).isGreaterThanOrEqualTo(2);
        assertThat((int) pageMap.get("page")).isEqualTo(0);
        assertThat((int) pageMap.get("size")).isEqualTo(1);
    }
}
