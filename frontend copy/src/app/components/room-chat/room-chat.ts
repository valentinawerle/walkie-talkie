import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';

import { RoomsService } from '../../services/rooms.service';
import { AuthService } from '../../services/auth.service';
import { WebSocketService, SpeakingEvent, UserRoomEvent, AudioMessage } from '../../services/websocket.service';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-room-chat',
  templateUrl: './room-chat.html',
  styleUrls: ['./room-chat.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatChipsModule,
    MatListModule
  ],
  standalone: true
})
export class RoomChatComponent implements OnInit, OnDestroy {
  room: Room | null = null;
  currentUser: any;
  isLoading = true;
  isConnected = false;
  isSpeaking = false;
  isLeaving = false; // Flag to prevent multiple leave events
  speakingUsers: Set<string> = new Set();
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  audioContext: AudioContext | null = null;
  audioReceivedUsers: Set<string> = new Set(); // Track users who sent audio recently
  audioActivated = false; // Flag to track if audio has been activated by user interaction
  private keyboardListeners: { handleKeyDown: (event: KeyboardEvent) => void; handleKeyUp: (event: KeyboardEvent) => void } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomsService: RoomsService,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Get current user first
    this.currentUser = this.authService.getCurrentUser();
    console.log('👤 Component: Current user loaded:', this.currentUser);
    console.log('👤 Component: Current user ID:', this.currentUser?._id);
    console.log('👤 Component: Current user username:', this.currentUser?.username);

    // Debug: Check localStorage directly
    const storedUser = localStorage.getItem('user');
    console.log('👤 Component: Stored user in localStorage:', storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('👤 Component: Parsed user from localStorage:', parsedUser);
    }

    // Initialize audio context for better audio handling
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 Audio context initialized, state:', this.audioContext.state);
    } catch (error) {
      console.error('❌ Error initializing audio context:', error);
    }

    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      console.log('🏠 Component: Initializing with room ID:', roomId);
      this.loadRoom(roomId);
      this.connectWebSocket();
    }

    // Add keyboard event listeners for spacebar
    this.setupKeyboardListeners();
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
    this.stopRecording();
    this.removeKeyboardListeners();
  }

  loadRoom(roomId: string): void {
    console.log('🏠 Component: Loading room data for ID:', roomId);
    this.roomsService.getRoomById(roomId).subscribe({
      next: (room) => {
        console.log('🏠 Component: Room loaded successfully:', room);
        this.room = room;
        this.isLoading = false;

        // If WebSocket is already connected, join the room
        if (this.webSocketService.isConnected()) {
          console.log('🏠 Component: WebSocket connected, joining room:', room._id);
          this.webSocketService.joinRoom(room._id);
        }
      },
      error: (error) => {
        console.error('❌ Component: Error loading room:', error);
        this.snackBar.open('Error al cargar la sala', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/rooms']);
      }
    });
  }

  connectWebSocket(): void {
    console.log('🔌 Component: Connecting WebSocket...');
    this.webSocketService.connect();

    this.webSocketService.connectionStatus$.subscribe(status => {
      console.log('🔌 Component: Connection status changed:', status);
      this.isConnected = status;
      if (status && this.room) {
        console.log('🔌 Component: Joining room via WebSocket:', this.room._id);
        this.webSocketService.joinRoom(this.room._id);
      }
    });

    this.webSocketService.speakingEvent$.subscribe((event: SpeakingEvent) => {
      console.log('🎤 Component: Received speaking event:', event);
      console.log('🎤 Component: Current room ID:', this.room?._id);
      console.log('🎤 Component: Event room ID:', event.roomId);
      console.log('🎤 Component: Room ID match:', event.roomId === this.room?._id);

      if (event.roomId === this.room?._id) {
        if (event.isSpeaking) {
          console.log('🎤 Component: Adding user to speaking list:', event.username);
          this.speakingUsers.add(event.username);
        } else {
          console.log('🔇 Component: Removing user from speaking list:', event.username);
          this.speakingUsers.delete(event.username);
        }
        console.log('🎤 Component: Current speaking users:', Array.from(this.speakingUsers));
      } else {
        console.log('🎤 Component: Event ignored - room ID mismatch');
      }
    });

    // Listen for audio data events
    this.webSocketService.audioData$.subscribe((audioMessage: AudioMessage) => {
      console.log('🎵 Component: Received audio data from:', audioMessage.username);
      console.log('🎵 Component: Audio data room ID:', audioMessage.roomId);
      console.log('🎵 Component: Current room ID:', this.room?._id);
      console.log('🎵 Component: Audio blob size:', audioMessage.audioBlob.size);
      console.log('🎵 Component: Current user ID:', this.currentUser?._id);
      console.log('🎵 Component: Audio user ID:', audioMessage.userId);

      // Check if this is audio from another user in the same room
      const isFromOtherUser = this.currentUser?._id ?
        audioMessage.userId !== this.currentUser._id :
        true; // If currentUser is undefined, assume it's from another user

      if (audioMessage.roomId === this.room?._id && isFromOtherUser) {
        console.log('🎵 Component: Playing received audio...');
        this.playAudio(audioMessage.audioBlob, audioMessage.username);

        // Add user to audio received list for visual feedback
        this.audioReceivedUsers.add(audioMessage.username);
        setTimeout(() => {
          this.audioReceivedUsers.delete(audioMessage.username);
        }, 1000); // Remove after 1 second
      } else {
        console.log('🎵 Component: Audio ignored - room mismatch or own audio');
        console.log('🎵 Component: Room match:', audioMessage.roomId === this.room?._id);
        console.log('🎵 Component: Not own audio:', isFromOtherUser);
      }
    });

    // Handle user join/leave events
    console.log('👤 Component: Setting up user joined subscription...');
    this.webSocketService.userJoined$.subscribe((event: UserRoomEvent) => {
      console.log('👤 Component: Received user joined event:', event);
      console.log('👤 Component: Current room ID:', this.room?._id);
      console.log('👤 Component: Event room ID:', event.roomId);

      if (event.roomId === this.room?._id) {
        console.log('👤 Component: User joined room:', event.username);
        this.snackBar.open(`${event.username} se unió a la sala`, 'Cerrar', { duration: 2000 });
        this.refreshRoomData();
      } else {
        console.log('👤 Component: User joined event ignored - room ID mismatch');
      }
    });

    console.log('👋 Component: Setting up user left subscription...');
    this.webSocketService.userLeft$.subscribe((event: UserRoomEvent) => {
      console.log('👋 Component: Received user left event:', event);
      console.log('👋 Component: Current room ID:', this.room?._id);
      console.log('👋 Component: Event room ID:', event.roomId);

      if (event.roomId === this.room?._id) {
        console.log('👋 Component: User left room:', event.username);
        this.snackBar.open(`${event.username} salió de la sala`, 'Cerrar', { duration: 2000 });
        this.refreshRoomData();
      } else {
        console.log('👋 Component: User left event ignored - room ID mismatch');
      }
    });
  }

  disconnectWebSocket(): void {
    if (this.room && this.webSocketService.isConnected() && !this.isLeaving) {
      console.log('🔌 Disconnecting WebSocket and leaving room:', this.room._id);
      this.webSocketService.leaveRoom(this.room._id);
    } else {
      console.log('🔌 Disconnecting WebSocket (no room, not connected, or already leaving)');
    }
    this.webSocketService.disconnect();
  }

  async startSpeaking(): Promise<void> {
    // Prevent multiple simultaneous calls
    if (this.isSpeaking) {
      console.log('🎤 Already speaking, ignoring start request');
      return;
    }

    try {
      console.log('🎤 Requesting microphone permission...');

      // Auto-activate audio when user starts speaking (user interaction)
      if (!this.audioActivated) {
        console.log('🎵 Auto-activating audio on start speaking...');
        this.activateAudio();
      }

      // Request microphone permission with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('✅ Microphone permission granted, creating MediaRecorder...');

      // Create MediaRecorder with specific MIME type for better compatibility
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        console.log('🎵 MediaRecorder: Data available, size:', event.data.size);
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('🎵 MediaRecorder: Added chunk, total chunks:', this.audioChunks.length);
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log('🎵 MediaRecorder: Stopped, processing audio chunks...');
        console.log('🎵 MediaRecorder: Total chunks:', this.audioChunks.length);

        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        console.log('🎵 MediaRecorder: Created blob, size:', audioBlob.size);

        if (this.room) {
          console.log('🎵 MediaRecorder: Sending audio data to room:', this.room._id);
          this.webSocketService.sendAudioData(this.room._id, audioBlob);
        } else {
          console.error('❌ MediaRecorder: No room available to send audio');
        }

        this.audioChunks = [];
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        this.snackBar.open('Error en la grabación de audio', 'Cerrar', { duration: 3000 });
        this.isSpeaking = false;
      };

      this.mediaRecorder.start(50); // Capture audio every 50ms for better real-time experience
      this.isSpeaking = true;

      if (this.room) {
        console.log('🎤 Emitting start-speaking event...');
        this.webSocketService.startSpeaking(this.room._id);
      }

      console.log('🎤 Speaking started successfully');
    } catch (error: any) {
      console.error('❌ Error accessing microphone:', error);
      this.isSpeaking = false;

      if (error.name === 'NotAllowedError') {
        this.snackBar.open('Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.', 'Cerrar', { duration: 5000 });
      } else if (error.name === 'NotFoundError') {
        this.snackBar.open('No se encontró ningún micrófono. Verifica que tengas un micrófono conectado.', 'Cerrar', { duration: 5000 });
      } else {
        this.snackBar.open(`Error al acceder al micrófono: ${error.message}`, 'Cerrar', { duration: 3000 });
      }
    }
  }

  stopSpeaking(): void {
    if (!this.isSpeaking) {
      console.log('🔇 Not speaking, ignoring stop request');
      return;
    }

    console.log('🔇 Stopping speaking...');

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    this.isSpeaking = false;

    if (this.room) {
      this.webSocketService.stopSpeaking(this.room._id);
    }

    console.log('🔇 Speaking stopped successfully');
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

    leaveRoom(): void {
    if (this.room && !this.isLeaving) {
      this.isLeaving = true; // Prevent multiple leave events

      // First notify WebSocket that we're leaving
      this.webSocketService.leaveRoom(this.room._id);

      // Then call HTTP service to update database
      this.roomsService.leaveRoom(this.room._id).subscribe({
        next: () => {
          this.snackBar.open('Saliste de la sala', 'Cerrar', { duration: 2000 });
          this.router.navigate(['/rooms']);
        },
        error: (error) => {
          console.error('Error leaving room via HTTP:', error);
          // Even if HTTP fails, we still want to navigate away
          this.snackBar.open('Saliste de la sala', 'Cerrar', { duration: 2000 });
          this.router.navigate(['/rooms']);
        }
      });
    }
  }

  isUserInRoom(): boolean {
    if (!this.room || !this.currentUser) return false;
    return this.room.members.some(member => member._id === this.currentUser._id);
  }

  getConnectionStatusColor(): string {
    return this.isConnected ? 'green' : 'red';
  }

  isUserAdmin(member: any): boolean {
    return this.room?.admins.some(admin => admin._id === member._id) || false;
  }

  goBack(): void {
    // Navigate back but keep WebSocket connection active
    // This allows the user to return to the room without rejoining
    console.log('🔙 [Room] User navigating back (keeping WebSocket connection)');
    this.router.navigate(['/rooms']);
  }

  refreshRoomData(): void {
    if (this.room) {
      this.loadRoom(this.room._id);
    }
  }

    private playAudio(audioBlob: Blob, username: string): void {
    try {
      console.log('🎵 Playing audio from:', username);
      console.log('🎵 Audio activated flag:', this.audioActivated);
      console.log('🎵 Audio context state:', this.audioContext?.state);

      // Create audio element
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(audioBlob);

      audio.src = audioUrl;
      audio.volume = 0.8; // Set volume to 80%

      // Add event listeners before playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log('🎵 Audio finished, cleaned up URL');
      };

      audio.onerror = (error) => {
        console.error('❌ Audio element error:', error);
        URL.revokeObjectURL(audioUrl);
      };

      // Check if audio has been activated by user interaction
      if (!this.audioActivated) {
        console.log('🎵 Audio not activated yet, showing activation message...');

        // Show a snackbar message to the user
        this.snackBar.open(
          `Audio recibido de ${username}. Haz clic en "Activar Audio" para escuchar.`,
          'Activar Audio',
          {
            duration: 8000,
            panelClass: ['audio-notification']
          }
        ).onAction().subscribe(() => {
          // User clicked "Activar Audio", activate and try to play
          this.activateAudio();
          setTimeout(() => {
            audio.play().then(() => {
              console.log('🎵 Audio playing successfully after activation');
            }).catch((retryError) => {
              console.error('❌ Still cannot play audio after activation:', retryError);
              URL.revokeObjectURL(audioUrl);
            });
          }, 200);
        });

        // Don't revoke URL yet, keep it for when user activates audio
        return;
      }

      // Audio is activated, try to play
      audio.play().then(() => {
        console.log('🎵 Audio playing successfully');
      }).catch((error) => {
        console.error('❌ Error playing audio:', error);

        // If it's an autoplay policy error, show a message to the user
        if (error.name === 'NotAllowedError') {
          console.log('🎵 Autoplay policy blocked, showing user message...');

          // Show a snackbar message to the user
          this.snackBar.open(
            `Audio recibido de ${username}. Haz clic en "Activar Audio" para escuchar.`,
            'Activar Audio',
            {
              duration: 5000,
              panelClass: ['audio-notification']
            }
          ).onAction().subscribe(() => {
            // User clicked "Activar Audio", try to play again
            this.activateAudio();
            setTimeout(() => {
              audio.play().catch((retryError) => {
                console.error('❌ Still cannot play audio after user interaction:', retryError);
                URL.revokeObjectURL(audioUrl);
              });
            }, 100);
          });

          // Don't revoke URL yet, keep it for when user activates audio
        } else {
          URL.revokeObjectURL(audioUrl);
        }
      });

    } catch (error) {
      console.error('❌ Error creating audio element:', error);
    }
  }

  // Activate audio context (required for autoplay policy)
  activateAudio(): void {
    console.log('🎵 Activating audio...');
    console.log('🎵 Current audio context state:', this.audioContext?.state);
    console.log('🎵 Current audio activated flag:', this.audioActivated);

    // If no audio context exists, create one
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('🎵 Created new audio context, state:', this.audioContext.state);
      } catch (error) {
        console.error('❌ Error creating audio context:', error);
        this.snackBar.open('Error al crear contexto de audio', 'Cerrar', { duration: 3000 });
        return;
      }
    }

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('🎵 Audio context resumed successfully');
        this.audioActivated = true;
        this.snackBar.open('Audio activado correctamente', 'Cerrar', { duration: 2000 });
      }).catch((error) => {
        console.error('❌ Error resuming audio context:', error);
        this.snackBar.open('Error al activar audio', 'Cerrar', { duration: 3000 });
      });
    } else if (this.audioContext.state === 'running') {
      // Audio context is already running
      console.log('🎵 Audio context already running');
      this.audioActivated = true;
      this.snackBar.open('Audio ya está activado', 'Cerrar', { duration: 2000 });
    } else {
      // Audio context is closed, create a new one
      console.log('🎵 Audio context closed, creating new one...');
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.audioActivated = true;
        this.snackBar.open('Audio activado correctamente', 'Cerrar', { duration: 2000 });
      } catch (error) {
        console.error('❌ Error creating new audio context:', error);
        this.snackBar.open('Error al crear contexto de audio', 'Cerrar', { duration: 3000 });
      }
    }
  }

  // Auto-activate audio on user interaction (for Chrome autoplay policy)
  onUserInteraction(): void {
    if (!this.audioActivated) {
      console.log('🎵 User interaction detected, auto-activating audio...');
      this.activateAudio();
    }
  }

  // Test method to generate a test audio
  testAudio(): void {
    console.log('🧪 Testing audio functionality...');

    // Auto-activate audio when user tests audio (user interaction)
    if (!this.audioActivated) {
      console.log('🎵 Auto-activating audio on test audio...');
      this.activateAudio();
    }

    try {
      // Create a simple test audio (1 second beep)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const destination = audioContext.createMediaStreamDestination();

      oscillator.connect(gainNode);
      gainNode.connect(destination);

      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      // Create a MediaRecorder to capture this test audio
      const stream = destination.stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('🧪 Test audio data available, size:', event.data.size);
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        console.log('🧪 Test audio blob created, size:', audioBlob.size);

        if (this.room) {
          console.log('🧪 Sending test audio to room:', this.room._id);
          this.webSocketService.sendAudioData(this.room._id, audioBlob);
        }
      };

      mediaRecorder.start();

      // Start the oscillator
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);

      setTimeout(() => {
        mediaRecorder.stop();
        audioContext.close();
      }, 1100); // Stop after 1.1 seconds to ensure we capture the full audio

    } catch (error) {
      console.error('❌ Error creating test audio:', error);
      this.snackBar.open('Error al crear audio de prueba', 'Cerrar', { duration: 3000 });
    }
  }

  private setupKeyboardListeners(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !this.isSpeaking) {
        event.preventDefault(); // Prevent page scroll
        this.startSpeaking();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space' && this.isSpeaking) {
        event.preventDefault(); // Prevent page scroll
        this.stopSpeaking();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Store references for cleanup
    this.keyboardListeners = { handleKeyDown, handleKeyUp };
  }

  private removeKeyboardListeners(): void {
    if (this.keyboardListeners) {
      document.removeEventListener('keydown', this.keyboardListeners.handleKeyDown);
      document.removeEventListener('keyup', this.keyboardListeners.handleKeyUp);
    }
  }
}
