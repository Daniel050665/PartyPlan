import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Lugar, Pago, Plan, Reserva, Usuario } from '../core/models';
import { ToastService } from '../core/toast.service';
import { obtenerFechaDeHoy, obtenerIniciales } from '../core/utilidades';
import { Barra, BarListComponent, colorDeEstado } from '../shared/bar-list.component';
import { IconComponent } from '../shared/icon.component';

// =====================================================================
// PAGINA DE INICIO (DASHBOARD)
// Resumen general: 4 tarjetas con numeros, proximas reservas,
// grafico de estados y clientes recientes.
// Pedimos las 5 listas al backend y con ellas calculamos todo.
// =====================================================================

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe, TitleCasePipe, IconComponent, BarListComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class DashboardPage implements OnInit {
  // Listas que llegan del backend
  reservas: Reserva[] = [];
  pagos: Pago[] = [];
  usuarios: Usuario[] = [];
  planes: Plan[] = [];
  lugares: Lugar[] = [];

  cargando = true; // true hasta que llegan las reservas

  // Resultados que se muestran en pantalla (se calculan en calcularResumen)
  totalPendientes = 0;
  totalIngresos = 0;
  totalClientesActivos = 0;
  proximasReservas: Reserva[] = [];
  clientesRecientes: Usuario[] = [];
  barrasEstado: Barra[] = [];

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  authService = inject(AuthService);

  ngOnInit(): void {
    this.calcularResumen(); // para que el grafico muestre las barras en 0 desde el inicio

    // Pedimos las 5 listas. Cada vez que llega una, recalculamos el resumen.
    this.apiService.get('reservas').subscribe({
      next: (datos) => {
        this.reservas = datos;
        this.cargando = false;
        this.calcularResumen();
      },
      error: (error) => {
        this.toastService.error(this.apiService.obtenerMensajeError(error));
        this.cargando = false;
      },
    });

    this.apiService.get('pagos').subscribe({
      next: (datos) => {
        this.pagos = datos;
        this.calcularResumen();
      },
    });

    this.apiService.get('usuarios').subscribe({
      next: (datos) => {
        this.usuarios = datos;
        this.calcularResumen();
      },
    });

    this.apiService.get('planes').subscribe({
      next: (datos) => {
        this.planes = datos;
      },
    });

    this.apiService.get('lugares').subscribe({
      next: (datos) => {
        this.lugares = datos;
      },
    });
  }

  // "Buenos dias" antes de las 12, "Buenas tardes" antes de las 7 p. m., si no "Buenas noches"
  saludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) {
      return 'Buenos días';
    } else if (hora < 19) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  }

  iniciales(nombre: string | undefined): string {
    return obtenerIniciales(nombre);
  }

  // "20:00:00" -> "20:00"
  horaCorta(hora: string): string {
    return hora.substring(0, 5);
  }

  // Calcula todos los numeros y listas de la pagina
  calcularResumen(): void {
    // 1. Reservas pendientes
    this.totalPendientes = 0;
    for (const reserva of this.reservas) {
      if (reserva.estado === 'PENDIENTE') {
        this.totalPendientes = this.totalPendientes + 1;
      }
    }

    // 2. Ingresos: suma de los pagos que estan PAGADO
    this.totalIngresos = 0;
    for (const pago of this.pagos) {
      if (pago.estadoPago === 'PAGADO' && pago.monto !== null) {
        this.totalIngresos = this.totalIngresos + Number(pago.monto);
      }
    }

    // 3. Clientes activos
    this.totalClientesActivos = 0;
    for (const usuario of this.usuarios) {
      if (usuario.activo) {
        this.totalClientesActivos = this.totalClientesActivos + 1;
      }
    }

    // 4. Proximas reservas y clientes recientes (ver abajo)
    this.proximasReservas = this.buscarProximasReservas();
    this.clientesRecientes = this.buscarClientesRecientes();

    // 5. Barras del grafico "Estado de reservas"
    this.barrasEstado = [
      { etiqueta: 'Confirmada', valor: this.contarPorEstado('CONFIRMADA'), color: colorDeEstado('CONFIRMADA') },
      { etiqueta: 'Pendiente', valor: this.contarPorEstado('PENDIENTE'), color: colorDeEstado('PENDIENTE') },
      { etiqueta: 'Cancelada', valor: this.contarPorEstado('CANCELADA'), color: colorDeEstado('CANCELADA') },
    ];
  }

  contarPorEstado(estado: string): number {
    let total = 0;
    for (const reserva of this.reservas) {
      if (reserva.estado === estado) {
        total = total + 1;
      }
    }
    return total;
  }

  // Reservas de hoy en adelante que no esten canceladas, ordenadas de la
  // mas cercana a la mas lejana. Maximo 6.
  buscarProximasReservas(): Reserva[] {
    const hoy = obtenerFechaDeHoy(); // ej. "2026-10-28"

    // Paso 1: quedarnos con las futuras y no canceladas.
    // Las fechas son textos como "2026-10-30". Con ese formato (anio-mes-dia)
    // comparar textos funciona igual que comparar fechas: "2026-10-30" >= "2026-10-28".
    const futuras: Reserva[] = [];
    for (const reserva of this.reservas) {
      if (reserva.fecha >= hoy && reserva.estado !== 'CANCELADA') {
        futuras.push(reserva);
      }
    }

    // Paso 2: ordenar por fecha y hora.
    // sort() compara de a dos reservas: devolver -1 pone "a" primero,
    // 1 pone "b" primero y 0 las deja igual.
    futuras.sort((a, b) => {
      const momentoA = a.fecha + ' ' + a.hora; // ej. "2026-10-30 14:30:00"
      const momentoB = b.fecha + ' ' + b.hora;
      if (momentoA < momentoB) {
        return -1;
      } else if (momentoA > momentoB) {
        return 1;
      } else {
        return 0;
      }
    });

    // Paso 3: tomar solo las primeras 6
    const primeras: Reserva[] = [];
    for (const reserva of futuras) {
      if (primeras.length < 6) {
        primeras.push(reserva);
      }
    }
    return primeras;
  }

  // Los 4 ultimos clientes registrados (el id mas alto es el mas nuevo)
  buscarClientesRecientes(): Usuario[] {
    // Copiamos la lista para no desordenar la original
    const copia: Usuario[] = [];
    for (const usuario of this.usuarios) {
      copia.push(usuario);
    }

    // Ordenamos de id mayor a id menor
    copia.sort((a, b) => {
      const idA = a.id || 0;
      const idB = b.id || 0;
      return idB - idA;
    });

    // Tomamos los primeros 4
    const recientes: Usuario[] = [];
    for (const usuario of copia) {
      if (recientes.length < 4) {
        recientes.push(usuario);
      }
    }
    return recientes;
  }
}
