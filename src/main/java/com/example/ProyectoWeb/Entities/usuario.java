package com.example.ProyectoWeb.Entities;

import com.fasterxml.jackson.annotation.JsonProperty;

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

    // Contrasena del cliente, guardada cifrada con BCrypt (ej. $2a$10$...).
    // WRITE_ONLY: se puede RECIBIR en un JSON (cuando el admin crea un cliente),
    // pero NUNCA se envia en las respuestas.
    // @ToString.Exclude: tampoco aparece si se imprime el objeto en consola.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private String contrasena;
}
