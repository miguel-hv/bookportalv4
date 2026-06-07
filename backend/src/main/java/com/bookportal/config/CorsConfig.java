package com.bookportal.config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS configuration has been consolidated into {@link SecurityConfig}.
 * This class is intentionally left empty to avoid duplicate CORS configuration.
 *
 * @see SecurityConfig#corsConfigurationSource()
 */
@Configuration
public class CorsConfig {
    // CORS is now configured in SecurityConfig via CorsConfigurationSource bean.
    // This class remains as a bean placeholder to avoid injection issues
    // if other components reference it by type.
}
