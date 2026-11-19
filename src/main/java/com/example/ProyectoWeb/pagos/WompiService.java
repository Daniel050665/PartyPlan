package com.example.ProyectoWeb.pagos;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import com.example.ProyectoWeb.Entities.pago;
import com.example.ProyectoWeb.Entities.reserva;
import com.example.ProyectoWeb.Repository.pagoRepository;
import com.example.ProyectoWeb.Repository.reservaRepository;

import lombok.RequiredArgsConstructor;

// =====================================================================
// SERVICIO DE WOMPI
//  1. Crea la orden y arma el link de pago FIRMADO (Web Checkout).
//  2. Comprueba la firma de los avisos (webhook) que manda Wompi.
//  3. Consulta a Wompi el estado de una transaccion.
//  4. Cuando un pago se aprueba: confirma la reserva y registra el pago.
//
// Las llaves NO estan en el codigo: se leen de application.properties,
// que a su vez las toma de variables de entorno (Render) o del archivo
// secretos.properties (en tu computador, y que NO se sube a GitHub).
// =====================================================================
@Service
@RequiredArgsConstructor
public class WompiService {

    private final OrdenRepository ordenRepository;
    private final reservaRepository reservaRepository;
    private final pagoRepository pagoRepository;

    @Value("${wompi.public-key}")
    private String llavePublica;

    @Value("${wompi.private-key}")
    private String llavePrivada;

    @Value("${wompi.integrity-key}")
    private String secretoIntegridad;

    @Value("${wompi.events-secret}")
    private String secretoEventos;

    @Value("${app.frontend-url}")
    private String urlFrontend;

    // ---------------------------------------------------------------
    // 0. ¿Estan configuradas las llaves?
    // ---------------------------------------------------------------
    public boolean estaConfigurado() {
        return !llavePublica.isBlank() && !secretoIntegridad.isBlank();
    }

    // Las llaves de pruebas empiezan por pub_test_ -> usamos el Sandbox de Wompi
    private String urlApiWompi() {
        if (llavePublica.startsWith("pub_test_")) {
            return "https://sandbox.wompi.co/v1";
        }
        return "https://production.wompi.co/v1";
    }

    // ---------------------------------------------------------------
    // 1. Crear la orden y el link de pago
    // ---------------------------------------------------------------
    // El monto lo calcula el BACKEND con el precio del plan de la reserva.
    // Asi nadie puede cambiar el precio desde el navegador.
    public Orden crearOrden(reserva reserva) {
        BigDecimal precio = reserva.getPlan().getPrecio();
        long centavos = precio.multiply(BigDecimal.valueOf(100)).longValue(); // $30.000 -> 3000000

        Orden orden = new Orden();
        orden.setReferencia("ORD-" + UUID.randomUUID());
        orden.setMontoEnCentavos(centavos);
        orden.setMoneda("COP");
        orden.setEstado("PENDING");
        orden.setReserva(reserva);
        orden.setFechaCreacion(LocalDateTime.now());
        orden.setFechaActualizacion(LocalDateTime.now());
        return ordenRepository.save(orden);
    }

    // Firma de integridad: SHA-256 de (referencia + centavos + moneda + secreto de integridad).
    // Wompi calcula lo mismo; si alguien cambia el monto en el link, las firmas no coinciden.
    public String firmaIntegridad(Orden orden) {
        return sha256(orden.getReferencia() + orden.getMontoEnCentavos() + orden.getMoneda() + secretoIntegridad);
    }

    // Link a la pagina de pago de Wompi (Web Checkout)
    public String urlDePago(Orden orden) {
        String url = "https://checkout.wompi.co/p/"
                + "?public-key=" + codificar(llavePublica)
                + "&currency=" + orden.getMoneda()
                + "&amount-in-cents=" + orden.getMontoEnCentavos()
                + "&reference=" + codificar(orden.getReferencia())
                + "&signature:integrity=" + firmaIntegridad(orden);
        if (puedeVolverAutomaticamente()) {
            url = url + "&redirect-url=" + codificar(urlFrontend + "/pago/resultado");
        }
        return url;
    }

    // Wompi NO acepta volver a una direccion localhost o 127.0.0.1 (responde 403).
    // Con el frontend en tu computador no enviamos redirect-url: Wompi se abre en
    // otra pestana y nuestra pagina consulta el resultado por la referencia.
    // Con el frontend publicado (https://...), Wompi devuelve al usuario solo.
    public boolean puedeVolverAutomaticamente() {
        return !urlFrontend.contains("localhost") && !urlFrontend.contains("127.0.0.1");
    }

    // ---------------------------------------------------------------
    // 2. Validar el aviso (evento) que Wompi envia al webhook
    // ---------------------------------------------------------------
    // Wompi manda un JSON asi:
    // { "event": "transaction.updated",
    //   "data": { "transaction": { "id": "...", "status": "APPROVED", "reference": "ORD-...", ... } },
    //   "signature": { "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents"],
    //                  "checksum": "..." },
    //   "timestamp": 1530291411 }
    // checksum = SHA-256 de (valores de esas propiedades + timestamp + secreto de eventos).
    // Si nuestro calculo da lo mismo, el aviso es autentico (nadie lo falsifico).
    @SuppressWarnings("unchecked")
    public boolean eventoEsValido(Map<String, Object> evento) {
        if (secretoEventos.isBlank()) {
            return false; // sin secreto no podemos comprobar nada
        }
        try {
            Map<String, Object> firma = (Map<String, Object>) evento.get("signature");
            Map<String, Object> datos = (Map<String, Object>) evento.get("data");
            List<String> propiedades = (List<String>) firma.get("properties");

            StringBuilder texto = new StringBuilder();
            for (String propiedad : propiedades) {
                texto.append(buscarValor(datos, propiedad)); // ej. "transaction.status" -> "APPROVED"
            }
            texto.append(evento.get("timestamp"));
            texto.append(secretoEventos);

            String checksumCalculado = sha256(texto.toString());
            String checksumRecibido = String.valueOf(firma.get("checksum"));
            return checksumCalculado.equalsIgnoreCase(checksumRecibido);
        } catch (Exception e) {
            return false; // JSON con otra forma: no es un aviso valido
        }
    }

    // Busca un valor dentro del JSON siguiendo una ruta con puntos.
    // Ej: buscarValor(datos, "transaction.status") = datos["transaction"]["status"]
    @SuppressWarnings("unchecked")
    private String buscarValor(Map<String, Object> datos, String ruta) {
        Object actual = datos;
        for (String parte : ruta.split("\\.")) {
            actual = ((Map<String, Object>) actual).get(parte);
        }
        return String.valueOf(actual);
    }

    // ---------------------------------------------------------------
    // 3. Preguntarle a Wompi por una transaccion
    // ---------------------------------------------------------------
    // GET https://sandbox.wompi.co/v1/transactions/{id} -> { "data": { "status": "APPROVED", ... } }
    // Se usa cuando el usuario vuelve a nuestra pagina: asi se confirma el pago
    // aunque el webhook no pueda llegar (por ejemplo, con el backend en tu computador).
    @SuppressWarnings("unchecked")
    public Map<String, Object> consultarTransaccion(String transaccionId) {
        Map<String, Object> respuesta = RestClient.create()
                .get()
                .uri(urlApiWompi() + "/transactions/" + transaccionId)
                .retrieve()
                .body(Map.class);
        return (Map<String, Object>) respuesta.get("data");
    }

    // Buscar en Wompi la transaccion de una orden por su referencia.
    // GET https://sandbox.wompi.co/v1/transactions?reference=ORD-...
    // Esta consulta exige la LLAVE PRIVADA (cabecera Authorization: Bearer prv_test_...).
    // Devuelve la transaccion mas reciente, o null si todavia no hay ninguna.
    @SuppressWarnings("unchecked")
    public Map<String, Object> consultarPorReferencia(String referencia) {
        if (llavePrivada.isBlank()) {
            return null; // sin llave privada solo nos enteramos por el webhook
        }
        Map<String, Object> respuesta = RestClient.create()
                .get()
                .uri(urlApiWompi() + "/transactions?reference=" + codificar(referencia))
                .header("Authorization", "Bearer " + llavePrivada)
                .retrieve()
                .body(Map.class);
        List<Map<String, Object>> transacciones = (List<Map<String, Object>>) respuesta.get("data");
        if (transacciones == null || transacciones.isEmpty()) {
            return null; // el usuario aun no ha pagado
        }
        return transacciones.get(transacciones.size() - 1);
    }

    // ---------------------------------------------------------------
    // 4. Aplicar el resultado del pago
    // ---------------------------------------------------------------
    // Busca la orden por referencia, revisa que el monto coincida y guarda el estado.
    // Si se aprobo: la reserva pasa a CONFIRMADA y se registra el pago como PAGADO.
    @Transactional
    public Optional<Orden> actualizarOrden(String referencia, String estado, String transaccionId, long centavos) {
        Optional<Orden> encontrada = ordenRepository.findByReferencia(referencia);
        if (encontrada.isEmpty()) {
            return Optional.empty();
        }
        Orden orden = encontrada.get();

        // Seguridad: el monto pagado debe ser el mismo de la orden
        if (orden.getMontoEnCentavos() != centavos) {
            estado = "ERROR";
        }

        // Una orden aprobada ya no cambia (Wompi puede repetir el aviso)
        if (!orden.getEstado().equals("APPROVED")) {
            orden.setEstado(estado);
            orden.setTransaccionId(transaccionId);
            orden.setFechaActualizacion(LocalDateTime.now());
            ordenRepository.save(orden);

            if (estado.equals("APPROVED")) {
                registrarPagoAprobado(orden);
            }
        }
        return Optional.of(orden);
    }

    private void registrarPagoAprobado(Orden orden) {
        reserva reserva = orden.getReserva();
        reserva.setEstado("CONFIRMADA");
        reservaRepository.save(reserva);

        // Si la reserva ya tenia un pago (por ejemplo PENDIENTE), lo actualizamos; si no, lo creamos
        pago pagoReserva = pagoRepository.findByReservaId(reserva.getId()).orElse(new pago());
        pagoReserva.setReserva(reserva);
        pagoReserva.setMonto(BigDecimal.valueOf(orden.getMontoEnCentavos()).divide(BigDecimal.valueOf(100)));
        pagoReserva.setMetodoPago("WOMPI");
        pagoReserva.setFechaPago(LocalDate.now());
        pagoReserva.setEstadoPago("PAGADO");
        pagoRepository.save(pagoReserva);
    }

    // ---------------------------------------------------------------
    // Ayudas
    // ---------------------------------------------------------------
    // SHA-256 en hexadecimal (64 caracteres)
    private String sha256(String texto) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(texto.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo calcular SHA-256", e);
        }
    }

    private String codificar(String valor) {
        return URLEncoder.encode(valor, StandardCharsets.UTF_8);
    }
}
