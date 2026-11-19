package com.example.ProyectoWeb.pagos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Guarda y busca ordenes de pago en la base de datos
@Repository
public interface OrdenRepository extends JpaRepository<Orden, Long> {

    Optional<Orden> findByReferencia(String referencia);
}
