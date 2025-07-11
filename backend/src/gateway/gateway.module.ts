import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '../users/users.module';
import { RoomsModule } from '../rooms/rooms.module';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@Module({
  imports: [UsersModule, RoomsModule, AuthModule],
  providers: [ChatGateway, WsJwtGuard],
  exports: [ChatGateway],
})
export class GatewayModule {} 