import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ContadorService } from '../core/contador.service';
import { ConfirmService } from '../core/confirm.service';
import { ESTADOS_RESERVA, Plan, Reserva, Usuario } from '../core/models';
import { ToastService } from '../core/toast.service';
import { contieneTexto, obtenerFechaDeHoy, obtenerIniciales } from '../core/utilidades';
import { IconComponent } from '../shared/icon.component';
import { ModalComponent } from '../shared/modal.component';

// Datos del formulario de reserva.
// Los <select> trabajan con numeros, por eso guardamos usuarioId y planId
// (y no el usuario y el plan completos).
interface FormularioReserva {
  id?: number;
  usuarioId: number | null;
  planId: number | null;
  fecha: string;
  hora: string;
  numeroPersonas: number | null;
  estado: string;
}

// =====================================================================
// PAGINA DE RESERVAS
// Tabla de reservas con:
//  - pildoras para filtrar por estado (con su contador)
//  - buscador
//  - cambio de estado directo desde la tabla
//  - formulario para crear y editar
// =====================================================================

@Component({
  selector: 'app-reservas',
  imports: [FormsModule, DatePipe, TitleCasePipe, IconComponent, ModalComponent],
  templateUrl: './reservas.page.html',
})
export class ReservasPage implements OnInit {
  reservas: Reserva[] = [];
  usuarios: Usuario[] = []; // para el select "Cliente"
  planes: Plan[] = []; // para el select "Plan"

  cargando = true;
  guardando = false;
  textoBusqueda = '';
  modalAbierto = false;
  formulario: FormularioReserva = this.crearFormularioVacio();

  // Estado elegido en las pildoras. '' = sin filtro (se ven todas)
  filtroEstado = '';

  estados = ESTADOS_RESERVA; // PENDIENTE, CONFIRMADA, CANCELADA

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private contadorService = inject(ContadorService);
  private confirmService = inject(ConfirmService);

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarUsuarios();
    this.cargarPlanes();
  }

  cargarReservas(): void {
    this.cargando = true;
    this.apiService.get('reservas').subscribe({
      next: (datos) => {
        this.reservas = datos;
        this.cargando = false;
      },
      error: (error) => {
        this.toastService.error(this.apiService.obtenerMensajeError(error));
        this.cargando = false;
      },
    });
  }

  cargarUsuarios(): void {
    this.apiService.get('usuarios').subscribe({
      next: (datos) => {
        this.usuarios = datos;
      },
    });
  }

  cargarPlanes(): void {
    this.apiService.get('planes').subscribe({
      next: (datos) => {
        this.planes = datos;
      },
    });
  }

  iniciales(nombre: string | undefined): string {
    return obtenerIniciales(nombre);
  }

  // "20:00:00" -> "20:00"
  horaCorta(hora: string): string {
    return hora.substring(0, 5);
  }

  // Cuenta cuantas reservas hay con un estado. Ej: contarPorEstado('PENDIENTE') -> 1
  contarPorEstado(estado: string): number {
    let total = 0;
    for (const reserva of this.reservas) {
      if (reserva.estado === estado) {
        total = total + 1;
      }
    }
    return total;
  }

  // Clic en una pildora: si ya estaba elegida la quitamos; si no, la elegimos.
  alternarFiltro(estado: string): void {
    if (this.filtroEstado === estado) {
      this.filtroEstado = '';
    } else {
      this.filtroEstado = estado;
    }
  }

  // Aplica el filtro de estado y luego el buscador
  reservasFiltradas(): Reserva[] {
    const texto = this.textoBusqueda.trim().toLowerCase();
    const resultado: Reserva[] = [];

    for (const reserva of this.reservas) {
      // 1. Filtro de la pildora
      if (this.filtroEstado !== '' && reserva.estado !== this.filtroEstado) {
        continue;
      }

      // 2. Buscador: por cliente, por plan o por numero (#3)
      if (texto !== '') {
        let nombreCliente = '';
        if (reserva.usuario) {
          nombreCliente = reserva.usuario.nombreCompleto;
        }
        let nombrePlan = '';
        if (reserva.plan) {
          nombrePlan = reserva.plan.nombre;
        }
        const numero = '#' + reserva.id;

        const coincide =
          contieneTexto(nombreCliente, texto) || contieneTexto(nombrePlan, texto) || contieneTexto(numero, texto);
        if (!coincide) {
          continue;
        }
      }

      resultado.push(reserva);
    }
    return resultado;
  }

  // Clientes para el select: solo los activos.
  // Excepcion: si editamos una reserva de un cliente que despues se
  // desactivo, lo incluimos para que el select no quede en blanco.
  usuariosActivos(): Usuario[] {
    const resultado: Usuario[] = [];
    for (const usuario of this.usuarios) {
      if (usuario.activo || usuario.id === this.formulario.usuarioId) {
        resultado.push(usuario);
      }
    }
    return resultado;
  }

  // Valores iniciales de una reserva nueva: hoy, 8 de la noche, 2 personas, pendiente
  crearFormularioVacio(): FormularioReserva {
    return {
      usuarioId: null,
      planId: null,
      fecha: obtenerFechaDeHoy(),
      hora: '20:00',
      numeroPersonas: 2,
      estado: 'PENDIENTE',
    };
  }

  abrirNuevo(): void {
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
  }

  // Pasamos la reserva al formulario.
  // Sacamos el id del usuario y del plan para los <select>,
  // y recortamos la hora a "HH:mm" porque asi la pide el campo de hora.
  abrirEditar(reserva: Reserva): void {
    let usuarioId: number | null = null;
    if (reserva.usuario && reserva.usuario.id) {
      usuarioId = reserva.usuario.id;
    }
    let planId: number | null = null;
    if (reserva.plan && reserva.plan.id) {
      planId = reserva.plan.id;
    }

    this.formulario = {
      id: reserva.id,
      usuarioId: usuarioId,
      planId: planId,
      fecha: reserva.fecha,
      hora: this.horaCorta(reserva.hora),
      numeroPersonas: reserva.numeroPersonas,
      estado: reserva.estado,
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardar(): void {
    this.guardando = true;

    // El backend espera el usuario y el plan como objetos con su id:
    // { usuario: { id: 2 }, plan: { id: 3 }, fecha: ..., ... }
    const datos = {
      usuario: { id: this.formulario.usuarioId },
      plan: { id: this.formulario.planId },
      fecha: this.formulario.fecha,
      hora: this.formulario.hora,
      numeroPersonas: this.formulario.numeroPersonas,
      estado: this.formulario.estado,
    };

    if (this.formulario.id) {
      this.apiService.put('reservas/' + this.formulario.id, datos).subscribe({
        next: () => this.terminarDeGuardar('Reserva actualizada correctamente'),
        error: (error) => this.mostrarErrorAlGuardar(error),
      });
    } else {
      this.apiService.post('reservas', datos).subscribe({
        next: () => this.terminarDeGuardar('Reserva creada correctamente'),
        error: (error) => this.mostrarErrorAlGuardar(error),
      });
    }
  }

  terminarDeGuardar(mensaje: string): void {
    this.toastService.exito(mensaje);
    this.contadorService.registrarAccion(); // signal: suma 1 al contador
    this.modalAbierto = false;
    this.guardando = false;
    this.cargarReservas();
  }

  mostrarErrorAlGuardar(error: any): void {
    this.toastService.error(this.apiService.obtenerMensajeError(error));
    this.guardando = false;
  }

  eliminar(reserva: Reserva): void {
    this.confirmService.preguntar(
      'Eliminar reserva',
      '¿Seguro que quieres eliminar "Reserva #' + reserva.id + '"? Esta acción no se puede deshacer.',
      'Eliminar',
      () => {
        this.apiService.delete('reservas/' + reserva.id).subscribe({
          next: () => {
            this.toastService.exito('Reserva eliminada');
            this.contadorService.registrarAccion(); // signal: suma 1 al contador
            this.cargarReservas();
          },
          error: (error) => {
            this.toastService.error(this.apiService.obtenerMensajeError(error));
          },
        });
      },
    );
  }

  // Se ejecuta al cambiar el estado en el selector de la tabla.
  // Solo se envia el estado nuevo (PATCH), sin abrir el formulario.
  cambiarEstado(reserva: Reserva, nuevoEstado: string): void {
    this.apiService.patch('reservas/' + reserva.id + '/estado', { estado: nuevoEstado }).subscribe({
      next: () => {
        reserva.estado = nuevoEstado; // actualizamos solo esa fila
        this.toastService.exito('Reserva #' + reserva.id + ' marcada como ' + nuevoEstado.toLowerCase());
        this.contadorService.registrarAccion(); // signal: suma 1 al contador
      },
      error: (error) => {
        this.toastService.error(this.apiService.obtenerMensajeError(error));
        this.cargarReservas(); // recargamos para mostrar el estado real
      },
    });
  }
}
