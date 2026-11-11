package com.example.ProyectoWeb.Services;

import java.util.List;

import com.example.ProyectoWeb.DTO.PaginaRespuesta;
import com.example.ProyectoWeb.Entities.lugar;

public interface lugarService {

    List<lugar> obtenerTodos();

    lugar obtenerPorId(Long id);

    List<lugar> obtenerPorCategoria(String categoria);

    lugar guardar(lugar lugar);

    void eliminar(Long id);

    boolean existe(Long id);

    // Listado paginado con busqueda (pagina empieza en 0)
    PaginaRespuesta<lugar> buscarPaginado(String texto, int pagina, int tamano);
}
