package com.example.ProyectoWeb.Services;

import java.time.LocalDate;
import java.util.List;

import com.example.ProyectoWeb.DTO.PlanRankingReporte;
import com.example.ProyectoWeb.DTO.ReservaEstadoReporte;
import com.example.ProyectoWeb.Entities.reserva;

public interface reservaService {

    List<reserva> obtenerTodas();

    reserva obtenerPorId(Long id);

    List<reserva> obtenerPorUsuario(Long idUsuario);

    List<reserva> obtenerPorPlanYFecha(Long idPlan, LocalDate fecha);

    List<reserva> obtenerPorEstado(String estado);

    reserva crear(reserva reserva);

    reserva actualizar(reserva reserva);

    reserva cambiarEstado(Long id, String nuevoEstado);

    void eliminar(Long id);

    // Reporte: reservas agrupadas por estado
    List<ReservaEstadoReporte> obtenerReporteReservasPorEstado();

    // Reporte: ranking de planes más reservados
    List<PlanRankingReporte> obtenerReporteRankingPlanes();
}
