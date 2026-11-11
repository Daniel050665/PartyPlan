package com.example.ProyectoWeb.Exception;

public class EstadoInvalidoException extends RuntimeException {

    public EstadoInvalidoException(String estado) {
        super("El estado '" + estado + "' no es válido."    );
    }
    
}
