# PartyPlan- Plataforma de Experiencias Culturales y Nocturnas en Bogotá

Sistema web desarrollado en Spring Boot para la gestión, comercialización y reserva de planes turísticos, recorridos culturales y reservaciones nocturnas en la ciudad de Bogotá.

---

##  Solución del Problema

### El Problema
La oferta turística y de entretenimiento nocturno en Bogotá suele estar dispersa en múltiples plataformas o requerir contacto directo con cada establecimiento. Esto dificulta que los usuarios puedan agrupar diferentes actividades (como visitar museos y luego asistir a un bar o discoteca) en un único itinerario o paquete comercial. Además, los administradores carecen de una herramienta centralizada para estructurar estos combos de experiencias de manera flexible.

### ¿Cómo se Solucionó?
Se diseñó un modelo relacional y una arquitectura basada en JPA que permite desligar los establecimientos físicos de los paquetes comerciales. Mediante una entidad asociativa intermedia (`Plan_Lugar`), la plataforma permite que un mismo punto de interés (ej. un museo o bar emblemático) pueda formar parte de múltiples planes culturales o nocturnos con itinerarios, secuencias y tiempos estimados independientes. El usuario final puede consultar la oferta disponible, seleccionar un paquete integral y gestionar su reserva e historial desde una interfaz centralizada.

---

##  Stack Tecnológico

* **Lenguaje de Programación:** Java 17 / 21
* **Framework Backend:** Spring Boot 3
* **Capa de Persistencia:** Spring Data JPA / Hibernate
* **Base de Datos:** H2 Database (entorno de desarrollo) / PostgreSQL (producción)
* **Motor de Plantillas (Frontend):** Thymeleaf
* **Diseño y Estilos:** HTML5, CSS3, JavaScript, Bootstrap
* **Herramientas y Utilidades:** Lombok, Maven, Git, GitHub, PlantUML

---

##  Arquitectura del Sistema

La aplicación sigue la arquitectura clásica en capas (*Layered Architecture*) promovida por Spring Boot para garantizar la separación de responsabilidades, la mantenibilidad y el bajo acoplamiento:

$$\text{Vista (Thymeleaf)} \longleftrightarrow \text{Controller} \longleftrightarrow \text{Service / ServiceImpl} \longleftrightarrow \text{Repository} \longleftrightarrow \text{Base de Datos (JPA/Hibernate)}$$

* **Capa de Presentación (Controller + Thymeleaf):** Maneja las peticiones HTTP, procesa los datos ingresados por el usuario y renderiza las vistas dinámicas.
* **Capa de Lógica de Negocio (Service / ServiceImpl):** Aplica las reglas del sistema (gestión de estados de reservas, asignación de itinerarios, cálculo de valores) mediante interfaces e implementaciones concretas.
* **Capa de Acceso a Datos (Repository):** Extiende de `JpaRepository` para la ejecución de consultas CRUD y consultas derivadas (*Derived Query Methods*).
* **Capa del Modelo (Entities):** Representación orientada a objetos de la base de datos relacional con soporte de anotaciones Jakarta Persistence y Lombok.

---

## Pantallas del Sistema

###  Flujo del Administrador
1. **Pantalla de Ingreso / Menú Principal:** Punto de acceso para la gestión administrativa del sistema.
2. **Gestión de Lugares:** Formulario para registrar y listar museos, bares, discotecas y recintos culturales con su dirección y capacidad.
3. **Gestión de Planes:** Módulo para estructurar paquetes comerciales (tipo cultural o nocturno), asignarles un precio y vincularles múltiples lugares ordenados.
4. **Control de Reservas:** Vista para consultar, aprobar o cambiar el estado de las reservas realizadas en la plataforma.

###  Flujo del Usuario Final
1. **Catálogo de Planes:** Vista tipo galería donde se exploran las opciones culturales y de vida nocturna disponibles.
2. **Detalle del Plan:** Presentación del itinerario detallado, lugares incluidos, tiempos estimados y precio del paquete.
3. **Formulario de Reserva:** Pantalla para seleccionar la fecha, la hora, el número de personas y registrar la solicitud.
4. **Historial de Reservas:** Módulo donde el cliente consulta el estado de sus reservas (*PENDIENTE*, *CONFIRMADA*, *CANCELADA*) y sus respectivos pagos.

---

## Estructura del Proyecto

```text
ProyectoWeb/
├── src/
│   ├── main/
│   │   ├── java/com/example/ProyectoWeb/
│   │   │   ├── Entities/               # Clases de dominio JPA (@Entity)
│   │   │   │   ├── Usuario.java
│   │   │   │   ├── Plan.java
│   │   │   │   ├── Lugar.java
│   │   │   │   ├── PlanLugar.java      # Tabla intermedia (N:M)
│   │   │   │   ├── Reserva.java
│   │   │   │   └── Pago.java
│   │   │   ├── Repository/             # Interfaces de acceso a datos (JpaRepository)
│   │   │   │   ├── usuarioRepository.java
│   │   │   │   ├── planRepository.java
│   │   │   │   ├── lugarRepository.java
│   │   │   │   ├── planLugarRepository.java
│   │   │   │   ├── reservaRepository.java
│   │   │   │   └── pagoRepository.java
│   │   │   ├── Service/                # Interfaces de lógica de negocio
│   │   │   │   ├── Impl/               # Implementaciones concretas de servicios (@Service)
│   │   │   │   │   ├── UsuarioServiceImpl.java
│   │   │   │   │   ├── PlanServiceImpl.java
│   │   │   │   │   ├── LugarServiceImpl.java
│   │   │   │   │   ├── ReservaServiceImpl.java
│   │   │   │   │   └── PagoServiceImpl.java
│   │   │   │   ├── UsuarioService.java
│   │   │   │   ├── PlanService.java
│   │   │   │   ├── LugarService.java
│   │   │   │   ├── ReservaService.java
│   │   │   │   └── PagoService.java
│   │   │   ├── Controller/             # Controladores Spring MVC (@Controller)
│   │   │   └── ProyectoWebApplication.java
│   │   └── resources/
│   │       ├── templates/              # Plantillas HTML de Thymeleaf
│   │       ├── static/                 # Archivos estáticos (CSS, JS, imágenes)
│   │       └── application.properties  # Configuración del sistema y BD
└── pom.xml                             # Dependencias del proyecto Maven
```
## Autores
* David Pedraza
* Daniel Nariño 
* Oscar Pinilla
* Richard Navas 

