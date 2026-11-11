package com.example.ProyectoWeb.DTO;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class IngresoMetodoReporte {

    private String metodoPago;

    private BigDecimal total;
}
