import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ContadorService } from '../core/contador.service';
import { ESTADOS_PAGO, METODOS_PAGO, Pago, Reserva } from '../core/models';
import { ToastService } from '../core/toast.service';
import { contieneTexto, obtenerFechaDeHoy } from '../core/utilidades';
import { IconComponent } from '../shared/icon.component';
import { ModalComponent } from '../shared/modal.component';

// Datos del formulario de pago (guardamos solo el id de la reserva para el <select>)
interface FormularioPago {
  id?: number;
  reservaId: number | null;
  monto: number | null;
  metodoPago: string;
  fechaPago: string;
  estadoPago: string;
}

// =====================================================================
// PAGINA DE PAGOS
// Tres tarjetas con totales (Recaudado, Por cobrar, Rechazado), la tabla
// de pagos y el formulario para registrar o editar un pago.
// Los pagos no se eliminan (el backend no lo permite).
// =====================================================================

@Component({
  selector: 'app-pagos',
  imports: [FormsModule, CurrencyPipe, DatePipe, TitleCasePipe, IconComponent, ModalComponent],
  templateUrl: './pagos.page.html',
})
export class PagosPage implements OnInit {
  pagos: Pago[] = [];
  reservas: Reserva[] = []; // para el select "Reserva"

  cargando = true;
  guardando = false;
  textoBusqueda = '';
  modalAbierto = false;
  formulario: FormularioPago = this.crearFormularioVacio();

  estados = ESTADOS_PAGO; // PENDIENTE, PAGADO, RECHAZADO
  metodos = METODOS_PAGO; // EFECTIVO, TARJETA, TRANSFERENCIA

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private contadorService = inject(ContadorService);

  ngOnInit(): void {
    this.cargarPagos();
    this.cargarReservas();
  }

  cargarPagos(): void {
    this.cargando = true;
    this.apiService.get('pagos').subscribe({
      next: (datos) => {
        this.pagos = datos;
        this.cargando = false;
      },
      error: (error) => {
        this.toastService.error(this.apiService.obtenerMensajeError(error));
        this.cargando = false;
      },
    });
  }

  cargarReservas(): void {
    this.apiService.get('reservas').subscribe({
      next: (datos) => {
        this.reservas = datos;
      },
    });
  }

  // Suma los montos de los pagos que tienen cierto estado.
  // Ej: sumarPorEstado('PAGADO') -> 130000
  sumarPorEstado(estado: string): number {
    let suma = 0;
    for (const pago of this.pagos) {
      if (pago.estadoPago === estado && pago.monto !== null) {
        suma = suma + Number(pago.monto);
      }
    }
    return suma;
  }

  // Pagos que coinciden con el buscador (cliente, plan, metodo o numero de reserva)
  pagosFiltrados(): Pago[] {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (texto === '') {
      return this.pagos;
    }

    const resultado: Pago[] = [];
    for (const pago of this.pagos) {
      let nombreCliente = '';
      let nombrePlan = '';
      let numeroReserva = '';
      if (pago.reserva) {
        numeroReserva = '#' + pago.reserva.id;
        if (pago.reserva.usuario) {
          nombreCliente = pago.reserva.usuario.nombreCompleto;
        }
        if (pago.reserva.plan) {
          nombrePlan = pago.reserva.plan.nombre;
        }
      }

      if (
        contieneTexto(nombreCliente, texto) ||
        contieneTexto(nombrePlan, texto) ||
        contieneTexto(pago.metodoPago, texto) ||
        contieneTexto(numeroReserva, texto)
      ) {
        resultado.push(pago);
      }
    }
    return resultado;
  }

  // Cada reserva solo puede tener UN pago.
  // Por eso en el select solo mostramos las reservas que todavia no tienen pago.
  // (Al editar un pago, su propia reserva si debe aparecer.)
  reservasDisponibles(): Reserva[] {
    const resultado: Reserva[] = [];

    for (const reserva of this.reservas) {
      // Revisamos si alguno de los pagos ya es de esta reserva
      let yaTienePago = false;
      for (const pago of this.pagos) {
        if (pago.reserva && pago.reserva.id === reserva.id) {
          yaTienePago = true;
        }
      }

      if (!yaTienePago || reserva.id === this.formulario.reservaId) {
        resultado.push(reserva);
      }
    }
    return resultado;
  }

  // Al elegir una reserva, si el monto esta vacio, ponemos el precio del plan
  sugerirMonto(reservaId: number): void {
    if (this.formulario.monto) {
      return; // ya habia un monto escrito: no lo tocamos
    }
    for (const reserva of this.reservas) {
      if (reserva.id === reservaId && reserva.plan && reserva.plan.precio) {
        this.formulario.monto = reserva.plan.precio;
      }
    }
  }

  crearFormularioVacio(): FormularioPago {
    return {
      reservaId: null,
      monto: null,
      metodoPago: 'TARJETA',
      fechaPago: obtenerFechaDeHoy(),
      estadoPago: 'PENDIENTE',
    };
  }

  abrirNuevo(): void {
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
  }

  abrirEditar(pago: Pago): void {
    let reservaId: number | null = null;
    if (pago.reserva && pago.reserva.id) {
      reservaId = pago.reserva.id;
    }

    this.formulario = {
      id: pago.id,
      reservaId: reservaId,
      monto: pago.monto,
      metodoPago: pago.metodoPago,
      fechaPago: pago.fechaPago,
      estadoPago: pago.estadoPago,
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardar(): void {
    this.guardando = true;

    // El backend espera la reserva como objeto: { reserva: { id: 3 }, ... }
    const datos = {
      reserva: { id: this.formulario.reservaId },
      monto: this.formulario.monto,
      metodoPago: this.formulario.metodoPago,
      fechaPago: this.formulario.fechaPago,
      estadoPago: this.formulario.estadoPago,
    };

    if (this.formulario.id) {
      this.apiService.put('pagos/' + this.formulario.id, datos).subscribe({
        next: () => this.terminarDeGuardar('Pago actualizado correctamente'),
        error: (error) => this.mostrarErrorAlGuardar(error),
      });
    } else {
      this.apiService.post('pagos', datos).subscribe({
        next: () => this.terminarDeGuardar('Pago creado correctamente'),
        error: (error) => this.mostrarErrorAlGuardar(error),
      });
    }
  }

  terminarDeGuardar(mensaje: string): void {
    this.toastService.exito(mensaje);
    this.contadorService.registrarAccion(); // signal: suma 1 al contador
    this.modalAbierto = false;
    this.guardando = false;
    this.cargarPagos();
  }

  mostrarErrorAlGuardar(error: any): void {
    this.toastService.error(this.apiService.obtenerMensajeError(error));
    this.guardando = false;
  }

  // Cambio de estado desde el selector de la tabla
  cambiarEstado(pago: Pago, nuevoEstado: string): void {
    this.apiService.patch('pagos/' + pago.id + '/estado', { estadoPago: nuevoEstado }).subscribe({
      next: () => {
        pago.estadoPago = nuevoEstado;
        this.toastService.exito('Pago marcado como ' + nuevoEstado.toLowerCase());
        this.contadorService.registrarAccion(); // signal: suma 1 al contador
      },
      error: (error) => {
        this.toastService.error(this.apiService.obtenerMensajeError(error));
        this.cargarPagos();
      },
    });
  }
}
