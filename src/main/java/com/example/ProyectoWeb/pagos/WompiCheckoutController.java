package com.example.ProyectoWeb.pagos;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProyectoWeb.Config.Roles;
import com.example.ProyectoWeb.Entities.reserva;
import com.example.ProyectoWeb.Repository.pagoRepository;
import com.example.ProyectoWeb.Services.reservaService;

import lombok.RequiredArgsConstructor;

// =====================================================================
// PAGO DE UNA RESERVA CON WOMPI (USER y ADMIN, ver SecurityConfig)
// Se llama WompiCheckoutController (y no PagoController como en el
// laboratorio) porque el proyecto ya tiene un pagoController.
//
//   POST /api/pagos/wompi/checkout          { "reservaId": 3 } -> link de pago
//   GET  /api/pagos/wompi/transaccion/{id}  resultado al volver de Wompi
//   GET  /api/pagos/wompi/orden/{referencia} estado de una orden
// =====================================================================
@RestController
@RequestMapping("/api/pagos/wompi")
@RequiredArgsConstructor
public class WompiCheckoutController {

    private final WompiService wompiService;
    private final reservaService reservaService;
    private final OrdenRepository ordenRepository;
    private final pagoRepository pagoRepository;

    // POST /api/pagos/wompi/checkout
    @PostMapping("/checkout")
    public ResponseEntity<?> crearCheckout(@RequestBody Map<String, Long> body, Authentication authentication) {

        // 503: faltan las llaves de Wompi
        if (!wompiService.estaConfigurado()) {
            return error(HttpStatus.SERVICE_UNAVAILABLE,
                    "Los pagos con Wompi no están configurados. Faltan las llaves en secretos.properties o en Render.");
        }

        // 404 si la reserva no existe (lo lanza el servicio)
        reserva reserva = reservaService.obtenerPorId(body.get("reservaId"));

        // 403: un USER solo puede pagar SUS reservas
        if (!Roles.esAdmin(authentication) && !esDueno(reserva, authentication)) {
            return error(HttpStatus.FORBIDDEN, "No puedes pagar una reserva de otro cliente.");
        }

        // 400: no se paga una reserva cancelada
        if ("CANCELADA".equals(reserva.getEstado())) {
            return error(HttpStatus.BAD_REQUEST, "La reserva está cancelada y no se puede pagar.");
        }

        // 409: ya estaba pagada
        boolean yaPagada = pagoRepository.findByReservaId(reserva.getId())
                .map(p -> "PAGADO".equals(p.getEstadoPago()))
                .orElse(false);
        if (yaPagada) {
            return error(HttpStatus.CONFLICT, "Esta reserva ya está pagada.");
        }

        Orden orden = wompiService.crearOrden(reserva);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("referencia", orden.getReferencia());
        respuesta.put("montoEnCentavos", orden.getMontoEnCentavos());
        respuesta.put("urlPago", wompiService.urlDePago(orden));
        // true = Wompi no podra devolver al usuario (frontend en localhost): abrirlo en otra pestana
        respuesta.put("nuevaPestana", !wompiService.puedeVolverAutomaticamente());
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    // GET /api/pagos/wompi/transaccion/{id}
    // Wompi devuelve al usuario a /pago/resultado?id=TRANSACCION. Con ese id le
    // preguntamos a Wompi como termino el pago y actualizamos nuestra orden.
    @SuppressWarnings("unchecked")
    @GetMapping("/transaccion/{transaccionId}")
    public ResponseEntity<?> confirmarTransaccion(@PathVariable String transaccionId, Authentication authentication) {
        Map<String, Object> transaccion;
        try {
            transaccion = wompiService.consultarTransaccion(transaccionId);
        } catch (Exception e) {
            return error(HttpStatus.BAD_GATEWAY, "No se pudo consultar el pago en Wompi. Intenta de nuevo en unos segundos.");
        }

        String referencia = String.valueOf(transaccion.get("reference"));
        String estado = String.valueOf(transaccion.get("status"));
        long centavos = Long.parseLong(String.valueOf(transaccion.get("amount_in_cents")));

        Optional<Orden> orden = ordenRepository.findByReferencia(referencia);
        if (orden.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "No existe una orden con la referencia " + referencia);
        }
        if (!Roles.esAdmin(authentication) && !esDueno(orden.get().getReserva(), authentication)) {
            return error(HttpStatus.FORBIDDEN, "Esta orden no es tuya.");
        }

        // Mientras siga PENDING no cambiamos nada: la pagina volvera a preguntar
        if (!estado.equals("PENDING")) {
            orden = wompiService.actualizarOrden(referencia, estado, transaccionId, centavos);
        }
        return ResponseEntity.ok(resumen(orden.get()));
    }

    // GET /api/pagos/wompi/orden/{referencia}
    // Si la orden sigue PENDING, le preguntamos a Wompi por la referencia (con la llave privada).
    // Lo usa la pagina de resultado cuando Wompi se abrio en otra pestana.
    @SuppressWarnings("unchecked")
    @GetMapping("/orden/{referencia}")
    public ResponseEntity<?> consultarOrden(@PathVariable String referencia, Authentication authentication) {
        Optional<Orden> orden = ordenRepository.findByReferencia(referencia);
        if (orden.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "No existe una orden con la referencia " + referencia);
        }
        if (!Roles.esAdmin(authentication) && !esDueno(orden.get().getReserva(), authentication)) {
            return error(HttpStatus.FORBIDDEN, "Esta orden no es tuya.");
        }

        if (orden.get().getEstado().equals("PENDING")) {
            try {
                Map<String, Object> transaccion = wompiService.consultarPorReferencia(referencia);
                if (transaccion != null && !"PENDING".equals(transaccion.get("status"))) {
                    orden = wompiService.actualizarOrden(referencia,
                            String.valueOf(transaccion.get("status")),
                            String.valueOf(transaccion.get("id")),
                            Long.parseLong(String.valueOf(transaccion.get("amount_in_cents"))));
                }
            } catch (Exception e) {
                // Si Wompi no responde, devolvemos el estado que tenemos; la pagina volvera a preguntar
            }
        }
        return ResponseEntity.ok(resumen(orden.get()));
    }

    // Lo que ve el frontend de una orden
    private Map<String, Object> resumen(Orden orden) {
        Map<String, Object> datos = new HashMap<>();
        datos.put("referencia", orden.getReferencia());
        datos.put("estado", orden.getEstado());
        datos.put("monto", BigDecimal.valueOf(orden.getMontoEnCentavos()).divide(BigDecimal.valueOf(100)));
        datos.put("reservaId", orden.getReserva().getId());
        datos.put("plan", orden.getReserva().getPlan().getNombre());
        return datos;
    }

    private boolean esDueno(reserva reserva, Authentication authentication) {
        return reserva.getUsuario() != null
                && authentication.getName().equals(reserva.getUsuario().getCorreo());
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String mensaje) {
        return ResponseEntity.status(status).body(Map.of("mensaje", mensaje));
    }
}
