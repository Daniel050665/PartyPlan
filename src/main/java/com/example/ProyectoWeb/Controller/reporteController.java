package com.example.ProyectoWeb.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProyectoWeb.DTO.IngresoMetodoReporte;
import com.example.ProyectoWeb.DTO.PlanRankingReporte;
import com.example.ProyectoWeb.DTO.ReservaEstadoReporte;
import com.example.ProyectoWeb.Services.pagoService;
import com.example.ProyectoWeb.Services.reservaService;

@RestController
@RequestMapping("/api/reportes")
public class reporteController {

    @Autowired
    private reservaService reservaService;

    @Autowired
    private pagoService pagoService;

    // Reporte 1: cantidad de reservas agrupadas por estado
    @GetMapping("/reservas-por-estado")
    public List<ReservaEstadoReporte> reservasPorEstado() {
        return reservaService.obtenerReporteReservasPorEstado();
    }

    // Reporte 2: ingresos totales agrupados por método de pago
    @GetMapping("/ingresos-por-metodo")
    public List<IngresoMetodoReporte> ingresosPorMetodo() {
        return pagoService.obtenerReporteIngresosPorMetodo();
    }

    // Reporte 3: ranking de planes más reservados
    @GetMapping("/ranking-planes")
    public List<PlanRankingReporte> rankingPlanes() {
        return reservaService.obtenerReporteRankingPlanes();
    }
}
