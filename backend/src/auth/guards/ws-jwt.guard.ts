import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHeader(client);
      
      console.log('🔐 WS Guard: Checking authentication for client:', client.id);
      console.log('🔐 WS Guard: Token found:', !!token);
      
      if (!token) {
        console.log('❌ WS Guard: No token found');
        throw new WsException('Unauthorized');
      }

      console.log('🔐 WS Guard: Token starts with:', token.substring(0, 20) + '...');
      
      // Try to decode without verification first
      try {
        const decoded = this.jwtService.decode(token);
        console.log('🔐 WS Guard: JWT decoded (without verification):', decoded);
      } catch (decodeError) {
        console.log('🔐 WS Guard: Failed to decode JWT:', decodeError.message);
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      });

      console.log('✅ WS Guard: Token verified for user:', payload.username);

      // Attach user to socket
      client['user'] = {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
      };

      return true;
    } catch (error) {
      console.log('❌ WS Guard: Authentication failed:', error.message);
      console.log('❌ WS Guard: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n')[0]
      });
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth = client.handshake.auth.token || client.handshake.headers.authorization;
    
    if (!auth) {
      return undefined;
    }

    if (auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }

    return auth;
  }
} 