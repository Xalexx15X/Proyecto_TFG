# ClubSync - Plataforma de Gestión de Discotecas y Eventos

![ClubSync Logo](ruta/a/logo.png)

## 📋 Descripción

ClubSync es una plataforma integral para la gestión de discotecas, eventos y reservas, diseñada para ofrecer una experiencia completa tanto a usuarios finales como a administradores de establecimientos. El sistema permite la compra de entradas, reserva de zonas VIP, gestión de eventos, análisis estadístico y mucho más.

## 🚀 Características principales

### Para usuarios:
- 🎟️ Compra de entradas para eventos en discotecas
- 🍾 Reserva de zonas VIP con selección de botellas
- 💰 Monedero virtual para facilitar pagos
- 🎁 Sistema de puntos y recompensas por fidelidad
- 📱 Acceso a entradas digitales con códigos QR
- 📊 Historial completo de compras y reservas

### Para administradores de discotecas:
- 📅 Gestión completa de eventos y programación
- ⏰ Configuración de tramos horarios y precios
- 🛋️ Gestión de zonas VIP y su disponibilidad
- 🍸 Inventario de botellas y packs disponibles
- 🎧 Gestión de DJs y artistas invitados
- 📊 Estadísticas detalladas de ventas y asistencia

### Para administradores del sistema:
- 👥 Gestión integral de usuarios y permisos
- 🏙️ Administración de discotecas y ciudades
- 🎁 Configuración del programa de fidelización
- 🔒 Control total sobre la plataforma

## 🛠️ Tecnologías utilizadas

### Frontend:
- **Framework**: Angular 17
- **Estilos**: Bootstrap 5, CSS personalizado
- **Gráficos**: Chart.js
- **Generación PDF**: jsPDF
- **Componentes adicionales**: ng2-charts, Angular Material

### Backend:
- **Framework**: Spring Boot 3.4
- **Base de datos**: MySQL
- **Seguridad**: Spring Security con JWT
- **Documentación API**: Swagger/OpenAPI
- **ORM**: Hibernate/JPA
- **Herramientas de desarrollo**: Maven, Lombok

## ⚙️ Requisitos previos

- Node.js (v18 o superior)
- Angular CLI (v17.1 o superior)
- Java 17 o superior
- Maven 3.9 o superior
- MySQL 8.0 o superior
- XAMPP (opcional, para desarrollo local)

## 🔧 Instalación y configuración

### Base de datos
1. Crear una base de datos MySQL con el nombre `clubsync`
2. Importar el esquema desde `database/clubsync.sql`

### Backend
1. Navegar al directorio del backend:
   ```bash
   cd backend
   ```

2. Configurar la conexión a la base de datos en `src/main/resources/application.properties`

3. Compilar el proyecto:
   ```bash
   ./mvnw clean install
   ```

4. Ejecutar el servidor:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend
1. Navegar al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar el servidor de desarrollo:
   ```bash
   ng serve
   ```

La aplicación estará disponible en http://localhost:4200

## 📄 Estructura del proyecto

```
clubsync/
├── backend/                  # Código del servidor Spring Boot
│   ├── src/main/java/com/clubsync/
│   │   ├── Config/           # Configuración de Spring (seguridad, CORS, etc.)
│   │   ├── Controller/       # Controladores REST
│   │   ├── Dto/              # Objetos de transferencia de datos
│   │   ├── Entity/           # Entidades JPA
│   │   ├── Exception/        # Manejo de excepciones personalizado
│   │   ├── Mapper/           # Conversión entre entidades y DTOs
│   │   ├── Repository/       # Interfaces de acceso a datos
│   │   └── Service/          # Lógica de negocio
│   └── src/main/resources/   # Configuración, propiedades, etc.
├── frontend/                 # Aplicación Angular
│   ├── src/app/
│   │   ├── componentes/      # Componentes de la interfaz de usuario
│   │   ├── guard/            # Guardias de protección de rutas
│   │   ├── interceptor/      # Interceptores HTTP
│   │   ├── model/            # Modelos e interfaces
│   │   └── service/          # Servicios de conexión con la API
│   └── src/assets/           # Imágenes, iconos, etc.
└── database/                 # Scripts SQL y modelo de datos
```

## 🔐 Usuarios predeterminados

Para facilitar las pruebas, el sistema incluye varios usuarios predefinidos:

### Administrador general:
- **Email**: admin@clubsync.com
- **Contraseña**: admin123

### Administrador de discoteca:
- **Email**: adminclub@clubsync.com
- **Contraseña**: admin123

### Cliente:
- **Email**: cliente@clubsync.com
- **Contraseña**: cliente123

## 📋 API REST

El backend expone una API REST completa. La documentación detallada está disponible a través de Swagger una vez que el servidor esté en ejecución:

### Los principales endpoints incluyen:

- `/api/auth`: Autenticación y registro
- `/api/usuarios`: Gestión de usuarios
- `/api/discotecas`: Gestión de discotecas
- `/api/eventos`: Gestión de eventos
- `/api/pedidos`: Gestión de pedidos y carritos
- `/api/entradas`: Gestión de entradas
- `/api/estadisticas`: Endpoints para datos estadísticos

## ✅ Testing

### Backend
```bash
cd backend
./mvnw test
```

### Frontend
```bash
cd frontend
ng test
```

## 🔄 Flujo de trabajo recomendado para desarrollo

1. Clonar el repositorio
2. Crear una nueva rama para la funcionalidad a desarrollar
3. Realizar cambios en el código
4. Ejecutar pruebas para verificar el correcto funcionamiento
5. Crear un pull request a la rama principal
