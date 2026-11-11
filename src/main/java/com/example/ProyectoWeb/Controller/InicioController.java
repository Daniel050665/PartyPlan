package com.example.ProyectoWeb.Controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class InicioController {

    // El frontend llama a este endpoint con HTTP Basic para validar las credenciales
    @GetMapping("/me")
    public Map<String, String> usuarioActual(Authentication authentication) {
        return Map.of("usuario", authentication.getName());
    }
}
