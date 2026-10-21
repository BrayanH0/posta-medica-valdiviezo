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

#### 3. Configurar Credenciales (si es necesario)
Si usaste credenciales diferentes, actualiza:
`backend\backend\src\main\resources\application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/posta_medica_valdiviezo
spring.datasource.username=root
spring.datasource.password=TU_CONTRASEÑA_AQUI
```

---

## 🚀 Ejecutar la Aplicación

### Backend (Spring Boot)
```powershell
cd "c:\Users\ORLANDO\Desktop\sitio web Jean Piier\proyecto_valdiviezo\backend\backend"
mvn spring-boot:run
```
El backend estará disponible en: http://localhost:8080

### Frontend (Angular)
```powershell
cd "c:\Users\ORLANDO\Desktop\sitio web Jean Piier\proyecto_valdiviezo\proyecto_valdiviezo"
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
cd "c:\Users\ORLANDO\Desktop\sitio web Jean Piier\proyecto_valdiviezo\backend\backend"
mvn clean package
```

### Compilar Frontend para Producción
```powershell
cd "c:\Users\ORLANDO\Desktop\sitio web Jean Piier\proyecto_valdiviezo\proyecto_valdiviezo"
npm run build
```

---

## 📂 Estructura del Proyecto

```
proyecto_valdiviezo/
├── backend/
│   └── backend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   └── test/
│       └── pom.xml
│
└── proyecto_valdiviezo/
    ├── src/
    │   ├── app/
    │   ├── index.html
    │   └── main.ts
    └── package.json
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
- Comprueba las credenciales en `application.properties`
- Verifica que la base de datos existe: `SHOW DATABASES;`

### Puerto en Uso
Si el puerto 8080 o 4200 está ocupado:
- Backend: Cambia el puerto en `application.properties`: `server.port=8081`
- Frontend: Usa `npm start -- --port 4201`

---

## 📞 Contacto

Para más información sobre el proyecto Centro Valdiviezo, consulta la documentación en el repositorio.
