package com.example.ProyectoWeb.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "usuarios")
public class usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreCompleto;

    private String correo;

    private String telefono;

    @Builder.Default
    private boolean activo = true;

    // Contrasena cifrada con BCrypt (ej. $2a$10$...). Solo la tienen los clientes
    // que se registraron en la app; los creados por el admin la tienen en null.
    // @JsonIgnore: NUNCA se envia en las respuestas JSON.
    // @ToString.Exclude: tampoco aparece si se imprime el objeto en consola.
    @JsonIgnore
    @ToString.Exclude
    private String contrasena;
}
