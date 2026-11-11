import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localeEsCO from '@angular/common/locales/es-CO';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// Cargamos el idioma "espanol de Colombia" para que las fechas y el dinero
// se vean asi: "28 oct 2026" y "$ 130.000".
registerLocaleData(localeEsCO);

// Configuracion general de la aplicacion: aqui se "encienden" las
// herramientas de Angular que vamos a usar.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // muestra en consola errores no controlados
    provideZoneChangeDetection({ eventCoalescing: true }), // actualiza la pantalla cuando cambian los datos
    provideRouter(routes), // navegacion entre paginas (ver app.routes.ts)
    provideHttpClient(), // permite hacer peticiones al backend
    { provide: LOCALE_ID, useValue: 'es-CO' }, // idioma por defecto de fechas y monedas
  ],
};
