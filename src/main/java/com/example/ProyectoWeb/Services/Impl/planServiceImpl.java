package com.example.ProyectoWeb.Services.Impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.ProyectoWeb.Entities.plan;
import com.example.ProyectoWeb.Exception.RecursoNoEncontradoException;
import com.example.ProyectoWeb.Repository.planRepository;
import com.example.ProyectoWeb.Services.planService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class planServiceImpl implements planService {

    private final planRepository planRepository;

    @Override
    public List<plan> obtenerTodos() {
        return planRepository.findAll();
    }

    @Override
    public plan obtenerPorId(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado con id: " + id));
    }

    @Override
    public List<plan> obtenerPorTipo(String tipo) {
        return planRepository.findByTipoIgnoreCase(tipo);
    }

    @Override
    public List<plan> obtenerPorPrecioMaximo(BigDecimal precioMaximo) {
        return planRepository.findByPrecioLessThanEqual(precioMaximo);
    }

    @Override
    public plan guardar(plan plan) {
        return planRepository.save(plan);
    }

    @Override
    public void eliminar(Long id) {
        planRepository.deleteById(id);
    }
}
