// =====================================================================
// MODELOS
// Aqui describimos como es cada dato que nos manda el backend.
// Una "interface" es como una plantilla: dice que campos tiene un objeto.
// El signo ? significa que ese campo puede no venir (por ejemplo, el id
// de un registro nuevo todavia no existe).
// =====================================================================

export interface Usuario {
  id?: number;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  activo?: boolean;
}

export interface Plan {
  id?: number;
  tipo: string; // CULTURAL, NOCTURNO o MIXTO
  nombre: string;
  descripcion: string;
  precio: number | null; // null = el campo esta vacio en el formulario
}

export interface Lugar {
  id?: number;
  nombre: string;
  categoria: string;
  direccion: string;
  capacidad: number | null;
}

// Una reserva trae adentro el usuario y el plan completos.
export interface Reserva {
  id?: number;
  usuario: Usuario | null;
  plan: Plan | null;
  fecha: string; // ejemplo: "2026-10-30"
  hora: string; // ejemplo: "20:00:00"
  numeroPersonas: number | null;
  estado: string; // PENDIENTE, CONFIRMADA o CANCELADA
}

// Un pago trae adentro la reserva completa.
export interface Pago {
  id?: number;
  reserva: Reserva | null;
  monto: number | null;
  metodoPago: string; // EFECTIVO, TARJETA o TRANSFERENCIA
  fechaPago: string;
  estadoPago: string; // PENDIENTE, PAGADO o RECHAZADO
}

// Datos que devuelven los reportes del backend
export interface ReservaEstadoReporte {
  estado: string;
  total: number;
}

export interface IngresoMetodoReporte {
  metodoPago: string;
  total: number;
}

export interface PlanRankingReporte {
  nombrePlan: string;
  totalReservas: number;
}

// Listas de opciones para los <select> de los formularios
export const ESTADOS_RESERVA = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'];
export const ESTADOS_PAGO = ['PENDIENTE', 'PAGADO', 'RECHAZADO'];
export const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];
export const TIPOS_PLAN = ['CULTURAL', 'NOCTURNO', 'MIXTO'];
