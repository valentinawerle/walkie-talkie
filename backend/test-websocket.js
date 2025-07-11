const io = require('socket.io-client');

console.log('🔌 Testing WebSocket connection...');

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  forceNew: true
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  console.log('Socket ID:', socket.id);
  
  // Test joining a room
  socket.emit('join-room', { roomId: 'test-room' });
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.error('Error details:', error);
});

socket.on('user-joined-room', (data) => {
  console.log('👤 User joined room event:', data);
});

// Listen for any other events
socket.onAny((eventName, ...args) => {
  console.log(`📡 Received event: ${eventName}`, args);
});

setTimeout(() => {
  console.log('🔄 Disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 5000); 