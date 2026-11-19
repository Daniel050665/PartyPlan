package com.example.ProyectoWeb.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProyectoWeb.Entities.reserva;
import com.example.ProyectoWeb.Services.reservaService;
import com.example.ProyectoWeb.Services.usuarioService;
import com.example.ProyectoWeb.Config.Roles;
import com.example.ProyectoWeb.Entities.usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/reservas")
public class reservaController {

    @Autowired
    private reservaService service;

    @Autowired
    private usuarioService usuarioService;

    // GET /api/reservas  (USER y ADMIN)
    // AUTORIZACION REAL POR ROL: el ADMIN ve todas las reservas;
    // un USER solo ve las reservas de su propio cliente (su correo).
    @GetMapping
    public List<reserva> listar(Authentication authentication) {
        if (Roles.esAdmin(authentication)) {
            return service.obtenerTodas();
        }
        usuario cliente = usuarioService.obtenerPorCorreo(authentication.getName());
        return service.obtenerPorUsuario(cliente.getId());
    }

    // GET /api/reservas/{id}  (USER y ADMIN): un USER no puede ver reservas ajenas -> 403
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id, Authentication authentication) {
        reserva encontrada = service.obtenerPorId(id);
        if (!Roles.esAdmin(authentication) && !esDueno(encontrada, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permisos para ver esta reserva."));
        }
        return ResponseEntity.ok(encontrada);
    }

    // POST /api/reservas  (SOLO CLIENTE, rol USER; ver SecurityConfig)
    // Cada cliente hace SUS reservas: el backend la asigna al cliente que inicio
    // sesion y la deja PENDIENTE, sin importar lo que venga en el JSON.
    // El administrador no crea reservas: las aprueba, cancela o elimina.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public reserva crear(@RequestBody reserva reserva, Authentication authentication) {
        reserva.setId(null);
        reserva.setUsuario(usuarioService.obtenerPorCorreo(authentication.getName()));
        reserva.setEstado("PENDIENTE");
        return service.crear(reserva);
    }

    // La reserva es del usuario que inicio sesion si el correo del cliente coincide
    private boolean esDueno(reserva reserva, Authentication authentication) {
        return reserva.getUsuario() != null
                && authentication.getName().equals(reserva.getUsuario().getCorreo());
    }

    // PUT, PATCH y DELETE de reservas: SOLO ADMIN (lo controla SecurityConfig)
    @PutMapping("/{id}")
    public reserva actualizar(@PathVariable Long id, @RequestBody reserva reserva) {
        reserva actual = service.obtenerPorId(id);
        reserva.setId(id);
        // El admin puede cambiar plan, fecha, hora, personas o estado,
        // pero la reserva sigue siendo del MISMO cliente que la hizo.
        reserva.setUsuario(actual.getUsuario());
        return service.actualizar(reserva);
    }

    @PatchMapping("/{id}/estado")
    public reserva cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.cambiarEstado(id, body.get("estado"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
