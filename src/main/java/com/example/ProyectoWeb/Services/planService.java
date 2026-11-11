package com.example.ProyectoWeb.Services;

import java.math.BigDecimal;
import java.util.List;

import com.example.ProyectoWeb.Entities.plan;

public interface planService {

    List<plan> obtenerTodos();

    plan obtenerPorId(Long id);

    List<plan> obtenerPorTipo(String tipo);

    List<plan> obtenerPorPrecioMaximo(BigDecimal precioMaximo);

    plan guardar(plan plan);

    void eliminar(Long id);
}
