package com.campuscore.config;

import com.campuscore.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admission/apply").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admission/check-status").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/announcements/feed").permitAll()

                        .requestMatchers("/api/admission/**", "/api/audit/**")
                            .hasRole("Admin")
                        .requestMatchers("/api/analytics/overview", "/api/analytics/attendance-by-class",
                                "/api/analytics/attendance-trend", "/api/analytics/fee-summary",
                                "/api/analytics/admission-funnel", "/api/analytics/result-performance",
                                "/api/analytics/export/**")
                            .hasRole("Admin")
                        .requestMatchers("/api/analytics/at-risk-students")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers("/api/analytics/student/**")
                            .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/user/teachers")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.GET, "/api/user/teachers/*")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.POST, "/api/user/teachers")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.PUT, "/api/user/teachers/*")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.DELETE, "/api/user/teachers/*")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.POST, "/api/user/students", "/api/user/students/bulk-import")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.PUT, "/api/user/students/**")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/user/students/**")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.GET, "/api/user/students", "/api/user/classes", "/api/user/students/class/**")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers("/api/studentmanagement/enrollment/**")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.GET, "/api/announcements/all")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.POST, "/api/announcements")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.DELETE, "/api/announcements/*")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.POST, "/api/attendance/face/session")
                            .hasRole("Teacher")
                        .requestMatchers(HttpMethod.POST, "/api/attendance/face/session/*/close")
                            .hasRole("Teacher")
                        .requestMatchers(HttpMethod.GET, "/api/attendance/face/session/class/**")
                            .hasRole("Teacher")
                        .requestMatchers(HttpMethod.GET, "/api/attendance/face/session/student")
                            .hasRole("Student")
                        .requestMatchers("/api/attendance/face/enroll", "/api/attendance/face/enrollment", "/api/attendance/face/check-in")
                            .hasRole("Student")
                        .requestMatchers(HttpMethod.POST, "/api/attendance/mark")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.PUT, "/api/attendance/**")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/attendance/**")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.GET, "/api/attendance/all")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.POST, "/api/result/**")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.PUT, "/api/result/**")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.DELETE, "/api/result/**")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.GET, "/api/result/all", "/api/result/class/**", "/api/result/statistics/**")
                            .hasAnyRole("Admin", "Teacher")
                        .requestMatchers(HttpMethod.GET, "/api/studentmanagement/fee/all")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.POST, "/api/studentmanagement/fee", "/api/studentmanagement/fee/remind/**")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.PUT, "/api/studentmanagement/fee/pay/*")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.POST, "/api/studentmanagement/fee/online/order/*",
                                "/api/studentmanagement/fee/online/verify/*")
                            .hasAnyRole("Student", "Parent")
                        .requestMatchers(HttpMethod.PUT, "/api/studentmanagement/fee/*")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/studentmanagement/fee/*")
                            .hasRole("Admin")
                        .requestMatchers(HttpMethod.GET, "/api/studentmanagement/fee/student/*", "/api/studentmanagement/fee/receipt/*")
                            .hasAnyRole("Admin", "Student", "Parent")
                        .requestMatchers("/api/parent/**")
                            .hasAnyRole("Admin", "Parent")
                        .requestMatchers("/api/notifications/**")
                            .authenticated()
                        .requestMatchers("/api/studentmanagement/profile/**", "/api/teachermanagement/profile/**",
                                "/api/attendance/student/**", "/api/result/student/**", "/api/result/report-card/**")
                            .authenticated()
                        .requestMatchers("/api/auth/change-password").authenticated()
                        .requestMatchers("/api/ai/**").hasAnyRole("Admin", "Teacher")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"message\":\"Authentication required\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"message\":\"You are not authorized to perform this action\"}");
                        }))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:5173"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setExposedHeaders(List.of("Content-Disposition"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
