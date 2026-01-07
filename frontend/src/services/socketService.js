import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      upgrade: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to score updates
  onScoreUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('score-updated', callback);
    this.listeners.set('score-updated', callback);
  }

  // Subscribe to leaderboard updates
  onLeaderboardUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('leaderboard-updated', callback);
    this.listeners.set('leaderboard-updated', callback);
  }

  // Join a lead-specific room
  joinLead(leadId) {
    if (!this.socket) this.connect();
    this.socket.emit('join-lead', leadId);
  }

  // Leave a lead-specific room
  leaveLead(leadId) {
    if (this.socket) {
      this.socket.emit('leave-lead', leadId);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }
}

export default new SocketService();