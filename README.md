ClubSync - Plataforma de Gestión de Discotecas y Eventos

📋 Descripción
ClubSync es una plataforma integral para la gestión de discotecas, eventos y reservas, diseñada para ofrecer una experiencia completa tanto a usuarios finales como a administradores de establecimientos. El sistema permite la compra de entradas, reserva de zonas VIP, gestión de eventos, análisis estadístico y mucho más.

🚀 Características principales
Para usuarios:
🎟️ Compra de entradas para eventos en discotecas
🍾 Reserva de zonas VIP con selección de botellas
💰 Monedero virtual para facilitar pagos
🎁 Sistema de puntos y recompensas por fidelidad
📱 Acceso a entradas digitales con códigos QR
📊 Historial completo de compras y reservas
Para administradores de discotecas:
📅 Gestión completa de eventos y programación
⏰ Configuración de tramos horarios y precios
🛋️ Gestión de zonas VIP y su disponibilidad
🍸 Inventario de botellas y packs disponibles
🎧 Gestión de DJs y artistas invitados
📊 Estadísticas detalladas de ventas y asistencia
Para administradores del sistema:
👥 Gestión integral de usuarios y permisos
🏙️ Administración de discotecas y ciudades
🎁 Configuración del programa de fidelización
🔒 Control total sobre la plataforma
🛠️ Tecnologías utilizadas
Frontend:
Framework: Angular 17
Estilos: Bootstrap 5, CSS personalizado
Gráficos: Chart.js
Generación PDF: jsPDF
Componentes adicionales: ng2-charts, Angular Material
Backend:
Framework: Spring Boot 3.4
Base de datos: MySQL
Seguridad: Spring Security con JWT
Documentación API: Swagger/OpenAPI
ORM: Hibernate/JPA
Herramientas de desarrollo: Maven, Lombok
⚙️ Requisitos previos
Node.js (v18 o superior)
Angular CLI (v17.1 o superior)
Java 17 o superior
Maven 3.9 o superior
MySQL 8.0 o superior
XAMPP (opcional, para desarrollo local)
🔧 Instalación y configuración
Base de datos
Crear una base de datos MySQL con el nombre clubsync
Importar el esquema desde clubsync.sql
Backend
Navegar al directorio del backend:
Configurar la conexión a la base de datos en src/main/resources/application.properties
Compilar el proyecto:
Ejecutar el servidor:
El servidor estará disponible en http://localhost:9000
Frontend
Navegar al directorio del frontend:
Instalar dependencias:
Ejecutar el servidor de desarrollo:
La aplicación estará disponible en http://localhost:4200
📄 Estructura del proyecto
🔐 Usuarios predeterminados
Para facilitar las pruebas, el sistema incluye varios usuarios predefinidos:

Administrador general:

Email: admin@clubsync.com
Contraseña: admin123
Administrador de discoteca:

Email: adminclub@clubsync.com
Contraseña: admin123
Cliente:

Email: cliente@clubsync.com
Contraseña: cliente123
📱 Capturas de pantalla
Vista de usuario
!Home !Carrito !Wallet

Panel de administración
Admin Panel !Estadísticas

📋 API REST
El backend expone una API REST completa. La documentación detallada está disponible a través de Swagger una vez que el servidor esté en ejecución:

Los principales endpoints incluyen:

/api/auth: Autenticación y registro
/api/usuarios: Gestión de usuarios
/api/discotecas: Gestión de discotecas
/api/eventos: Gestión de eventos
/api/pedidos: Gestión de pedidos y carritos
/api/entradas: Gestión de entradas
/api/estadisticas: Endpoints para datos estadísticos
✅ Testing
Backend
Frontend
🔄 Flujo de trabajo recomendado para desarrollo
Clonar el repositorio
Crear una nueva rama para la funcionalidad a desarrollar
Realizar cambios en el código
Ejecutar pruebas para verificar el correcto funcionamiento
Crear un pull request a la rama principal
🤝 Contribuciones
Las contribuciones son bienvenidas. Para contribuir:

Haz un fork del proyecto
Crea una rama para tu funcionalidad (git checkout -b feature/amazing-feature)
Haz commit de tus cambios (git commit -m 'Add some amazing feature')
Sube la rama (git push origin feature/amazing-feature)
Abre un Pull Request
📝 Licencia
Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

👥 Autores
Tu Nombre - Desarrollador principal - TuUsuario
🙏 Agradecimientos
A todos los profesores y tutores que han guiado este Trabajo de Fin de Grado
A las discotecas y establecimientos que han proporcionado información valiosa para el modelado del sistema
A todas las personas que han contribuido con ideas y sugerencias durante el desarrollo
