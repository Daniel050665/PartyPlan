package com.example.ProyectoWeb.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProyectoWeb.Entities.plan;
import com.example.ProyectoWeb.Services.planService;

@RestController
@RequestMapping("/api/planes")
public class planController {

    @Autowired
    private planService service;

    @GetMapping
    public List<plan> listar() {
        return service.obtenerTodos();
    }

    @GetMapping("/{id}")
    public plan obtener(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public plan crear(@RequestBody plan plan) {
        plan.setId(null);
        return service.guardar(plan);
    }

    @PutMapping("/{id}")
    public plan actualizar(@PathVariable Long id, @RequestBody plan plan) {
        service.obtenerPorId(id);
        plan.setId(id);
        return service.guardar(plan);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
