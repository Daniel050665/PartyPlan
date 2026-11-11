package com.example.ProyectoWeb.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProyectoWeb.DTO.PaginaRespuesta;
import com.example.ProyectoWeb.Entities.lugar;
import com.example.ProyectoWeb.Services.lugarService;

// Todos los endpoints de este controlador devuelven ResponseEntity:
// la respuesta junto con el codigo HTTP (200, 201, 204, 400, 404).
@RestController
@RequestMapping("/api/lugares")
public class lugarController {

    @Autowired
    private lugarService service;

    // GET /api/lugares -> 200 con la lista completa
    @GetMapping
    public ResponseEntity<List<lugar>> listar() {
        return ResponseEntity.ok(service.obtenerTodos());
    }

    // GET /api/lugares/paginado?pagina=0&tamano=5&texto=museo
    // 200 con una pagina de resultados, o 400 si los parametros no son validos
    @GetMapping("/paginado")
    public ResponseEntity<?> listarPaginado(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "5") int tamano,
            @RequestParam(defaultValue = "") String texto) {

        if (pagina < 0 || tamano < 1) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "La página debe ser 0 o mayor y el tamaño mayor que 0."));
        }

        PaginaRespuesta<lugar> resultado = service.buscarPaginado(texto.trim(), pagina, tamano);
        return ResponseEntity.ok(resultado);
    }

    // GET /api/lugares/{id} -> 200 con el lugar, o 404 si no existe
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        if (!service.existe(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", "No existe un lugar con id " + id));
        }
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // POST /api/lugares -> 201 con el lugar creado, o 400 si falta el nombre
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody lugar lugar) {
        if (lugar.getNombre() == null || lugar.getNombre().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "El nombre del lugar es obligatorio."));
        }
        lugar.setId(null);
        lugar creado = service.guardar(lugar);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // PUT /api/lugares/{id} -> 200 con el lugar actualizado, o 404 si no existe
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody lugar lugar) {
        if (!service.existe(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", "No existe un lugar con id " + id));
        }
        lugar.setId(id);
        return ResponseEntity.ok(service.guardar(lugar));
    }

    // DELETE /api/lugares/{id} -> 204 sin contenido, o 404 si no existe
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!service.existe(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", "No existe un lugar con id " + id));
        }
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
