package com.example.ProyectoWeb.pagos;

import java.time.LocalDateTime;

import com.example.ProyectoWeb.Entities.reserva;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// =====================================================================
// ORDEN DE PAGO CON WOMPI (tabla "ordenes")
// Cada vez que alguien pulsa "Pagar con Wompi" se crea una orden en
// estado PENDING. Cuando Wompi confirma el pago, pasa a APPROVED o
// DECLINED.
// =====================================================================
@Entity
@Table(name = "ordenes")
@Getter
@Setter
@NoArgsConstructor
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Codigo unico que comparten Wompi y nuestro backend. Ej: ORD-3f2a9c...
    @Column(nullable = false, unique = true)
    private String referencia;

    // Wompi trabaja en centavos: $30.000 = 3000000 centavos
    @Column(nullable = false)
    private Long montoEnCentavos;

    @Column(nullable = false)
    private String moneda = "COP";

    // PENDING, APPROVED, DECLINED, VOIDED o ERROR (los estados de Wompi)
    @Column(nullable = false)
    private String estado = "PENDING";

    // La reserva que se esta pagando
    @ManyToOne
    @JoinColumn(name = "id_reserva")
    private reserva reserva;

    // Id de la transaccion en Wompi (llega cuando el usuario paga)
    private String transaccionId;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;
}
