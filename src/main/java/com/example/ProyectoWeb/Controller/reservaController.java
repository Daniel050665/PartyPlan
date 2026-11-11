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

@RestController
@RequestMapping("/api/reservas")
public class reservaController {

    @Autowired
    private reservaService service;

    @GetMapping
    public List<reserva> listar() {
        return service.obtenerTodas();
    }

    @GetMapping("/{id}")
    public reserva obtener(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public reserva crear(@RequestBody reserva reserva) {
        reserva.setId(null);
        return service.crear(reserva);
    }

    @PutMapping("/{id}")
    public reserva actualizar(@PathVariable Long id, @RequestBody reserva reserva) {
        service.obtenerPorId(id);
        reserva.setId(id);
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
