package com.bookportal.exception;

import com.bookportal.dto.response.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(GlobalExceptionHandler.class)
class GlobalExceptionHandlerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    // ------------------------------------------------------------------
    // Integration tests: exceptions thrown through real HTTP requests
    // ------------------------------------------------------------------
    @Nested
    @DisplayName("via HTTP")
    class ViaHttp {

        @Test
        @DisplayName("401 without token returns JSON error with ERR_UNAUTHORIZED")
        void shouldReturn401JsonErrorWithoutToken() {
            ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                    url("/api/auth/me"),
                    HttpMethod.GET,
                    null,
                    ErrorResponse.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_UNAUTHORIZED");
            assertThat(response.getBody().path()).isEqualTo("/api/auth/me");
            assertThat(response.getBody().message()).isNotBlank();
            MediaType contentType = response.getHeaders().getContentType();
            assertThat(contentType).isNotNull();
            assertThat(contentType.isCompatibleWith(MediaType.APPLICATION_JSON)).isTrue();
        }

        @Test
        @DisplayName("unknown route returns 404 with ERR_NOT_FOUND")
        void shouldReturn404ForUnknownRoute() {
            // Outside /api/** so it is not blocked by security (which would
            // return 401 before the resource is resolved)
            ResponseEntity<ErrorResponse> response = restTemplate.getForEntity(
                    url("/does-not-exist"),
                    ErrorResponse.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_NOT_FOUND");
            assertThat(response.getBody().path()).isEqualTo("/does-not-exist");
        }

        @Test
        @DisplayName("malformed JSON body returns 400 with ERR_MALFORMED_BODY")
        void shouldReturn400ForMalformedBody() {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String malformed = "{\"name\": \"broken"; // missing closing brace
            HttpEntity<String> entity = new HttpEntity<>(malformed, headers);

            ResponseEntity<ErrorResponse> response = restTemplate.postForEntity(
                    url("/api/auth/register"),
                    entity,
                    ErrorResponse.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_MALFORMED_BODY");
        }

        @Test
        @DisplayName("type mismatch on query param returns 400 with ERR_INVALID_PARAM")
        void shouldReturn400ForTypeMismatch() {
            // /api/reviews?page=abc — "abc" cannot be converted to int
            ResponseEntity<ErrorResponse> response = restTemplate.getForEntity(
                    url("/api/reviews?page=abc"),
                    ErrorResponse.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_INVALID_PARAM");
            assertThat(response.getBody().message()).contains("page");
            assertThat(response.getBody().path()).isEqualTo("/api/reviews");
        }

        @Test
        @DisplayName("bean validation violation returns 400 with ERR_VALIDATION and field message")
        void shouldReturn400ForValidationViolation() {
            // password blank -> @NotBlank on RegisterRequest fires MethodArgumentNotValidException
            Map<String, String> body = Map.of("name", "validuser", "password", "");
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<ErrorResponse> response = restTemplate.postForEntity(
                    url("/api/auth/register"),
                    entity,
                    ErrorResponse.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_VALIDATION");
            assertThat(response.getBody().message()).contains("password");
        }

        @Test
        @DisplayName("pattern violation on username returns 400 with ERR_VALIDATION")
        void shouldReturn400ForPatternViolation() {
            Map<String, String> body = Map.of("name", "invalid name!", "password", "password123");
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<ErrorResponse> response = restTemplate.postForEntity(
                    url("/api/auth/register"),
                    entity,
                    ErrorResponse.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_VALIDATION");
            assertThat(response.getBody().message()).contains("name");
        }
    }

    // ------------------------------------------------------------------
    // Direct handler tests: exceptions the advice handles but that are
    // hard or impossible to trigger through the current HTTP surface
    // ------------------------------------------------------------------
    @Nested
    @DisplayName("direct handler invocation")
    class DirectHandlers {

        private GlobalExceptionHandler handler;
        private WebRequest request;

        @BeforeEach
        void setUp() {
            handler = new GlobalExceptionHandler();
            MockHttpServletRequest mockRequest = new MockHttpServletRequest("GET", "/api/test");
            request = new ServletWebRequest(mockRequest);
        }

        @Test
        @DisplayName("AccessDeniedException maps to 403 ERR_FORBIDDEN")
        void shouldMapAccessDeniedTo403() {
            ResponseEntity<ErrorResponse> response =
                    handler.handleAccessDenied(new AccessDeniedException("denied"), request);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_FORBIDDEN");
            assertThat(response.getBody().path()).isEqualTo("/api/test");
        }

        @Test
        @DisplayName("DataIntegrityViolationException maps to 409 ERR_CONFLICT")
        void shouldMapDataIntegrityTo409() {
            ResponseEntity<ErrorResponse> response = handler.handleDataIntegrity(
                    new DataIntegrityViolationException("duplicate key"),
                    request
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_CONFLICT");
        }

        @Test
        @DisplayName("MissingServletRequestParameterException maps to 400 ERR_MISSING_PARAM")
        void shouldMapMissingParamTo400() throws Exception {
            ResponseEntity<ErrorResponse> response = handler.handleMissingParam(
                    new MissingServletRequestParameterException("page", "int"),
                    request
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_MISSING_PARAM");
            assertThat(response.getBody().message()).contains("page");
        }

        @Test
        @DisplayName("ResponseStatusException keeps its status and reason")
        void shouldPreserveResponseStatus() {
            ResponseEntity<ErrorResponse> response = handler.handleResponseStatus(
                    new ResponseStatusException(HttpStatus.BAD_REQUEST, "bad credentials"),
                    request
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("bad credentials");
        }

        @Test
        @DisplayName("HttpMessageNotReadableException maps to 400 ERR_MALFORMED_BODY")
        void shouldMapMessageNotReadableTo400() {
            ResponseEntity<ErrorResponse> response = handler.handleMessageNotReadable(
                    new HttpMessageNotReadableException(
                            "Could not read JSON: broken body",
                            new IllegalArgumentException("Unrecognized token")
                    ),
                    request
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_MALFORMED_BODY");
        }

        @Test
        @DisplayName("MethodArgumentTypeMismatchException maps to 400 ERR_INVALID_PARAM")
        void shouldMapTypeMismatchTo400() {
            ResponseEntity<ErrorResponse> response = handler.handleTypeMismatch(
                    new MethodArgumentTypeMismatchException("abc", Integer.class, "page", null, null),
                    request
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_INVALID_PARAM");
            assertThat(response.getBody().message()).contains("page").contains("Integer");
        }

        @Test
        @DisplayName("generic Exception maps to 500 ERR_INTERNAL")
        void shouldMapGenericExceptionTo500() {
            ResponseEntity<ErrorResponse> response = handler.handleGeneral(
                    new RuntimeException("boom"),
                    request
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errorCode()).isEqualTo("ERR_INTERNAL");
            assertThat(response.getBody().path()).isEqualTo("/api/test");
        }
    }
}
