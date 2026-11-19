package com.example.ProyectoWeb.Controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Endpoint para USER y ADMIN (ver SecurityConfig)
@RestController
@RequestMapping("/api/auth")
public class InicioController {

    // GET /api/auth/me
    // El frontend lo llama al iniciar sesion para comprobar las credenciales.
    // Si son correctas responde: { "usuario": "admin", "rol": "ADMIN" }
    // Si son incorrectas, Spring Security responde 401 antes de llegar aqui.
    @GetMapping("/me")
    public Map<String, String> usuarioActual(Authentication authentication) {
        String rol = "USER";
        for (GrantedAuthority permiso : authentication.getAuthorities()) {
            // Spring guarda los roles con el prefijo ROLE_ (ej. ROLE_ADMIN)
            if (permiso.getAuthority().equals("ROLE_ADMIN")) {
                rol = "ADMIN";
            }
        }
        return Map.of("usuario", authentication.getName(), "rol", rol);
    }
}
