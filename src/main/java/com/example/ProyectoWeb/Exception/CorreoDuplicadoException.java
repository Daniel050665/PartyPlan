package com.example.ProyectoWeb.Exception;

public class CorreoDuplicadoException extends RuntimeException {

    public CorreoDuplicadoException(String correo) {
        super("El correo electrónico " + correo + " ya está en uso por otro usuario.");
    }
    
}
