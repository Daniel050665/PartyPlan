package com.example.ProyectoWeb.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProyectoWeb.Entities.usuario;
import com.example.ProyectoWeb.Services.usuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class usuarioController {

    @Autowired
    private usuarioService service;

    // GET /api/usuarios -> 200 con la lista
    @GetMapping
    public ResponseEntity<List<usuario>> listar() {
        return ResponseEntity.ok(service.obtenerTodos());
    }

    // GET /api/usuarios/{id} -> 200 con el usuario, o 404 si no existe
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        if (!service.existe(id)) {
            return noEncontrado(id);
        }
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // POST /api/usuarios -> 201 con el usuario creado
    // (si el correo ya existe, el servicio lanza CorreoDuplicadoException -> 409)
    @PostMapping
    public ResponseEntity<usuario> crear(@RequestBody usuario usuario) {
        usuario.setId(null);
        usuario.setActivo(true);
        usuario creado = service.guardar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // PUT /api/usuarios/{id} -> 200 con el usuario actualizado, o 404 si no existe
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody usuario usuario) {
        if (!service.existe(id)) {
            return noEncontrado(id);
        }
        usuario actual = service.obtenerPorId(id);
        usuario.setId(id);
        usuario.setActivo(actual.isActivo()); // editar no cambia si esta activo o no
        return ResponseEntity.ok(service.guardar(usuario));
    }

    // DELETE /api/usuarios/{id} -> 204. Eliminacion logica: el usuario queda inactivo.
    @DeleteMapping("/{id}")
    public ResponseEntity<?> desactivar(@PathVariable Long id) {
        if (!service.existe(id)) {
            return noEncontrado(id);
        }
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/usuarios/{id}/activar -> 204
    @PatchMapping("/{id}/activar")
    public ResponseEntity<?> activar(@PathVariable Long id) {
        if (!service.existe(id)) {
            return noEncontrado(id);
        }
        service.activar(id);
        return ResponseEntity.noContent().build();
    }

    // Respuesta de error 404 con un mensaje que el frontend muestra
    private ResponseEntity<Map<String, String>> noEncontrado(Long id) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensaje", "No existe un usuario con id " + id));
    }
}
