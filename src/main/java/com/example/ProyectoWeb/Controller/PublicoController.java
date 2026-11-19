package com.example.ProyectoWeb.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProyectoWeb.Entities.plan;
import com.example.ProyectoWeb.Services.planService;

// =====================================================================
// ENDPOINTS PUBLICOS: no piden usuario ni contrasena (ver SecurityConfig).
// Sirven para que cualquier visitante vea el catalogo antes de registrarse.
// Prueba: abrir en el navegador http://localhost:8080/api/publico/planes
// sin haber iniciado sesion.
// =====================================================================
@RestController
@RequestMapping("/api/publico")
public class PublicoController {

    @Autowired
    private planService planService;

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
}
