package com.example.ProyectoWeb.Services.Impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.example.ProyectoWeb.DTO.PaginaRespuesta;
import com.example.ProyectoWeb.Entities.lugar;
import com.example.ProyectoWeb.Exception.RecursoNoEncontradoException;
import com.example.ProyectoWeb.Repository.lugarRepository;
import com.example.ProyectoWeb.Services.lugarService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class lugarServiceImpl implements lugarService {

    private final lugarRepository lugarRepository;

    @Override
    public List<lugar> obtenerTodos() {
        return lugarRepository.findAll();
    }

    @Override
    public lugar obtenerPorId(Long id) {
        return lugarRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lugar no encontrado con id: " + id));
    }

    @Override
    public List<lugar> obtenerPorCategoria(String categoria) {
        return lugarRepository.findByCategoriaIgnoreCase(categoria);
    }

    @Override
    public lugar guardar(lugar lugar) {
        return lugarRepository.save(lugar);
    }

    @Override
    public void eliminar(Long id) {
        lugarRepository.deleteById(id);
    }

    @Override
    public boolean existe(Long id) {
        return lugarRepository.existsById(id);
    }

    @Override
    public PaginaRespuesta<lugar> buscarPaginado(String texto, int pagina, int tamano) {
        // PageRequest.of(pagina, tamano): "dame la pagina N con M elementos"
        Page<lugar> resultado = lugarRepository.buscarPorTexto(texto, PageRequest.of(pagina, tamano));
        return new PaginaRespuesta<>(
                resultado.getContent(),
                resultado.getNumber(),
                resultado.getSize(),
                resultado.getTotalElements(),
                resultado.getTotalPages());
    }
}
