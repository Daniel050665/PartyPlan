package com.example.ProyectoWeb.Config;

import com.example.ProyectoWeb.Entities.usuario;
import com.example.ProyectoWeb.Entities.plan;
import com.example.ProyectoWeb.Entities.lugar;
import com.example.ProyectoWeb.Entities.reserva;
import com.example.ProyectoWeb.Entities.pago;

import com.example.ProyectoWeb.Repository.usuarioRepository;
import com.example.ProyectoWeb.Repository.planRepository;
import com.example.ProyectoWeb.Repository.lugarRepository;
import com.example.ProyectoWeb.Repository.reservaRepository;
import com.example.ProyectoWeb.Repository.pagoRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Configuration
public class DatosIniciales {

    @Bean
    CommandLineRunner cargarDatos(
            usuarioRepository usuarioRepository,
            planRepository planRepository,
            lugarRepository lugarRepository,
            reservaRepository reservaRepository,
            pagoRepository pagoRepository) {

        return args -> {

            usuario usuario1;
            usuario usuario2;
            usuario usuario3;

            if (usuarioRepository.count() == 0) {

                usuario1 = usuarioRepository.save(
                        usuario.builder()
                                .nombreCompleto("Juan Pérez")
                                .correo("juan@gmail.com")
                                .telefono("3001234567")
                                .build()
                );

                usuario2 = usuarioRepository.save(
                        usuario.builder()
                                .nombreCompleto("María González")
                                .correo("maria@gmail.com")
                                .telefono("3017654321")
                                .build()
                );

                usuario3 = usuarioRepository.save(
                        usuario.builder()
                                .nombreCompleto("Carlos Rodríguez")
                                .correo("carlos@gmail.com")
                                .telefono("3109876543")
                                .build()
                );

            } else {

                usuario1 = usuarioRepository.findAll().get(0);
                usuario2 = usuarioRepository.findAll().get(1);
                usuario3 = usuarioRepository.findAll().get(2);
            }

            plan plan1;
            plan plan2;
            plan plan3;

            if (planRepository.count() == 0) {

                plan1 = planRepository.save(
                        plan.builder()
                                .tipo("CULTURAL")
                                .nombre("Ruta Candelaria")
                                .descripcion("Recorrido guiado por La Candelaria, Museo del Oro y Museo Botero.")
                                .precio(new BigDecimal("30000"))
                                .build()
                );

                plan2 = planRepository.save(
                        plan.builder()
                                .tipo("NOCTURNO")
                                .nombre("Noche en la Zona T")
                                .descripcion("Cena, coctelería de autor y discoteca en la Zona Rosa.")
                                .precio(new BigDecimal("60000"))
                                .build()
                );

                plan3 = planRepository.save(
                        plan.builder()
                                .tipo("MIXTO")
                                .nombre("Bogotá de Día y de Noche")
                                .descripcion("Monserrate al atardecer y cierre con salsa en Chapinero.")
                                .precio(new BigDecimal("100000"))
                                .build()
                );

            } else {

                plan1 = planRepository.findAll().get(0);
                plan2 = planRepository.findAll().get(1);
                plan3 = planRepository.findAll().get(2);
            }

            if (lugarRepository.count() == 0) {

                lugarRepository.save(
                        lugar.builder()
                                .nombre("Museo del Oro")
                                .categoria("Museo")
                                .direccion("Cra. 6 #15-88")
                                .capacidad(300)
                                .build()
                );

                lugarRepository.save(
                        lugar.builder()
                                .nombre("Andrés DC")
                                .categoria("Restaurante-Bar")
                                .direccion("Calle 82 #12-21")
                                .capacidad(250)
                                .build()
                );

                lugarRepository.save(
                        lugar.builder()
                                .nombre("Theatron")
                                .categoria("Discoteca")
                                .direccion("Calle 58 #10-32")
                                .capacidad(1200)
                                .build()
                );
            }

            // Lugares adicionales para que el listado paginado tenga mas de una pagina.
            // Solo se agregan si todavia no existen (se busca por nombre).
            guardarLugarSiNoExiste(lugarRepository, "Museo Botero", "Museo", "Calle 11 #4-41", 200);
            guardarLugarSiNoExiste(lugarRepository, "Museo Nacional", "Museo", "Cra. 7 #28-66", 400);
            guardarLugarSiNoExiste(lugarRepository, "Teatro Colón", "Teatro", "Calle 10 #5-32", 900);
            guardarLugarSiNoExiste(lugarRepository, "Gaira Café", "Bar", "Cra. 13 #96-11", 300);
            guardarLugarSiNoExiste(lugarRepository, "Monserrate", "Mirador", "Cerro de Monserrate", 1500);
            guardarLugarSiNoExiste(lugarRepository, "Chorro de Quevedo", "Plaza", "Calle 13 #2-14", 500);

            reserva reserva1;
            reserva reserva2;
            reserva reserva3;

            if (reservaRepository.count() == 0) {

                reserva1 = reservaRepository.save(
                        reserva.builder()
                                .usuario(usuario1)
                                .plan(plan1)
                                .fecha(LocalDate.now().plusDays(2))
                                .hora(LocalTime.of(10, 0))
                                .numeroPersonas(2)
                                .estado("CONFIRMADA")
                                .build()
                );

                reserva2 = reservaRepository.save(
                        reserva.builder()
                                .usuario(usuario2)
                                .plan(plan2)
                                .fecha(LocalDate.now().plusDays(5))
                                .hora(LocalTime.of(14, 30))
                                .numeroPersonas(4)
                                .estado("PENDIENTE")
                                .build()
                );

                reserva3 = reservaRepository.save(
                        reserva.builder()
                                .usuario(usuario3)
                                .plan(plan3)
                                .fecha(LocalDate.now().plusDays(9))
                                .hora(LocalTime.of(18, 0))
                                .numeroPersonas(6)
                                .estado("CONFIRMADA")
                                .build()
                );

            } else {

                reserva1 = reservaRepository.findAll().get(0);
                reserva2 = reservaRepository.findAll().get(1);
                reserva3 = reservaRepository.findAll().get(2);
            }

            if (pagoRepository.count() == 0) {

                pagoRepository.save(
                        pago.builder()
                                .reserva(reserva1)
                                .monto(new BigDecimal("30000"))
                                .metodoPago("TARJETA")
                                .fechaPago(LocalDate.now())
                                .estadoPago("PAGADO")
                                .build()
                );

                pagoRepository.save(
                        pago.builder()
                                .reserva(reserva2)
                                .monto(new BigDecimal("60000"))
                                .metodoPago("TRANSFERENCIA")
                                .fechaPago(LocalDate.now())
                                .estadoPago("PENDIENTE")
                                .build()
                );

                pagoRepository.save(
                        pago.builder()
                                .reserva(reserva3)
                                .monto(new BigDecimal("100000"))
                                .metodoPago("EFECTIVO")
                                .fechaPago(LocalDate.now())
                                .estadoPago("PAGADO")
                                .build()
                );
            }

        };
    }

    private static void guardarLugarSiNoExiste(lugarRepository repositorio, String nombre,
            String categoria, String direccion, int capacidad) {
        if (!repositorio.existsByNombre(nombre)) {
            repositorio.save(
                    lugar.builder()
                            .nombre(nombre)
                            .categoria(categoria)
                            .direccion(direccion)
                            .capacidad(capacidad)
                            .build()
            );
        }
    }
}
