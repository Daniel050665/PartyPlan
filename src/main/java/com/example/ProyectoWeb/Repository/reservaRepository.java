package com.example.ProyectoWeb.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.ProyectoWeb.DTO.PlanRankingReporte;
import com.example.ProyectoWeb.DTO.ReservaEstadoReporte;
import com.example.ProyectoWeb.Entities.reserva;

@Repository
public interface reservaRepository extends JpaRepository<reserva, Long> {

    List<reserva> findByUsuario_Id(Long idUsuario);

    List<reserva> findByPlan_IdAndFecha(Long idPlan, LocalDate fecha);

    List<reserva> findByEstado(String estado);

    @Query("SELECT new com.example.ProyectoWeb.DTO.ReservaEstadoReporte(r.estado, COUNT(r)) " +
            "FROM reserva r " +
            "GROUP BY r.estado")
    List<ReservaEstadoReporte> contarReservasPorEstado();

    @Query("SELECT new com.example.ProyectoWeb.DTO.PlanRankingReporte(r.plan.nombre, COUNT(r)) " +
            "FROM reserva r " +
            "GROUP BY r.plan.nombre " +
            "ORDER BY COUNT(r) DESC")
    List<PlanRankingReporte> obtenerRankingPlanes();
}
