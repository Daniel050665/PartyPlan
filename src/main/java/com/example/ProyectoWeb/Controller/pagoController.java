package com.example.ProyectoWeb.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProyectoWeb.Entities.pago;
import com.example.ProyectoWeb.Services.pagoService;

@RestController
@RequestMapping("/api/pagos")
public class pagoController {

    @Autowired
    private pagoService service;

    @GetMapping
    public List<pago> listar() {
        return service.obtenerTodos();
    }

    @GetMapping("/{id}")
    public pago obtener(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @GetMapping("/reserva/{idReserva}")
    public pago obtenerPorReserva(@PathVariable Long idReserva) {
        return service.obtenerPorReserva(idReserva);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public pago crear(@RequestBody pago pago) {
        pago.setId(null);
        return service.registrarPago(pago);
    }

    @PutMapping("/{id}")
    public pago actualizar(@PathVariable Long id, @RequestBody pago pago) {
        service.obtenerPorId(id);
        pago.setId(id);
        return service.registrarPago(pago);
    }

    @PatchMapping("/{id}/estado")
    public pago actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.actualizarEstado(id, body.get("estadoPago"));
    }
}
