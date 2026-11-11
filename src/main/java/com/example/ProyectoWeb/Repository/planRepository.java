package com.example.ProyectoWeb.Repository;

import com.example.ProyectoWeb.Entities.plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface planRepository extends JpaRepository<plan, Long> {

    List<plan> findByTipoIgnoreCase(String tipo);

    List<plan> findByPrecioLessThanEqual(BigDecimal precioMaximo);
}
