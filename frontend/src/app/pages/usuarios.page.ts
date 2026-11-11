import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ContadorService } from '../core/contador.service';
import { ConfirmService } from '../core/confirm.service';
import { Usuario } from '../core/models';
import { ToastService } from '../core/toast.service';
import { contieneTexto, obtenerIniciales } from '../core/utilidades';
import { IconComponent } from '../shared/icon.component';
import { ModalComponent } from '../shared/modal.component';
import { UsuarioFormComponent } from './usuario-form.component';

// =====================================================================
// PAGINA DE USUARIOS (CLIENTES)
// Tabla de clientes con filtro Todos / Activos / Inactivos.
// Los usuarios no se borran: se "desactivan" (activo = false) y se
// pueden volver a activar.
//
// COMUNICACION PADRE-HIJO: esta pagina es el PADRE. El formulario esta en
// el componente HIJO UsuarioFormComponent (usuario-form.component.ts).
//   - Al pulsar el lapiz se SELECCIONA un usuario (usuarioSeleccionado)
//     y se le pasa al hijo con [usuario]="usuarioSeleccionado" (input()).
//   - El hijo devuelve el usuario modificado con emit() y el padre lo
//     recibe en (guardar)="guardarUsuario($event)".
// =====================================================================

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, IconComponent, ModalComponent, UsuarioFormComponent],
  templateUrl: './usuarios.page.html',
})
export class UsuariosPage implements OnInit {
  usuarios: Usuario[] = [];
  cargando = true;
  guardando = false;
  textoBusqueda = '';
  modalAbierto = false;
  // Usuario elegido en la tabla para editar. null = estamos creando uno nuevo.
  usuarioSeleccionado: Usuario | null = null;

  // Filtro elegido: 'todos', 'activos' o 'inactivos'
  filtro = 'todos';

  // Los tres botones del filtro
  opcionesFiltro = [
    { valor: 'todos', etiqueta: 'Todos' },
    { valor: 'activos', etiqueta: 'Activos' },
    { valor: 'inactivos', etiqueta: 'Inactivos' },
  ];

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private contadorService = inject(ContadorService);
  private confirmService = inject(ConfirmService);

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.apiService.get('usuarios').subscribe({
      next: (datos) => {
        this.usuarios = datos;
        this.cargando = false;
      },
      error: (error) => {
        this.toastService.error(this.apiService.obtenerMensajeError(error));
        this.cargando = false;
      },
    });
  }

  // Para el circulo con las iniciales. Ej: "Juan Perez" -> "JP"
  iniciales(nombre: string): string {
    return obtenerIniciales(nombre);
  }

  cambiarFiltro(valor: string): void {
    this.filtro = valor;
  }

  // Aplica el filtro de botones y luego el buscador
  usuariosFiltrados(): Usuario[] {
    const texto = this.textoBusqueda.trim().toLowerCase();
    const resultado: Usuario[] = [];

    for (const usuario of this.usuarios) {
      // 1. Filtro Todos / Activos / Inactivos
      if (this.filtro === 'activos' && !usuario.activo) {
        continue; // continue = saltar este usuario e ir al siguiente
      }
      if (this.filtro === 'inactivos' && usuario.activo) {
        continue;
      }

      // 2. Buscador (si esta vacio, pasan todos)
      if (texto !== '') {
        const coincide =
          contieneTexto(usuario.nombreCompleto, texto) ||
          contieneTexto(usuario.correo, texto) ||
          contieneTexto(usuario.telefono, texto);
        if (!coincide) {
          continue;
        }
      }

      resultado.push(usuario);
    }
    return resultado;
  }

  // Boton "Nuevo usuario": no hay usuario seleccionado, el hijo muestra el formulario vacio
  abrirNuevo(): void {
    this.usuarioSeleccionado = null;
    this.modalAbierto = true;
  }

  // Boton del lapiz: SELECCIONAMOS el usuario. El hijo lo recibe por input().
  abrirEditar(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  // Se ejecuta cuando el HIJO emite el evento (guardar).
  // "usuario" es lo que el hijo envio con emit(): en el HTML llega como $event.
  // Si el correo ya lo tiene otro usuario, el backend responde un error
  // y lo mostramos en rojo (la ventana queda abierta para corregir).
  guardarUsuario(usuario: Usuario): void {
    this.guardando = true;

    if (usuario.id) {
      this.apiService.put('usuarios/' + usuario.id, usuario).subscribe({
        next: () => this.terminarDeGuardar('Usuario actualizado correctamente'),
        error: (error) => this.mostrarErrorAlGuardar(error),
      });
    } else {
      this.apiService.post('usuarios', usuario).subscribe({
        next: () => this.terminarDeGuardar('Usuario creado correctamente'),
        error: (error) => this.mostrarErrorAlGuardar(error),
      });
    }
  }

  terminarDeGuardar(mensaje: string): void {
    this.toastService.exito(mensaje);
    this.contadorService.registrarAccion(); // signal: suma 1 al contador
    this.modalAbierto = false;
    this.guardando = false;
    this.cargarUsuarios();
  }

  mostrarErrorAlGuardar(error: any): void {
    this.toastService.error(this.apiService.obtenerMensajeError(error));
    this.guardando = false;
  }

  // Boton de encender/apagar:
  //  - si el usuario esta activo, pregunta y lo desactiva
  //  - si esta inactivo, lo activa sin preguntar
  cambiarActivo(usuario: Usuario): void {
    if (usuario.activo) {
      this.confirmService.preguntar(
        'Desactivar usuario',
        usuario.nombreCompleto + ' no podrá usarse en nuevas reservas. Puedes reactivarlo cuando quieras.',
        'Desactivar',
        () => {
          this.desactivar(usuario);
        },
      );
    } else {
      this.activar(usuario);
    }
  }

  // DELETE en el backend NO borra al usuario: solo pone activo = false
  desactivar(usuario: Usuario): void {
    this.apiService.delete('usuarios/' + usuario.id).subscribe({
      next: () => {
        this.toastService.exito('Usuario desactivado');
        this.contadorService.registrarAccion(); // signal: suma 1 al contador
        this.cargarUsuarios();
      },
      error: (error) => {
        this.toastService.error(this.apiService.obtenerMensajeError(error));
      },
    });
  }

  activar(usuario: Usuario): void {
    this.apiService.patch('usuarios/' + usuario.id + '/activar', {}).subscribe({
      next: () => {
        this.toastService.exito('Usuario activado');
        this.contadorService.registrarAccion(); // signal: suma 1 al contador
        this.cargarUsuarios();
      },
      error: (error) => {
        this.toastService.error(this.apiService.obtenerMensajeError(error));
      },
    });
  }
}
