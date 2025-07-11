import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { io, Socket } from 'socket.io-client';

export interface AudioMessage {
  roomId: string;
  userId: string;
  username: string;
  audioBlob: Blob;
  timestamp: number;
}

export interface SpeakingEvent {
  roomId: string;
  userId: string;
  username: string;
  isSpeaking: boolean;
}

export interface UserRoomEvent {
  roomId: string;
  userId: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private apiUrl = environment.apiUrl;
  private wsUrl = environment.wsUrl;

  private audioDataSubject = new Subject<AudioMessage>();
  private speakingEventSubject = new Subject<SpeakingEvent>();
  private userJoinedSubject = new Subject<UserRoomEvent>();
  private userLeftSubject = new Subject<UserRoomEvent>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  public audioData$ = this.audioDataSubject.asObservable();
  public speakingEvent$ = this.speakingEventSubject.asObservable();
  public userJoined$ = this.userJoinedSubject.asObservable();
  public userLeft$ = this.userLeftSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor(private authService: AuthService) {}

    connect(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    console.log('🔌 Attempting to connect to Socket.IO:', this.wsUrl);

    this.socket = io(this.wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected successfully, Socket ID:', this.socket?.id);
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      this.connectionStatusSubject.next(false);
    });

    // Listen for custom events
    this.socket.on('user-started-speaking', (data) => {
      console.log('🎤 Frontend: Received user-started-speaking event:', data);
      this.speakingEventSubject.next({
        roomId: data.roomId,
        userId: data.userId,
        username: data.username,
        isSpeaking: true
      });
    });

    this.socket.on('user-stopped-speaking', (data) => {
      console.log('🔇 Frontend: Received user-stopped-speaking event:', data);
      this.speakingEventSubject.next({
        roomId: data.roomId,
        userId: data.userId,
        username: data.username,
        isSpeaking: false
      });
    });

    this.socket.on('user-joined-room', (data) => {
      console.log('👤 Frontend: Received user-joined-room event:', data);
      this.userJoinedSubject.next({
        roomId: data.roomId,
        userId: data.userId,
        username: data.username
      });
    });

    this.socket.on('user-left-room', (data) => {
      console.log('👋 Frontend: Received user-left-room event:', data);
      this.userLeftSubject.next({
        roomId: data.roomId,
        userId: data.userId,
        username: data.username
      });
    });

    this.socket.on('audio-data', (data: any) => {
      console.log('🎵 Audio data received:', data);
      console.log('🎵 Audio data length:', data.audioData?.length || 0);
      console.log('🎵 Audio data starts with:', data.audioData?.substring(0, 50) || 'undefined');

      // Convert base64 audio data back to Blob
      try {
        if (!data.audioData || data.audioData.length < 30) {
          console.error('❌ Audio data is empty or too short');
          return;
        }

        const base64Data = data.audioData.split(',')[1]; // Remove data URL prefix
        console.log('🎵 Base64 data length:', base64Data?.length || 0);

        if (!base64Data || base64Data.length === 0) {
          console.error('❌ Base64 data is empty');
          return;
        }

        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/webm' });

        const audioMessage: AudioMessage = {
          roomId: data.roomId,
          userId: data.userId,
          username: data.username,
          audioBlob: audioBlob,
          timestamp: data.timestamp
        };

        console.log('🎵 Converted audio data to blob, size:', audioBlob.size);
        this.audioDataSubject.next(audioMessage);
      } catch (error) {
        console.error('❌ Error converting audio data:', error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }



  joinRoom(roomId: string): void {
    if (this.socket && this.socket.connected) {
      console.log('👤 Frontend: Emitting join-room for room:', roomId);
      this.socket.emit('join-room', { roomId });
    } else {
      console.error('❌ Cannot emit join-room: socket not connected');
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket && this.socket.connected) {
      console.log('👋 Frontend: Emitting leave-room for room:', roomId);
      this.socket.emit('leave-room', { roomId });
    } else {
      console.error('❌ Cannot emit leave-room: socket not connected');
    }
  }

  sendAudioData(roomId: string, audioBlob: Blob): void {
    console.log('🎵 WebSocket: Attempting to send audio data...');
    console.log('🎵 WebSocket: Room ID:', roomId);
    console.log('🎵 WebSocket: Audio blob size:', audioBlob.size);
    console.log('🎵 WebSocket: Socket connected:', this.socket?.connected);

    if (this.socket && this.socket.connected) {
      const reader = new FileReader();
      reader.onload = () => {
        console.log('🎵 WebSocket: FileReader completed, emitting audio-data event');
        this.socket!.emit('audio-data', {
          roomId,
          audioData: reader.result
        });
      };

      reader.onerror = (error) => {
        console.error('❌ WebSocket: FileReader error:', error);
      };

      reader.readAsDataURL(audioBlob);
    } else {
      console.error('❌ WebSocket: Cannot send audio - socket not connected');
    }
  }

  startSpeaking(roomId: string): void {
    if (this.socket && this.socket.connected) {
      console.log('🎤 Frontend: Emitting start-speaking for room:', roomId);
      this.socket.emit('start-speaking', { roomId });
    } else {
      console.error('❌ Cannot emit start-speaking: socket not connected');
    }
  }

  stopSpeaking(roomId: string): void {
    if (this.socket && this.socket.connected) {
      console.log('🔇 Frontend: Emitting stop-speaking for room:', roomId);
      this.socket.emit('stop-speaking', { roomId });
    } else {
      console.error('❌ Cannot emit stop-speaking: socket not connected');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
