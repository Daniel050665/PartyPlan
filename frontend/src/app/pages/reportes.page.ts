import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { IngresoMetodoReporte, PlanRankingReporte, ReservaEstadoReporte } from '../core/models';
import { ToastService } from '../core/toast.service';
import { primeraMayuscula } from '../core/utilidades';
import { Barra, BarListComponent, colorDeEstado } from '../shared/bar-list.component';
import { IconComponent } from '../shared/icon.component';

// =====================================================================
// PAGINA DE REPORTES
// Pide al backend los 3 reportes y los dibuja como graficos de barras.
// Los calculos (contar y sumar) los hace el BACKEND; aqui solo
// convertimos los datos en barras.
// =====================================================================

@Component({
  selector: 'app-reportes',
  imports: [BarListComponent, IconComponent, CurrencyPipe],
  templateUrl: './reportes.page.html',
  styleUrl: './reportes.page.css',
})
export class ReportesPage implements OnInit {
  cargando = true;

  // Cuantas respuestas del backend faltan por llegar (son 3 reportes)
  respuestasPendientes = 0;

  // Barras de cada grafico
  barrasEstado: Barra[] = [];
  barrasIngresos: Barra[] = [];
  barrasRanking: Barra[] = [];

  // Totales que se muestran debajo de los titulos
  totalReservas = 0;
  totalIngresos = 0;

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.cargar();
  }

  // Tambien se usa en el boton "Actualizar"
  cargar(): void {
    this.cargando = true;
    this.respuestasPendientes = 3;

    // Reporte 1: reservas por estado. Llega asi: [{ estado: 'CONFIRMADA', total: 2 }, ...]
    this.apiService.get('reportes/reservas-por-estado').subscribe({
      next: (datos: ReservaEstadoReporte[]) => {
        this.barrasEstado = [];
        this.totalReservas = 0;
        for (const fila of datos) {
          this.barrasEstado.push({
            etiqueta: primeraMayuscula(fila.estado),
            valor: fila.total,
            color: colorDeEstado(fila.estado),
          });
          this.totalReservas = this.totalReservas + fila.total;
        }
        this.unaRespuestaMenos();
      },
      error: (error) => this.mostrarError(error),
    });

    // Reporte 2: ingresos por metodo. Llega asi: [{ metodoPago: 'TARJETA', total: 30000 }, ...]
    this.apiService.get('reportes/ingresos-por-metodo').subscribe({
      next: (datos: IngresoMetodoReporte[]) => {
        this.barrasIngresos = [];
        this.totalIngresos = 0;
        for (const fila of datos) {
          const total = Number(fila.total);
          this.barrasIngresos.push({
            etiqueta: primeraMayuscula(fila.metodoPago),
            valor: total,
            texto: this.formatearPesos(total),
          });
          this.totalIngresos = this.totalIngresos + total;
        }
        this.unaRespuestaMenos();
      },
      error: (error) => this.mostrarError(error),
    });

    // Reporte 3: ranking de planes. Llega asi: [{ nombrePlan: 'Ruta Candelaria', totalReservas: 2 }, ...]
    this.apiService.get('reportes/ranking-planes').subscribe({
      next: (datos: PlanRankingReporte[]) => {
        this.barrasRanking = [];
        for (const fila of datos) {
          let texto = fila.totalReservas + ' reservas';
          if (fila.totalReservas === 1) {
            texto = '1 reserva'; // singular
          }
          this.barrasRanking.push({ etiqueta: fila.nombrePlan, valor: fila.totalReservas, texto: texto });
        }
        this.unaRespuestaMenos();
      },
      error: (error) => this.mostrarError(error),
    });
  }

  // Cuando llegan las 3 respuestas, dejamos de mostrar "cargando"
  unaRespuestaMenos(): void {
    this.respuestasPendientes = this.respuestasPendientes - 1;
    if (this.respuestasPendientes === 0) {
      this.cargando = false;
    }
  }

  mostrarError(error: any): void {
    this.toastService.error(this.apiService.obtenerMensajeError(error));
    this.unaRespuestaMenos();
  }

  // 100000 -> "$ 100.000" (formato de pesos colombianos, sin decimales)
  formatearPesos(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }
}
