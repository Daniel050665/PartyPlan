import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ContadorService } from '../core/contador.service';
import { ConfirmService } from '../core/confirm.service';
import { Plan, TIPOS_PLAN } from '../core/models';
import { ToastService } from '../core/toast.service';
import { contieneTexto } from '../core/utilidades';
import { IconComponent } from '../shared/icon.component';
import { ModalComponent } from '../shared/modal.component';

// =====================================================================
// PAGINA DE PLANES
// Muestra los planes como tarjetas de colores y permite crear, editar,
// eliminar y buscar. El color de cada tarjeta depende del tipo de plan.
// =====================================================================

@Component({
  selector: 'app-planes',
  imports: [FormsModule, CurrencyPipe, TitleCasePipe, IconComponent, ModalComponent],
  templateUrl: './planes.page.html',
  styleUrl: './planes.page.css',
})
export class PlanesPage implements OnInit {
  planes: Plan[] = [];
  cargando = true;
  guardando = false;
  textoBusqueda = '';
  modalAbierto = false;
  formulario: Plan = this.crearFormularioVacio();

  // Opciones del select "Tipo": CULTURAL, NOCTURNO, MIXTO
  tipos = TIPOS_PLAN;

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private contadorService = inject(ContadorService);
  private confirmService = inject(ConfirmService);

  ngOnInit(): void {
    this.cargarPlanes();
  }

  cargarPlanes(): void {
    this.cargando = true;
    this.apiService.get('planes').subscribe({
      next: (datos) => {
        this.planes = datos;
        this.cargando = false;
      },
      error: (error) => {
        this.toastService.error(this.apiService.obtenerMensajeError(error));
        this.cargando = false;
      },
    });
  }

  // Planes que coinciden con el buscador (por nombre, tipo o descripcion)
  planesFiltrados(): Plan[] {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (texto === '') {
      return this.planes;
    }

    const resultado: Plan[] = [];
    for (const plan of this.planes) {
      if (
        contieneTexto(plan.nombre, texto) ||
        contieneTexto(plan.tipo, texto) ||
        contieneTexto(plan.descripcion, texto)
      ) {
        resultado.push(plan);
      }
    }
    return resultado;
  }

  crearFormularioVacio(): Plan {
    return { nombre: '', tipo: 'CULTURAL', descripcion: '', precio: null };
  }

  abrirNuevo(): void {
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
  }

  // Copiamos el plan al formulario (copia, para no cambiar la tarjeta si se cancela)
  abrirEditar(plan: Plan): void {
    this.formulario = {
      id: plan.id,
      nombre: plan.nombre,
      tipo: plan.tipo,
      descripcion: plan.descripcion,
      precio: plan.precio,
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardar(): void {
    this.guardando = true;

    if (this.formulario.id) {
      this.apiService.put('planes/' + this.formulario.id, this.formulario).subscribe({
        next: () => this.terminarDeGuardar('Plan actualizado correctamente'),
        error: (error) => this.mostrarErrorAlGuardar(error),
      });
    } else {
      this.apiService.post('planes', this.formulario).subscribe({
        next: () => this.terminarDeGuardar('Plan creado correctamente'),
        error: (error) => this.mostrarErrorAlGuardar(error),
      });
    }
  }

  terminarDeGuardar(mensaje: string): void {
    this.toastService.exito(mensaje);
    this.contadorService.registrarAccion(); // signal: suma 1 al contador
    this.modalAbierto = false;
    this.guardando = false;
    this.cargarPlanes();
  }

  mostrarErrorAlGuardar(error: any): void {
    this.toastService.error(this.apiService.obtenerMensajeError(error));
    this.guardando = false;
  }

  // Si el plan tiene reservas, el backend no deja borrarlo y responde un
  // mensaje de error que mostramos en rojo.
  eliminar(plan: Plan): void {
    this.confirmService.preguntar(
      'Eliminar plan',
      '¿Seguro que quieres eliminar "' + plan.nombre + '"? Esta acción no se puede deshacer.',
      'Eliminar',
      () => {
        this.apiService.delete('planes/' + plan.id).subscribe({
          next: () => {
            this.toastService.exito('Plan eliminado');
            this.contadorService.registrarAccion(); // signal: suma 1 al contador
            this.cargarPlanes();
          },
          error: (error) => {
            this.toastService.error(this.apiService.obtenerMensajeError(error));
          },
        });
      },
    );
  }
}
