package com.example.ProyectoWeb.Repository;

import com.example.ProyectoWeb.DTO.IngresoMetodoReporte;
import com.example.ProyectoWeb.Entities.pago;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface pagoRepository extends JpaRepository<pago, Long> {

    Optional<pago> findByReservaId(Long idReserva);

    @Query("SELECT new com.example.ProyectoWeb.DTO.IngresoMetodoReporte(p.metodoPago, SUM(p.monto)) " +
            "FROM pago p " +
            "WHERE p.estadoPago = 'PAGADO' " +
            "GROUP BY p.metodoPago")
    List<IngresoMetodoReporte> sumarIngresosPorMetodoPago();
}
