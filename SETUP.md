# 🚀 Guía de Configuración - Centro Valdiviezo

## ✅ Instalaciones Completadas

### Backend (Spring Boot)
- ✅ **Java JDK 17** - Eclipse Adoptium Temurin
  - Ubicación: `C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot`
  - Variable JAVA_HOME configurada
- ✅ **Maven 3.9.9** - Apache Maven
  - Ubicación: `C:\Users\ORLANDO\maven\apache-maven-3.9.9`
  - Variable MAVEN_HOME configurada
- ✅ **Dependencias Maven** - Instaladas correctamente

### Frontend (Angular)
- ✅ **Node.js v24.11.1**
- ✅ **Dependencias npm** - Instaladas correctamente

---

## 📋 Configuración Pendiente

### Base de Datos MySQL

#### 1. Instalar MySQL Server
- Descarga: https://dev.mysql.com/downloads/mysql/
- Durante la instalación:
  - Usuario: `root`
  - Contraseña: `admin` (o la que prefieras)
  - Puerto: `3306`

#### 2. Crear la Base de Datos
Ejecuta en MySQL Workbench o línea de comandos:

```sql
CREATE DATABASE posta_medica_valdiviezo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. Configurar Credenciales (variables de entorno)
La contraseña de MySQL **no se escribe en ningún archivo del proyecto**. `backend\src\main\resources\application.properties` la toma de variables de entorno:

```properties
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD}
```

- `DB_PASSWORD` (obligatoria): contraseña de tu MySQL. **No tiene valor por defecto**: si no está definida, el backend no arranca.
- `DB_USER` (opcional): usuario de MySQL; si no se define, se usa `root`.

En PowerShell, **solo para la sesión actual** (se pierde al cerrar la terminal):

```powershell
$env:DB_PASSWORD = "tu_clave"
```

**De forma permanente** para tu usuario de Windows (abre una terminal nueva después; VS Code también debe reiniciarse para verla):

```powershell
[Environment]::SetEnvironmentVariable("DB_PASSWORD","tu_clave","User")
```

Para el usuario, igual con `DB_USER` si no usas `root`. La misma variable la necesita `./mvnw test`, porque una de las pruebas levanta la aplicación completa.

---

## 🚀 Ejecutar la Aplicación

### Backend (Spring Boot)
```powershell
cd "c:\Users\ORLANDO\Desktop\sitio web Jean Piier\proyecto_valdiviezo\backend"
mvn spring-boot:run
```
El backend estará disponible en: http://localhost:8080

### Frontend (Angular)
```powershell
cd "c:\Users\ORLANDO\Desktop\sitio web Jean Piier\proyecto_valdiviezo\frontend"
npm start
```
El frontend estará disponible en: http://localhost:4200

---

## 🔧 Scripts Útiles

### Verificar Instalaciones
```powershell
# Java
java -version

# Maven
mvn --version

# Node.js
node --version

# Angular CLI
npm run ng -- version
```

### Compilar Backend
```powershell
cd "c:\Users\ORLANDO\Desktop\sitio web Jean Piier\proyecto_valdiviezo\backend"
mvn clean package
```

### Compilar Frontend para Producción
```powershell
cd "c:\Users\ORLANDO\Desktop\sitio web Jean Piier\proyecto_valdiviezo\frontend"
npm run build
```

---

## 📂 Estructura del Proyecto

Desde LB-4 (RFC-004):

```
(raíz del repositorio)
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── app/      (core/, shared/models/, features/)
│   │   ├── index.html
│   │   └── main.ts
│   └── package.json
│
├── database/BDPostaMedica.sql
├── e2e/          (pruebas Playwright: tests/ y package.json)
└── docs/
```

---

## 🛠️ Solución de Problemas

### Variables de Entorno no Reconocidas
Si después de instalar Java/Maven aún no se reconocen:
1. Cierra **TODAS** las ventanas de PowerShell/Terminal
2. Abre una nueva ventana de PowerShell
3. Verifica con: `java -version` y `mvn --version`

### Error de Conexión a MySQL
- Verifica que MySQL esté ejecutándose
- Comprueba que la variable `DB_PASSWORD` esté definida en la terminal que arranca el backend (`echo $env:DB_PASSWORD` en PowerShell). Si falta, el arranque falla con `Access denied for user 'root'@'localhost' (using password: YES)`: Spring envía el texto `${DB_PASSWORD}` sin reemplazar y MySQL lo rechaza
- Verifica que la base de datos existe: `SHOW DATABASES;`

### Puerto en Uso
Si el puerto 8080 o 4200 está ocupado:
- Backend: Cambia el puerto en `application.properties`: `server.port=8081`
- Frontend: Usa `npm start -- --port 4201`

---

## 📞 Contacto

Para más información sobre el proyecto Centro Valdiviezo, consulta la documentación en el repositorio.
