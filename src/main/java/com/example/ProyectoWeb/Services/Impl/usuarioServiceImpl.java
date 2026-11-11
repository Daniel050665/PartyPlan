package com.example.ProyectoWeb.Services.Impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.ProyectoWeb.Entities.usuario;
import com.example.ProyectoWeb.Exception.CorreoDuplicadoException;
import com.example.ProyectoWeb.Exception.RecursoNoEncontradoException;
import com.example.ProyectoWeb.Repository.usuarioRepository;
import com.example.ProyectoWeb.Services.usuarioService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class usuarioServiceImpl implements usuarioService {

    private final usuarioRepository usuarioRepository;

    @Override
    public List<usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    @Override
    public usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));
    }

    @Override
    public usuario obtenerPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con correo: " + correo));
    }

    @Override
    public usuario guardar(usuario usuario) {
        usuarioRepository.findByCorreo(usuario.getCorreo())
                .filter(existente -> !existente.getId().equals(usuario.getId()))
                .ifPresent(existente -> {
                    throw new CorreoDuplicadoException(usuario.getCorreo());
                });
        return usuarioRepository.save(usuario);
    }

    @Override
    public void eliminar(Long id) {

        usuario usuario = obtenerPorId(id);

        usuario.setActivo(false);

        usuarioRepository.save(usuario);
    }

    @Override
    public void activar(Long id) {

        usuario usuario = obtenerPorId(id);

        usuario.setActivo(true);

        usuarioRepository.save(usuario);
    }

    @Override
    public boolean existe(Long id) {
        return usuarioRepository.existsById(id);
    }
}
