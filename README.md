# Walkie-Talkie Application

Una aplicación de comunicación en tiempo real que permite a los usuarios hablar entre sí mediante una aplicación cliente y una API REST.

## 🏗️ Arquitectura

- **Backend**: Nest.js + WebSocket + MongoDB
- **Frontend**: Angular + TypeScript + Material Design
- **Comunicación**: WebSocket para audio en tiempo real
- **Autenticación**: JWT
- **Deployment**: Ejecutable con pkg + systemd

## 📁 Estructura del Proyecto

```
walkie-talkie/
├── backend/                 # Nest.js API + WebSocket
│   ├── src/
│   │   ├── auth/           # JWT authentication
│   │   ├── users/          # User management
│   │   ├── rooms/          # Chat rooms/channels
│   │   ├── gateway/        # WebSocket gateway
│   │   ├── static/         # Angular build files
│   │   └── shared/         # DTOs, interfaces, etc.
│   ├── package.json
│   └── nest-cli.json
├── frontend/               # Angular app
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── guards/
│   │   └── assets/
│   ├── package.json
│   └── angular.json
├── scripts/
│   ├── build.sh           # Script para build completo
│   └── deploy.sh          # Script de deployment
├── config/
│   └── production.json    # Configuración de producción
└── README.md
```

## 🚀 Desarrollo Local

### Prerrequisitos

- Node.js 18+
- MongoDB
- Angular CLI
- Nest.js CLI

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd walkie-talkie
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

3. **Instalar dependencias del frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configurar MongoDB**
   - Instalar MongoDB
   - Crear base de datos: `walkie-talkie`

### Ejecutar en Desarrollo

1. **Backend**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   ng serve
   ```

3. **Acceder a la aplicación**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

## 🏗️ Build y Deployment

### Build Completo

```bash
cd scripts
./build.sh
```

Este comando:
1. Compila el frontend Angular
2. Copia los archivos estáticos al backend
3. Compila el backend Nest.js
4. Crea un ejecutable con pkg
5. Genera el paquete de deployment en `dist/`

### Deployment

```bash
cd scripts
./deploy.sh <server-host> <server-user> <server-path>
```

Ejemplo:
```bash
./deploy.sh myserver.com ubuntu /opt/walkie-talkie
```

El script:
1. Copia el ejecutable al servidor
2. Crea un servicio systemd
3. Inicia el servicio automáticamente

## 🔧 Configuración

### Variables de Entorno

- `NODE_ENV`: Entorno (development/production)
- `PORT`: Puerto del servidor (default: 3000)
- `MONGODB_URI`: URI de conexión a MongoDB
- `JWT_SECRET`: Clave secreta para JWT

### Configuración de Producción

Editar `config/production.json`:
```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0"
  },
  "database": {
    "uri": "mongodb://localhost:27017/walkie-talkie"
  },
  "jwt": {
    "secret": "your-super-secret-jwt-key"
  }
}
```

## 📡 API Endpoints

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión

### Usuarios
- `GET /users/profile` - Obtener perfil
- `PUT /users/profile` - Actualizar perfil

### Salas
- `GET /rooms` - Listar salas
- `POST /rooms` - Crear sala
- `GET /rooms/:id` - Obtener sala
- `POST /rooms/:id/join` - Unirse a sala
- `POST /rooms/:id/leave` - Salir de sala

### WebSocket Events
- `join-room` - Unirse a sala
- `leave-room` - Salir de sala
- `audio-data` - Enviar/recibir audio
- `user-joined` - Usuario se unió
- `user-left` - Usuario salió

## 🛠️ Comandos Útiles

### Backend
```bash
cd backend
npm run start:dev    # Desarrollo con hot reload
npm run build        # Build de producción
npm run test         # Ejecutar tests
npm run lint         # Linting
```

### Frontend
```bash
cd frontend
ng serve             # Servidor de desarrollo
ng build             # Build de producción
ng test              # Ejecutar tests
ng lint              # Linting
```

## 📝 Próximos Pasos

- [ ] Implementar autenticación JWT
- [ ] Crear modelos de datos (User, Room)
- [ ] Implementar WebSocket gateway
- [ ] Crear componentes Angular
- [ ] Implementar grabación de audio
- [ ] Agregar tests unitarios
- [ ] Configurar CI/CD

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles. 