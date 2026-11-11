package com.example.ProyectoWeb.DTO;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

// Respuesta de un listado paginado.
// Ejemplo en JSON:
// { "contenido": [...5 lugares...], "pagina": 0, "tamano": 5,
//   "totalElementos": 9, "totalPaginas": 2 }
@Getter
@AllArgsConstructor
public class PaginaRespuesta<T> {

    private List<T> contenido;

    private int pagina;

    private int tamano;

    private long totalElementos;

    private int totalPaginas;
}
