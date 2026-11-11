// =====================================================================
// FUNCIONES DE AYUDA
// Pequenas funciones que usan varias pantallas.
// =====================================================================

// Devuelve las iniciales de un nombre para el circulo (avatar).
// Ejemplo: "Maria Gonzalez" -> "MG"
export function obtenerIniciales(nombre: string | undefined | null): string {
  if (!nombre) {
    return '?';
  }

  const palabras = nombre.split(' '); // separa el nombre por espacios
  let iniciales = '';

  for (const palabra of palabras) {
    // saltamos los espacios dobles (palabras vacias)
    if (palabra === '') {
      continue;
    }
    iniciales = iniciales + palabra[0].toUpperCase();
    // solo queremos 2 letras
    if (iniciales.length === 2) {
      break;
    }
  }

  return iniciales;
}

// Devuelve la fecha de hoy con el formato que usa el backend: "2026-10-28".
// Se arma a mano con la hora de Colombia (no se usa toISOString porque
// esa funcion usa la hora de Londres y de noche daria la fecha de manana).
export function obtenerFechaDeHoy(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth() + 1; // los meses empiezan en 0 (enero = 0)
  const dia = hoy.getDate();

  let textoMes = String(mes);
  if (mes < 10) {
    textoMes = '0' + mes; // 5 -> "05"
  }

  let textoDia = String(dia);
  if (dia < 10) {
    textoDia = '0' + dia;
  }

  return anio + '-' + textoMes + '-' + textoDia;
}

// Dice si "valor" contiene el "texto" buscado, sin importar mayusculas.
// Se usa en los buscadores. Ejemplo: contieneTexto("Museo del Oro", "museo") -> true
export function contieneTexto(valor: string | undefined | null, texto: string): boolean {
  if (!valor) {
    return false;
  }
  return valor.toLowerCase().includes(texto);
}

// Pone la primera letra en mayuscula y el resto en minuscula.
// Ejemplo: "TARJETA" -> "Tarjeta"
export function primeraMayuscula(texto: string): string {
  if (texto === '') {
    return '';
  }
  return texto[0].toUpperCase() + texto.substring(1).toLowerCase();
}
