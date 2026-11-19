package com.example.ProyectoWeb.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProyectoWeb.Entities.plan;
import com.example.ProyectoWeb.Entities.usuario;
import com.example.ProyectoWeb.Repository.usuarioRepository;
import com.example.ProyectoWeb.Services.planService;

// =====================================================================
// ENDPOINTS PUBLICOS: no piden usuario ni contrasena (ver SecurityConfig).
//   GET  /api/publico/planes    catalogo de planes para cualquier visitante
//   POST /api/publico/registro  crear una cuenta de cliente (rol USER)
// Prueba: abrir en el navegador http://localhost:8080/api/publico/planes
// sin haber iniciado sesion.
// =====================================================================
@RestController
@RequestMapping("/api/publico")
public class PublicoController {

    @Autowired
    private planService planService;

    @Autowired
    private usuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // GET /api/publico/planes -> catalogo publico (solo nombre, tipo y precio)
    @GetMapping("/planes")
    public ResponseEntity<List<Map<String, Object>>> catalogo() {
        List<Map<String, Object>> catalogo = new ArrayList<>();
        for (plan p : planService.obtenerTodos()) {
            catalogo.add(Map.of(
                    "nombre", p.getNombre(),
                    "tipo", p.getTipo(),
                    "precio", p.getPrecio()));
        }
        return ResponseEntity.ok(catalogo);
    }

    // POST /api/publico/registro
    // Recibe: { "nombreCompleto": "...", "correo": "...", "telefono": "...", "contrasena": "..." }
    // Crea el cliente en PostgreSQL con la contrasena CIFRADA con BCrypt.
    // Despues de registrarse, la persona inicia sesion con su correo y contrasena (rol USER).
    @PostMapping("/registro")
    public ResponseEntity<Map<String, String>> registrar(@RequestBody Map<String, String> datos) {
        String nombre = texto(datos.get("nombreCompleto"));
        String correo = texto(datos.get("correo")).toLowerCase();
        String telefono = texto(datos.get("telefono"));
        String contrasena = texto(datos.get("contrasena"));

        // ---- Validaciones (el frontend tambien las hace, pero aqui son las que cuentan) ----
        if (nombre.length() < 3) {
            return error(HttpStatus.BAD_REQUEST, "El nombre debe tener al menos 3 letras.");
        }
        if (!correo.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return error(HttpStatus.BAD_REQUEST, "Escribe un correo válido.");
        }
        if (!telefono.matches("[0-9+ ]{7,15}")) {
            return error(HttpStatus.BAD_REQUEST, "El teléfono debe tener entre 7 y 15 dígitos.");
        }
        if (contrasena.length() < 6) {
            return error(HttpStatus.BAD_REQUEST, "La contraseña debe tener al menos 6 caracteres.");
        }
        if (usuarioRepository.existsByCorreo(correo)) {
            return error(HttpStatus.CONFLICT, "Ya existe una cuenta con el correo " + correo + ".");
        }

        usuario nuevo = usuario.builder()
                .nombreCompleto(nombre)
                .correo(correo)
                .telefono(telefono)
                .contrasena(passwordEncoder.encode(contrasena)) // BCrypt: se guarda $2a$10$..., nunca la contrasena real
                .build();
        usuarioRepository.save(nuevo);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensaje", "Cuenta creada. Ya puedes iniciar sesión.", "correo", correo));
    }

    // Evita errores si un campo no viene: null -> ""
    private String texto(String valor) {
        if (valor == null) {
            return "";
        }
        return valor.trim();
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String mensaje) {
        return ResponseEntity.status(status).body(Map.of("mensaje", mensaje));
    }
}
