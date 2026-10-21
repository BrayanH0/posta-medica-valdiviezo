# Sistema de Citas Médicas - Centro Valdiviezo

Este proyecto es una aplicación web completa para la gestión de citas médicas, pacientes, médicos e historias clínicas para el Centro Médico Valdiviezo.

## 📋 Descripción General

El sistema permite la administración integral de un centro médico, facilitando:
- **Gestión de Pacientes:** Registro, edición, eliminación y listado.
- **Gestión de Médicos:** Administración de personal médico y sus especialidades.
- **Gestión de Citas:** Programación, reprogramación y cancelación de citas.
- **Historias Clínicas:** Registro y seguimiento de la evolución de los pacientes.
- **Reportes:** Visualización de estadísticas y métricas del centro.
- **Roles:** Acceso diferenciado para Administradores y Pacientes.

## 🛠️ Tecnologías Utilizadas

### Backend
- **Lenguaje:** Java 17
- **Framework:** Spring Boot 3.5.6
- **Seguridad:** Spring Security & JWT (JSON Web Tokens)
- **Persistencia:** Spring Data JPA & Hibernate
- **Base de Datos:** MySQL 8.0+
- **Herramienta de Construcción:** Maven

### Frontend
- **Framework:** Angular 17+ (Standalone Components)
- **Lenguaje:** TypeScript
- **Estilos:** CSS3 (Diseño Responsivo)
- **Cliente HTTP:** Angular HttpClient
- **Gestor de Paquetes:** NPM

## 📂 Estructura del Proyecto

El proyecto está organizado en dos directorios principales:

```
proyecto_valdiviezo/
├── backend/                # Código fuente del servidor (Spring Boot)
│   └── backend/
│       ├── src/main/java   # Controladores, Modelos, Servicios, Repositorios
│       ├── src/main/resources # Configuración (application.properties)
│       └── pom.xml         # Dependencias Maven
│
├── proyecto_valdiviezo/    # Código fuente del cliente (Angular)
│   ├── src/app/
│   │   ├── admin/          # Módulos de administración (Dashboard, Pacientes, Médicos)
│   │   ├── features/       # Lógica de negocio (Servicios)
│   │   ├── login/          # Componentes de autenticación
│   │   └── models/         # Interfaces TypeScript
│   ├── angular.json        # Configuración de Angular
│   └── package.json        # Dependencias NPM
│
└── BDPostaMedica.sql       # Script único de Base de Datos (Schema + Data)
```

## ⚙️ Configuración de la Base de Datos

El proyecto utiliza un **único script SQL** maestro ubicado en la raíz: `BDPostaMedica.sql`.

1. **Motor:** MySQL
2. **Base de Datos:** `posta_medica_valdiviezo`
3. **Credenciales por defecto:**
   - Usuario: `root`
   - Contraseña: `admin`
   *(Configurable en `backend/backend/src/main/resources/application.properties`)*

### Instrucciones de BD:
Ejecutar el script `BDPostaMedica.sql` en su totalidad. Este script:
- Crea la base de datos y tablas.
- Inserta datos semilla (usuarios, médicos, especialidades).
- Configura claves foráneas con **CASCADE DELETE** para integridad referencial.

## 🚀 Instrucciones de Instalación y Ejecución

### Prerrequisitos
- Java JDK 17
- Node.js (v18 o superior)
- MySQL Server
- Maven (opcional, el proyecto incluye `mvnw`)

### Paso 1: Iniciar el Backend
1. Abrir una terminal en la carpeta del backend:
   ```bash
   cd backend/backend
   ```
2. Ejecutar la aplicación con Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   *El servidor iniciará en el puerto `8080`.*

### Paso 2: Iniciar el Frontend
1. Abrir una nueva terminal en la carpeta del frontend:
   ```bash
   cd proyecto_valdiviezo
   ```
2. Instalar dependencias (solo la primera vez):
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm start
   ```
   *La aplicación estará disponible en `http://localhost:4200`.*

## 🔑 Credenciales de Prueba

### Administrador
- **DNI:** `87654321`
- **Contraseña:** `123456`

### Paciente (Ejemplo)
- **DNI:** `12345678`
- **Contraseña:** `123456`

## 📡 Endpoints Principales (API)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/paciente` | Listar todos los pacientes |
| POST | `/api/paciente/crear` | Registrar nuevo paciente |
| PUT | `/api/paciente/actualizar/{id}` | Actualizar datos de paciente |
| DELETE | `/api/paciente/eliminar/{id}` | Eliminar paciente (Cascade) |
| GET | `/api/medico` | Listar médicos |
| GET | `/api/cita` | Listar citas |
| POST | `/api/auth/login` | Autenticación de usuarios |

## ✨ Características Destacadas

- **Eliminación en Cascada:** Al eliminar un paciente, el sistema elimina automáticamente sus citas e historias clínicas asociadas para mantener la integridad de la base de datos.
- **Validaciones:** El frontend incluye validaciones de formularios y manejo de errores HTTP (404, 409, 500).
- **Dashboard Admin:** Panel exclusivo para administradores con acceso a reportes y gestión CRUD completa.
- **Seguridad:** Contraseñas encriptadas (preparado para BCrypt) y autenticación basada en roles.

## 📝 Notas de Desarrollo

- El proyecto utiliza `Standalone Components` en Angular, eliminando la necesidad de `app.module.ts`.
- La configuración de CORS está habilitada globalmente en el backend para permitir peticiones desde `localhost:4200`.
- Para regenerar la base de datos, ejecutar siempre `BDPostaMedica.sql` completo; incluye sentencias `DROP DATABASE IF EXISTS` (comentadas por seguridad) y recreación de tablas.

---
**Desarrollado para el Centro Médico Valdiviezo**
*Noviembre 2025*
