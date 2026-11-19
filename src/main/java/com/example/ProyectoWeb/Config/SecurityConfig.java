package com.example.ProyectoWeb.Config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// =====================================================================
// CONFIGURACION DE SPRING SECURITY
//
// Mecanismo: HTTP Basic, sin sesion (stateless).
//   El frontend envia en CADA peticion la cabecera:
//     Authorization: Basic <usuario:contrasena codificado en Base64>
//   Spring la decodifica, busca al usuario en memoria y compara la
//   contrasena con BCrypt. No se guarda sesion en el servidor.
//
// Usuarios de prueba (en memoria, con InMemoryUserDetailsManager):
//   admin            / admin123  -> rol ADMIN
//   juan@gmail.com   / juan123   -> rol USER (cliente Juan Perez)
//   maria@gmail.com  / maria123  -> rol USER (cliente Maria Gonzalez)
//
// Permisos (la regla que coincide primero es la que se aplica):
//   PUBLICO (sin iniciar sesion):
//     GET  /api/publico/**        catalogo publico de planes
//     POST /api/pagos/webhook     aviso de Wompi cuando cambia un pago
//   USER y ADMIN:
//     /api/auth/**                saber quien inicio sesion
//     GET /api/planes/**, GET /api/lugares/**   ver el catalogo
//     GET /api/reservas/**, POST /api/reservas  ver y crear reservas
//                                 (un USER solo ve y crea las SUYAS)
//     /api/pagos/wompi/**         pagar una reserva con Wompi
//   SOLO ADMIN:
//     todo lo demas de /api/**    usuarios, pagos, reportes, crear/editar/
//                                 eliminar planes y lugares, editar o
//                                 eliminar reservas...
// =====================================================================
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    // BCrypt: guarda las contrasenas cifradas, nunca en texto plano
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Los 3 usuarios de prueba, guardados en memoria
    @Bean
    public InMemoryUserDetailsManager userDetailsService(PasswordEncoder passwordEncoder) {

        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .roles("ADMIN")
                .build();

        // Los usuarios normales usan como nombre el correo del cliente,
        // asi el backend sabe que reservas son de cada uno.
        UserDetails juan = User.builder()
                .username("juan@gmail.com")
                .password(passwordEncoder.encode("juan123"))
                .roles("USER")
                .build();

        UserDetails maria = User.builder()
                .username("maria@gmail.com")
                .password(passwordEncoder.encode("maria123"))
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(admin, juan, maria);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                // CSRF protege formularios con cookies de sesion; aqui no hay cookies (HTTP Basic sin sesion)
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // El navegador envia OPTIONS antes de algunas peticiones (CORS): siempre se permite
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ---- 1. PUBLICOS ----
                        .requestMatchers(HttpMethod.GET, "/api/publico/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/pagos/webhook").permitAll()

                        // ---- 2. USER y ADMIN ----
                        .requestMatchers("/api/auth/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/planes/**", "/api/lugares/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reservas/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/reservas").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/pagos/wompi/**").hasAnyRole("USER", "ADMIN")

                        // ---- 3. SOLO ADMIN (todo lo demas de la API) ----
                        .requestMatchers("/api/**").hasRole("ADMIN")

                        .anyRequest().permitAll()
                )
                .httpBasic(basic -> basic.authenticationEntryPoint(sinCredenciales()))
                .exceptionHandling(errores -> errores
                        .authenticationEntryPoint(sinCredenciales())
                        .accessDeniedHandler(sinPermisos()));

        return http.build();
    }

    // 401: no envio credenciales o son incorrectas.
    // No se envia la cabecera WWW-Authenticate para que el navegador no muestre su ventana de login.
    private AuthenticationEntryPoint sinCredenciales() {
        return (request, response, authException) -> {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"mensaje\":\"Credenciales inválidas o sesión expirada.\"}");
        };
    }

    // 403: inicio sesion bien, pero su rol no tiene permiso para esa operacion
    private AccessDeniedHandler sinPermisos() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"mensaje\":\"No tienes permisos para realizar esta operación.\"}");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Event-Checksum"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
