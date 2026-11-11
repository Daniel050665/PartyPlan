package com.example.ProyectoWeb.Repository;

import com.example.ProyectoWeb.Entities.lugar;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface lugarRepository extends JpaRepository<lugar, Long> {

    List<lugar> findByCategoriaIgnoreCase(String categoria);

    boolean existsByNombre(String nombre);

    // JPQL: busca lugares cuyo nombre, categoria o direccion contengan el texto,
    // sin importar mayusculas, y devuelve solo una pagina de resultados.
    // Ejemplo: texto = "museo" -> Museo del Oro, Museo Botero, Museo Nacional
    @Query("SELECT l FROM lugar l " +
            "WHERE LOWER(l.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) " +
            "OR LOWER(l.categoria) LIKE LOWER(CONCAT('%', :texto, '%')) " +
            "OR LOWER(l.direccion) LIKE LOWER(CONCAT('%', :texto, '%')) " +
            "ORDER BY l.nombre")
    Page<lugar> buscarPorTexto(@Param("texto") String texto, Pageable pageable);
}
