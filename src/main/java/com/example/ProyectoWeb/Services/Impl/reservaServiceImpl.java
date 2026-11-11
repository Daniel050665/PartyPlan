package com.example.ProyectoWeb.Services.Impl;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.example.ProyectoWeb.DTO.PlanRankingReporte;
import com.example.ProyectoWeb.DTO.ReservaEstadoReporte;
import com.example.ProyectoWeb.Entities.reserva;
import com.example.ProyectoWeb.Exception.EstadoInvalidoException;
import com.example.ProyectoWeb.Exception.RecursoNoEncontradoException;
import com.example.ProyectoWeb.Repository.reservaRepository;
import com.example.ProyectoWeb.Services.reservaService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class reservaServiceImpl implements reservaService {

    private static final Set<String> ESTADOS_VALIDOS = Set.of("PENDIENTE", "CONFIRMADA", "CANCELADA");

    private final reservaRepository reservaRepository;

    @Override
    public List<reserva> obtenerTodas() {
        return reservaRepository.findAll();
    }

    @Override
    public reserva obtenerPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con id: " + id));
    }

    @Override
    public List<reserva> obtenerPorUsuario(Long idUsuario) {
        return reservaRepository.findByUsuario_Id(idUsuario);
    }

    @Override
    public List<reserva> obtenerPorPlanYFecha(Long idPlan, LocalDate fecha) {
        return reservaRepository.findByPlan_IdAndFecha(idPlan, fecha);
    }

    @Override
    public List<reserva> obtenerPorEstado(String estado) {
        return reservaRepository.findByEstado(estado);
    }

    @Override
    public reserva crear(reserva reserva) {
        // Toda reserva nueva inicia como PENDIENTE si no se indica otro estado
        if (reserva.getEstado() == null || reserva.getEstado().isBlank()) {
            reserva.setEstado("PENDIENTE");
        }
        validarEstado(reserva.getEstado());
        return reservaRepository.save(reserva);
    }

    @Override
    public reserva actualizar(reserva reserva) {
        validarEstado(reserva.getEstado());
        return reservaRepository.save(reserva);
    }

    @Override
    public reserva cambiarEstado(Long id, String nuevoEstado) {
        validarEstado(nuevoEstado);
        reserva reserva = obtenerPorId(id);
        reserva.setEstado(nuevoEstado);
        return reservaRepository.save(reserva);
    }

    private void validarEstado(String estado) {
        if (estado == null || !ESTADOS_VALIDOS.contains(estado)) {
            throw new EstadoInvalidoException(estado);
        }
    }

    @Override
    public void eliminar(Long id) {
        reservaRepository.deleteById(id);
    }

    @Override
    public List<ReservaEstadoReporte> obtenerReporteReservasPorEstado() {
        return reservaRepository.contarReservasPorEstado();
    }

    @Override
    public List<PlanRankingReporte> obtenerReporteRankingPlanes() {
        return reservaRepository.obtenerRankingPlanes();
    }
}
