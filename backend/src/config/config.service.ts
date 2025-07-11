import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
  };
}

export interface ServerConfig {
  port: number;
  host: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface CorsConfig {
  origin: string[];
  credentials: boolean;
}

export interface WebSocketConfig {
  cors: CorsConfig;
}

export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
  websocket: WebSocketConfig;
}

@Injectable()
export class ConfigService {
  private config: AppConfig;
  private configPath: string;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    // Buscar archivo de configuración en diferentes ubicaciones
    const possiblePaths = [
      // 1. Archivo de configuración en el directorio de trabajo
      path.join(process.cwd(), 'config.json'),
      // 2. Archivo de configuración en el directorio del ejecutable
      path.join(path.dirname(process.execPath), 'config.json'),
      // 3. Archivo de configuración en el directorio padre del ejecutable
      path.join(path.dirname(process.execPath), '..', 'config.json'),
      // 4. Archivo de configuración en el directorio config/
      path.join(process.cwd(), 'config', 'production.json'),
      // 5. Archivo de configuración en el directorio config/ del ejecutable
      path.join(path.dirname(process.execPath), 'config', 'production.json'),
    ];

    let configFound = false;
    for (const configPath of possiblePaths) {
      if (fs.existsSync(configPath)) {
        try {
          const configData = fs.readFileSync(configPath, 'utf8');
          this.config = JSON.parse(configData) as AppConfig;
          this.configPath = configPath;
          console.log(`Configuration loaded from: ${configPath}`);
          configFound = true;
          break;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.warn(
            `Failed to load config from ${configPath}:`,
            errorMessage,
          );
        }
      }
    }

    if (!configFound) {
      console.warn('No configuration file found, using default configuration');
      this.config = this.getDefaultConfig();
    }

    // Validar configuración
    this.validateConfig();
  }

  private getDefaultConfig(): AppConfig {
    return {
      server: {
        port: parseInt(process.env.PORT || '3000'),
        host: process.env.HOST || '0.0.0.0',
      },
      database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/walkie-talkie',
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      },
      cors: {
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:4200'],
        credentials: true,
      },
      websocket: {
        cors: {
          origin: process.env.WS_CORS_ORIGIN ? process.env.WS_CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:4200'],
          credentials: true,
        },
      },
    };
  }

  private validateConfig() {
    if (!this.config.server.port || this.config.server.port < 1 || this.config.server.port > 65535) {
      throw new Error('Invalid server port configuration');
    }

    if (!this.config.database.uri) {
      throw new Error('Database URI is required');
    }

    if (!this.config.jwt.secret || this.config.jwt.secret === 'your-super-secret-jwt-key-change-this-in-production') {
      console.warn('WARNING: Using default JWT secret. Please change it in production.');
    }
  }

  get server(): ServerConfig {
    return this.config.server;
  }

  get database(): DatabaseConfig {
    return this.config.database;
  }

  get jwt(): JwtConfig {
    return this.config.jwt;
  }

  get cors(): CorsConfig {
    return this.config.cors;
  }

  get websocket(): WebSocketConfig {
    return this.config.websocket;
  }

  get configFilePath(): string {
    return this.configPath;
  }

  // Método para recargar configuración (útil para desarrollo)
  reloadConfig() {
    this.loadConfig();
  }

  // Método para obtener toda la configuración
  getConfig(): AppConfig {
    return { ...this.config };
  }
} 