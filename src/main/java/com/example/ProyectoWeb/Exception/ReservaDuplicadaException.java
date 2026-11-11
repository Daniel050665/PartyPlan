package com.example.ProyectoWeb.Exception;

public class ReservaDuplicadaException extends RuntimeException {

    public ReservaDuplicadaException(Long idPlan, String fecha) {
        super("Ya existe una reserva para el plan con ID " + idPlan + " en la fecha " + fecha + ".");
    }
    
}
