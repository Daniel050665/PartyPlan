package com.example.ProyectoWeb.Repository;

import com.example.ProyectoWeb.Entities.usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface usuarioRepository extends JpaRepository<usuario, Long> {

    Optional<usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);
}
