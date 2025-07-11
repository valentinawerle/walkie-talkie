import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { UsersService } from '../users/users.service';
import { RoomsService } from '../rooms/rooms.service';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN ? process.env.WS_CORS_ORIGIN.split(',') : ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly roomsService: RoomsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    
    if (client.user) {
      // Update user online status
      await this.usersService.updateOnlineStatus(client.user.id, false);
      
      // Notify all clients that user went offline
      this.server.emit('user-offline', {
        userId: client.user.id,
        username: client.user.username,
      });
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!client.user) {
      return { error: 'Unauthorized' };
    }

    // Check if user is already in the socket room to avoid duplicate joins
    const rooms = client.rooms;
    if (rooms.has(data.roomId)) {
      console.log(`ℹ️ User ${client.user.username} already in socket room ${data.roomId}, skipping join`);
      return { success: true };
    }

    console.log(`👤 User ${client.user.username} joining room ${data.roomId}`);

    try {
      // Join the socket room
      await client.join(data.roomId);
      console.log(`✅ User ${client.user.username} joined socket room ${data.roomId}`);
      
      // Add user to room in database (ignore if already member)
      try {
        console.log(`🔍 Backend: Attempting to add user ${client.user.username} (${client.user.id}) to database room ${data.roomId}`);
        const room = await this.roomsService.joinRoom(
          data.roomId,
          client.user.id,
        );
        console.log(`✅ User ${client.user.username} added to database room ${data.roomId}`);
        console.log(`🔍 Backend: Room members after join:`, room.members.map(m => m.toString()));
      } catch (dbError) {
        console.log(`ℹ️ User ${client.user.username} already in database room ${data.roomId}`);
        console.log(`🔍 Backend: Error details:`, dbError.message);
      }
      
      // Always notify other users in the room, even if user was already in database
      client.to(data.roomId).emit('user-joined-room', {
        userId: client.user.id,
        username: client.user.username,
        roomId: data.roomId,
      });
      console.log(`📢 Emitted user-joined-room event for ${client.user.username} in room ${data.roomId}`);

      return { success: true };
    } catch (error) {
      console.error(`❌ Error joining room: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!client.user) {
      return { error: 'Unauthorized' };
    }

    console.log(`👋 User ${client.user.username} leaving room ${data.roomId}`);

    try {
      // Leave the socket room
      await client.leave(data.roomId);
      console.log(`✅ User ${client.user.username} left socket room ${data.roomId}`);
      
      // Remove user from room in database (ignore if already left)
      try {
        const room = await this.roomsService.leaveRoom(
          data.roomId,
          client.user.id,
        );
        console.log(`✅ User ${client.user.username} removed from database room ${data.roomId}`);
      } catch (dbError) {
        console.log(`ℹ️ User ${client.user.username} already left database room ${data.roomId}`);
      }
      
      // Always notify other users in the room, even if user was already removed from database
      client.to(data.roomId).emit('user-left-room', {
        userId: client.user.id,
        username: client.user.username,
        roomId: data.roomId,
      });
      console.log(`📢 Emitted user-left-room event for ${client.user.username} in room ${data.roomId}`);

      return { success: true };
    } catch (error) {
      console.error(`❌ Error leaving room: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('audio-data')
  async handleAudioData(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; audioData: string },
  ) {
    console.log('🎵 Backend: Received audio-data event');
    console.log('🎵 Backend: From user:', client.user?.username);
    console.log('🎵 Backend: Room ID:', data.roomId);
    console.log('🎵 Backend: Audio data length:', data.audioData?.length || 0);
    
    if (!client.user) {
      console.error('❌ Backend: Unauthorized audio-data event');
      return { error: 'Unauthorized' };
    }

    try {
      // Check if user is in the room
      const room = await this.roomsService.findById(data.roomId);
      console.log('🎵 Backend: Room found:', data.roomId);
      console.log('🎵 Backend: Room members:', room.members.map(m => m.toString()));
      console.log('🎵 Backend: Current user ID:', client.user?.id);
      
      const isMember = room.members.some((member) => {
        if (typeof member === 'string') {
          return member === client.user?.id;
        } else {
          return member._id.toString() === client.user?.id;
        }
      });
      
      console.log('🎵 Backend: Is member check result:', isMember);

      if (!isMember) {
        console.error('❌ Backend: User not a member of room for audio-data');
        console.error('❌ Backend: User ID:', client.user?.id);
        console.error('❌ Backend: Room members:', room.members.map(m => m.toString()));
        return { error: 'Not a member of this room' };
      }

      console.log('🎵 Backend: Broadcasting audio data to room:', data.roomId);
      
      // Broadcast audio data to other users in the room
      client.to(data.roomId).emit('audio-data', {
        roomId: data.roomId,
        userId: client.user.id,
        username: client.user.username,
        audioData: data.audioData,
        timestamp: new Date().toISOString(),
      });

      console.log('🎵 Backend: Audio data broadcasted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Backend: Error handling audio-data:', error);
      return { error: error.message };
    }
  }

  @SubscribeMessage('start-speaking')
  async handleStartSpeaking(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!client.user) {
      return { error: 'Unauthorized' };
    }

    console.log(`🎤 User ${client.user.username} started speaking in room ${data.roomId}`);

    // Notify other users that someone started speaking
    client.to(data.roomId).emit('user-started-speaking', {
      userId: client.user.id,
      username: client.user.username,
      roomId: data.roomId,
    });

    return { success: true };
  }

  @SubscribeMessage('stop-speaking')
  async handleStopSpeaking(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!client.user) {
      return { error: 'Unauthorized' };
    }

    console.log(`🔇 User ${client.user.username} stopped speaking in room ${data.roomId}`);

    // Notify other users that someone stopped speaking
    client.to(data.roomId).emit('user-stopped-speaking', {
      userId: client.user.id,
      username: client.user.username,
      roomId: data.roomId,
    });

    return { success: true };
  }
} 