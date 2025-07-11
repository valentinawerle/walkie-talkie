import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';

import { RoomsService } from '../../services/rooms.service';
import { AuthService } from '../../services/auth.service';
import { WebSocketService, UserRoomEvent } from '../../services/websocket.service';
import { Room, CreateRoomRequest } from '../../models/room.model';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.html',
  styleUrls: ['./rooms.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatToolbarModule
  ],
  standalone: true
})
export class RoomsComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  myRooms: Room[] = [];
  isLoading = false;
  currentUser: any;
  private webSocketSubscriptions: any[] = [];

  constructor(
    private roomsService: RoomsService,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    console.log('🚀 [Rooms] Component initializing...');
    this.loadRooms();

    // Connect to WebSocket if not already connected
    if (!this.webSocketService.isConnected()) {
      console.log('🔌 [Rooms] Connecting to WebSocket...');
      this.webSocketService.connect();
    } else {
      console.log('🔌 [Rooms] WebSocket already connected');
    }

    // Wait a bit for connection to establish
    setTimeout(() => {
      console.log('🔌 [Rooms] WebSocket connection status:', this.webSocketService.isConnected());
      this.setupWebSocketListeners();
    }, 1000);
  }

  loadRooms(): void {
    this.isLoading = true;

    // Load all rooms
    this.roomsService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.snackBar.open('Error al cargar las salas', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });

    // Load user's rooms
    this.roomsService.getMyRooms().subscribe({
      next: (rooms) => {
        this.myRooms = rooms;
      },
      error: (error) => {
        console.error('Error loading my rooms:', error);
      }
    });
  }

  joinRoom(room: Room): void {
    this.roomsService.joinRoom(room._id).subscribe({
      next: () => {
        this.snackBar.open(`Te uniste a ${room.name}`, 'Cerrar', { duration: 2000 });
        this.router.navigate(['/room', room._id]);
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'Error al unirse a la sala',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }

  leaveRoom(room: Room): void {
    console.log('Intentando salir de la sala:', room._id);
    console.log('Usuario actual:', this.currentUser);
    console.log('¿Es miembro?', this.isUserInRoom(room));

    this.roomsService.leaveRoom(room._id).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.snackBar.open(`Saliste de ${room.name}`, 'Cerrar', { duration: 2000 });
        this.loadRooms();
      },
      error: (error) => {
        console.error('Error al salir de la sala:', error);
        this.snackBar.open(
          error.error?.message || 'Error al salir de la sala',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }

  enterRoom(room: Room): void {
    this.router.navigate(['/room', room._id]);
  }

  isUserInRoom(room: Room): boolean {
    const isMember = room.members.some(member => member._id === this.currentUser?._id);
    console.log('Verificando si es miembro:', {
      roomId: room._id,
      roomName: room.name,
      currentUserId: this.currentUser?._id,
      roomMembers: room.members.map(m => ({ id: m._id, username: m.username })),
      isMember: isMember
    });
    return isMember;
  }

  isUserAdmin(room: Room): boolean {
    return room.admins.some(admin => admin._id === this.currentUser?._id);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  getMemberCount(room: Room): number {
    return room.members.length;
  }

  getMaxMembers(room: Room): number {
    return room.maxMembers || 10;
  }

    private setupWebSocketListeners(): void {
    console.log('🔌 [Rooms] Setting up WebSocket listeners for room updates');
    console.log('🔌 [Rooms] WebSocket connection status:', this.webSocketService.isConnected());

    // Listen for user joined room events
    const userJoinedSub = this.webSocketService.userJoined$.subscribe((event: UserRoomEvent) => {
      console.log('👤 [Rooms] User joined room event received:', event);
      this.updateRoomMemberCount(event.roomId, 1);
    });

    // Listen for user left room events
    const userLeftSub = this.webSocketService.userLeft$.subscribe((event: UserRoomEvent) => {
      console.log('👋 [Rooms] User left room event received:', event);
      this.updateRoomMemberCount(event.roomId, -1);
    });

    this.webSocketSubscriptions.push(userJoinedSub, userLeftSub);
    console.log('🔌 [Rooms] WebSocket listeners setup complete. Subscriptions:', this.webSocketSubscriptions.length);
  }

    private updateRoomMemberCount(roomId: string, change: number): void {
    console.log(`📊 [Rooms] Updating member count for room ${roomId}, change: ${change}`);

    // First, try to reload the specific room data
    this.roomsService.getRoomById(roomId).subscribe({
      next: (updatedRoom) => {
        console.log(`📊 [Rooms] Received updated room data for ${roomId}:`, updatedRoom);

        // Update in all rooms list
        const roomIndex = this.rooms.findIndex(r => r._id === roomId);
        if (roomIndex !== -1) {
          this.rooms[roomIndex] = updatedRoom;
          console.log(`📊 [Rooms] Updated room in all rooms list: ${updatedRoom.members.length} members`);
        }

        // Update in my rooms list
        const myRoomIndex = this.myRooms.findIndex(r => r._id === roomId);
        if (myRoomIndex !== -1) {
          this.myRooms[myRoomIndex] = updatedRoom;
          console.log(`📊 [Rooms] Updated room in my rooms list: ${updatedRoom.members.length} members`);
        }
      },
      error: (error) => {
        console.error(`❌ [Rooms] Error updating room data for ${roomId}:`, error);
        // If specific room update fails, reload all rooms as fallback
        console.log(`📊 [Rooms] Falling back to reload all rooms...`);
        this.loadRooms();
      }
    });
  }

  ngOnDestroy(): void {
    console.log('🧹 [Rooms] Cleaning up WebSocket subscriptions');
    this.webSocketSubscriptions.forEach(sub => sub.unsubscribe());
    this.webSocketSubscriptions = [];
  }
}
