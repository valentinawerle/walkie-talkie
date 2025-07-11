# 🛠️ Documentación Técnica - Aplicación Walkie-Talkie

## 📋 Índice
1. [Arquitectura del Sistema](#-arquitectura-del-sistema)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Configuración del Entorno](#-configuración-del-entorno)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [APIs y Endpoints](#-apis-y-endpoints)
6. [WebSocket Events](#-websocket-events)
7. [Base de Datos](#-base-de-datos)
8. [Autenticación y Seguridad](#-autenticación-y-seguridad)
9. [Manejo de Audio](#-manejo-de-audio)
10. [Despliegue](#-despliegue)
11. [Testing](#-testing)
12. [Monitoreo y Logs](#-monitoreo-y-logs)

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Angular)     │◄──►│   (Nest.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │    │ │ Controllers │ │    │ │ Collections │ │
│ │ Services    │ │    │ │ Services    │ │    │ │ Users       │ │
│ │ Guards      │ │    │ │ Guards      │ │    │ │ Rooms       │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │ WebSocket (Socket.IO) │
         └───────────────────────┘
```

### Componentes Principales

#### Frontend (Angular)
- **Components**: Interfaces de usuario modulares
- **Services**: Lógica de negocio y comunicación
- **Guards**: Protección de rutas
- **Interceptors**: Manejo de requests HTTP
- **Models**: Interfaces TypeScript

#### Backend (Nest.js)
- **Controllers**: Endpoints HTTP
- **Services**: Lógica de negocio
- **Guards**: Autenticación y autorización
- **Gateways**: WebSocket handlers
- **DTOs**: Data Transfer Objects

#### Base de Datos (MongoDB)
- **Users Collection**: Información de usuarios
- **Rooms Collection**: Salas de chat
- **Indexes**: Optimización de consultas

---

## 🛠️ Stack Tecnológico

### Backend
```json
{
  "framework": "Nest.js v10.0.0",
  "runtime": "Node.js v18+",
  "database": "MongoDB v6.0+",
  "orm": "Mongoose v7.0+",
  "websocket": "Socket.IO v4.7+",
  "authentication": "JWT",
  "validation": "class-validator",
  "cors": "enabled"
}
```

### Frontend
```json
{
  "framework": "Angular v16.0.0",
  "language": "TypeScript v5.0+",
  "ui": "Angular Material v16.0+",
  "websocket": "Socket.IO Client v4.7+",
  "build": "Angular CLI",
  "testing": "Jasmine + Karma"
}
```

### Herramientas de Desarrollo
```json
{
  "package_manager": "npm",
  "version_control": "Git",
  "ide": "VS Code (recomendado)",
  "api_testing": "Postman/Insomnia",
  "database_gui": "MongoDB Compass"
}
```

---

## ⚙️ Configuración del Entorno

### Requisitos Previos

```bash
# Node.js y npm
node --version  # v18.0.0 o superior
npm --version   # v9.0.0 o superior

# MongoDB
mongod --version  # v6.0.0 o superior

# Angular CLI
npm install -g @angular/cli
```

### Variables de Entorno

#### Backend (.env)
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
MONGODB_URI=mongodb://localhost:27017/walkie-talkie

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:4200

# WebSocket
WS_PORT=3000
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  wsUrl: 'http://localhost:3000',
  appName: 'Walkie-Talkie'
};
```

---

## 📁 Estructura del Proyecto

### Backend Structure
```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── ws-auth.guard.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── schemas/
│   │   │   └── user.schema.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── login-user.dto.ts
│   ├── rooms/
│   │   ├── rooms.controller.ts
│   │   ├── rooms.service.ts
│   │   ├── rooms.module.ts
│   │   ├── schemas/
│   │   │   └── room.schema.ts
│   │   └── dto/
│   │       ├── create-room.dto.ts
│   │       └── join-room.dto.ts
│   ├── websocket/
│   │   ├── websocket.gateway.ts
│   │   ├── websocket.service.ts
│   │   └── websocket.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── app.module.ts
│   └── main.ts
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.scss
│   │   │   ├── rooms/
│   │   │   │   ├── rooms.component.ts
│   │   │   │   ├── rooms.component.html
│   │   │   │   └── rooms.component.scss
│   │   │   └── room-chat/
│   │   │       ├── room-chat.component.ts
│   │   │       ├── room-chat.component.html
│   │   │       └── room-chat.component.scss
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── rooms.service.ts
│   │   │   └── websocket.service.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── room.model.ts
│   │   │   └── websocket.model.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles/
│   │   └── styles.scss
│   ├── main.ts
│   └── index.html
├── package.json
├── angular.json
└── tsconfig.json
```

---

## 🔌 APIs y Endpoints

### Autenticación

#### POST /auth/register
```typescript
// Request
{
  "username": "string",
  "email": "string",
  "password": "string"
}

// Response
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string"
    },
    "token": "string"
  }
}
```

#### POST /auth/login
```typescript
// Request
{
  "email": "string",
  "password": "string"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string"
    },
    "token": "string"
  }
}
```

### Salas

#### GET /rooms
```typescript
// Response
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "isPrivate": boolean,
      "maxMembers": number,
      "members": [
        {
          "_id": "string",
          "username": "string"
        }
      ],
      "admins": [
        {
          "_id": "string",
          "username": "string"
        }
      ],
      "createdBy": {
        "_id": "string",
        "username": "string"
      },
      "createdAt": "Date",
      "isActive": boolean
    }
  ]
}
```

#### POST /rooms
```typescript
// Request
{
  "name": "string",
  "description": "string",
  "maxMembers": number,
  "isPrivate": boolean
}

// Response
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "isPrivate": boolean,
    "maxMembers": number,
    "members": [],
    "admins": [],
    "createdBy": {
      "_id": "string",
      "username": "string"
    },
    "createdAt": "Date",
    "isActive": boolean
  }
}
```

#### GET /rooms/:id
```typescript
// Response
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "isPrivate": boolean,
    "maxMembers": number,
    "members": [],
    "admins": [],
    "createdBy": {
      "_id": "string",
      "username": "string"
    },
    "createdAt": "Date",
    "isActive": boolean
  }
}
```

#### POST /rooms/:id/join
```typescript
// Response
{
  "success": true,
  "message": "Joined room successfully"
}
```

#### POST /rooms/:id/leave
```typescript
// Response
{
  "success": true,
  "message": "Left room successfully"
}
```

---

## 🔄 WebSocket Events

### Eventos del Cliente al Servidor

#### join-room
```typescript
// Emitido por el cliente
{
  "roomId": "string"
}

// Respuesta del servidor
{
  "success": boolean,
  "message": "string"
}
```

#### leave-room
```typescript
// Emitido por el cliente
{
  "roomId": "string"
}

// Respuesta del servidor
{
  "success": boolean,
  "message": "string"
}
```

#### start-speaking
```typescript
// Emitido por el cliente
{
  "roomId": "string"
}

// Broadcast a todos los usuarios en la sala
{
  "roomId": "string",
  "username": "string",
  "isSpeaking": true
}
```

#### stop-speaking
```typescript
// Emitido por el cliente
{
  "roomId": "string"
}

// Broadcast a todos los usuarios en la sala
{
  "roomId": "string",
  "username": "string",
  "isSpeaking": false
}
```

#### audio-data
```typescript
// Emitido por el cliente
{
  "roomId": "string",
  "audioData": "string" // base64 encoded audio
}

// Broadcast a todos los usuarios en la sala (excepto el emisor)
{
  "roomId": "string",
  "userId": "string",
  "username": "string",
  "audioBlob": "Blob" // Convertido de base64
}
```

### Eventos del Servidor al Cliente

#### user-joined-room
```typescript
{
  "roomId": "string",
  "username": "string",
  "userId": "string"
}
```

#### user-left-room
```typescript
{
  "roomId": "string",
  "username": "string",
  "userId": "string"
}
```

#### speaking-event
```typescript
{
  "roomId": "string",
  "username": "string",
  "isSpeaking": boolean
}
```

---

## 🗄️ Base de Datos

### Esquemas MongoDB

#### User Schema
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

#### Room Schema
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Room extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ required: true, min: 1, max: 20 })
  maxMembers: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  admins: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
```

### Índices Recomendados
```javascript
// Users collection
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "isActive": 1 });

// Rooms collection
db.rooms.createIndex({ "name": 1 });
db.rooms.createIndex({ "isPrivate": 1 });
db.rooms.createIndex({ "isActive": 1 });
db.rooms.createIndex({ "createdBy": 1 });
db.rooms.createIndex({ "members": 1 });
```

---

## 🔐 Autenticación y Seguridad

### JWT Strategy
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
    };
  }
}
```

### HTTP Guard
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    return request.user;
  }
}
```

### WebSocket Guard
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToHttp().getRequest();
    const token = client.handshake.auth.token;

    if (!token) {
      throw new WsException('Token not found');
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      client.data.user = decoded;
      return true;
    } catch (err) {
      throw new WsException('Invalid token');
    }
  }
}
```

---

## 🎵 Manejo de Audio

### Captura de Audio (Frontend)
```typescript
async startSpeaking(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(stream, { mimeType });
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(this.audioChunks, { type: mimeType });
      const base64Audio = await this.blobToBase64(audioBlob);
      
      this.webSocketService.sendAudioData(this.room._id, base64Audio);
      this.audioChunks = [];
    };

    this.mediaRecorder.start(50);
    this.isSpeaking = true;
  } catch (error) {
    console.error('Error accessing microphone:', error);
  }
}
```

### Conversión Base64
```typescript
private blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data URL prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

### Reproducción de Audio
```typescript
private playAudio(audioBlob: Blob, username: string): void {
  try {
    const audio = new Audio();
    const audioUrl = URL.createObjectURL(audioBlob);

    audio.src = audioUrl;
    audio.volume = 0.8;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = (error) => {
      console.error('Audio element error:', error);
      URL.revokeObjectURL(audioUrl);
    };

    if (!this.audioActivated) {
      // Show activation message
      return;
    }

    audio.play().catch((error) => {
      if (error.name === 'NotAllowedError') {
        // Handle autoplay policy error
      }
    });
  } catch (error) {
    console.error('Error creating audio element:', error);
  }
}
```

### Procesamiento en Backend
```typescript
@SubscribeMessage('audio-data')
async handleAudioData(
  @MessageBody() data: { roomId: string; audioData: string },
  @ConnectedSocket() client: Socket
) {
  try {
    const user = client.data.user;
    const room = await this.roomsService.getRoomById(data.roomId);
    
    if (!room || !this.isUserInRoom(room, user.userId)) {
      throw new WsException('User is not a member of this room');
    }

    // Convert base64 back to buffer
    const audioBuffer = Buffer.from(data.audioData, 'base64');
    
    // Broadcast to all users in room except sender
    client.to(data.roomId).emit('audio-data', {
      roomId: data.roomId,
      userId: user.userId,
      username: user.username,
      audioBlob: audioBuffer
    });

  } catch (error) {
    console.error('Error handling audio data:', error);
  }
}
```

---

## 🚀 Despliegue

### Configuración de Producción

#### Backend (PM2)
```bash
# Instalación de PM2
npm install -g pm2

# Build del proyecto
npm run build

# Iniciar con PM2
pm2 start dist/main.js --name "walkie-talkie-backend"

# Configuración PM2
pm2 ecosystem
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'walkie-talkie-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      MONGODB_URI: 'mongodb://localhost:27017/walkie-talkie',
      JWT_SECRET: 'your-production-secret'
    }
  }]
};
```

#### Frontend (Nginx)
```bash
# Build de producción
ng build --configuration production

# Configuración Nginx
sudo nano /etc/nginx/sites-available/walkie-talkie
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/walkie-talkie/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Docker (Opcional)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/walkie-talkie
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## 🧪 Testing

### Backend Testing
```typescript
// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await service.register(userData);
      expect(result.success).toBe(true);
      expect(result.data.user.username).toBe(userData.username);
    });
  });
});
```

### Frontend Testing
```typescript
// websocket.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { WebSocketService } from './websocket.service';

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect to WebSocket', () => {
    service.connect();
    expect(service.isConnected()).toBe(true);
  });
});
```

### E2E Testing
```typescript
// app.e2e-spec.ts
import { test, expect } from '@playwright/test';

test('user can register and join room', async ({ page }) => {
  await page.goto('http://localhost:4200');
  
  // Register
  await page.click('text=Registrarse');
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Create room
  await page.click('text=Crear Sala');
  await page.fill('input[name="name"]', 'Test Room');
  await page.fill('textarea[name="description"]', 'Test Description');
  await page.click('button[type="submit"]');
  
  // Verify room creation
  await expect(page.locator('text=Test Room')).toBeVisible();
});
```

---

## 📊 Monitoreo y Logs

### Logging Configuration
```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');
  logger.log('Application starting...');

  await app.listen(process.env.PORT || 3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
```

### Custom Logger Service
```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CustomLoggerService {
  private readonly logger = new Logger(CustomLoggerService.name);

  logWebSocketEvent(event: string, data: any) {
    this.logger.log(`WebSocket Event: ${event}`, data);
  }

  logAudioEvent(userId: string, roomId: string, action: string) {
    this.logger.log(`Audio Event: ${action}`, { userId, roomId });
  }

  logUserAction(userId: string, action: string, details?: any) {
    this.logger.log(`User Action: ${action}`, { userId, details });
  }
}
```

### Health Check Endpoint
```typescript
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    };
  }
}
```

### Métricas de Rendimiento
```typescript
// performance.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.url} - ${duration}ms`);
    });
    
    next();
  }
}
```

---

## 🔧 Scripts de Desarrollo

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run start:dev",
    "dev:frontend": "cd frontend && ng serve --port 4200",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && ng build --configuration production",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd backend && npm run test",
    "test:frontend": "cd frontend && npm run test",
    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "cd backend && npm run lint",
    "lint:frontend": "cd frontend && npm run lint",
    "format": "prettier --write \"**/*.{ts,js,json,md}\""
  }
}
```

### Git Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Nest.js Documentation](https://docs.nestjs.com/)
- [Angular Documentation](https://angular.io/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)

### Herramientas Recomendadas
- **API Testing**: Postman, Insomnia
- **Database GUI**: MongoDB Compass
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git, GitHub
- **Monitoring**: PM2, New Relic

### Mejores Prácticas
1. **Seguridad**: Validar todas las entradas
2. **Performance**: Optimizar consultas de base de datos
3. **Testing**: Mantener cobertura de tests alta
4. **Documentation**: Mantener documentación actualizada
5. **Monitoring**: Implementar logs y métricas

---

*Documentación Técnica v1.0*  
*Última actualización: $(date)*  
*Compatible con la aplicación Walkie-Talkie v1.0.0* 