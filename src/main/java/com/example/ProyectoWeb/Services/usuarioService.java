package com.example.ProyectoWeb.Services;

import java.util.List;

import com.example.ProyectoWeb.Entities.usuario;

public interface usuarioService {

    List<usuario> obtenerTodos();

    usuario obtenerPorId(Long id);

    usuario obtenerPorCorreo(String correo);

    usuario guardar(usuario usuario);

    void eliminar(Long id);
    
    void activar(Long id);

    boolean existe(Long id);
}
