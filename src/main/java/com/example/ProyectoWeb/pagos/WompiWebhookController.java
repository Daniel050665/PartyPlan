package com.example.ProyectoWeb.pagos;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// =====================================================================
// WEBHOOK DE WOMPI: POST /api/pagos/webhook  (PUBLICO, ver SecurityConfig)
// Wompi "toca la puerta" aqui cada vez que un pago cambia de estado.
// Es publico porque Wompi no tiene usuario ni contrasena de nuestra app;
// en su lugar, se comprueba la FIRMA del aviso con el secreto de eventos.
// En Wompi (Sandbox) se registra la URL: https://TU-BACKEND.onrender.com/api/pagos/webhook
// =====================================================================
@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class WompiWebhookController {

    private final WompiService wompiService;

    @SuppressWarnings("unchecked")
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> recibirEvento(@RequestBody Map<String, Object> evento) {

        // 401 si la firma no coincide: el aviso no viene de Wompi o el secreto esta mal
        if (!wompiService.eventoEsValido(evento)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "Firma del evento inválida."));
        }

        // Solo nos interesan los cambios de una transaccion
        if (!"transaction.updated".equals(evento.get("event"))) {
            return ResponseEntity.ok(Map.of("mensaje", "Evento ignorado."));
        }

        Map<String, Object> datos = (Map<String, Object>) evento.get("data");
        Map<String, Object> transaccion = (Map<String, Object>) datos.get("transaction");

        String referencia = String.valueOf(transaccion.get("reference"));
        String estado = String.valueOf(transaccion.get("status"));
        String transaccionId = String.valueOf(transaccion.get("id"));
        long centavos = Long.parseLong(String.valueOf(transaccion.get("amount_in_cents")));

        wompiService.actualizarOrden(referencia, estado, transaccionId, centavos);

        // Respondemos 200 siempre que la firma sea valida, para que Wompi no reintente
        return ResponseEntity.ok(Map.of("mensaje", "Evento recibido."));
    }
}
