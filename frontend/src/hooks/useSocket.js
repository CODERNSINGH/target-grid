import { useEffect, useRef } from 'react';
import socketService from '../services/socketService.js';

export const useSocket = () => {
  const socketRef = useRef(socketService);

  useEffect(() => {
    socketRef.current.connect();

    return () => {
      socketRef.current.removeAllListeners();
    };
  }, []);

  return socketRef.current;
};

export const useScoreUpdates = (onScoreUpdate) => {
  const socket = useSocket();

  useEffect(() => {
    if (onScoreUpdate) {
      socket.onScoreUpdate(onScoreUpdate);
    }

    return () => {
      socket.removeAllListeners();
    };
  }, [socket, onScoreUpdate]);
};

export const useLeaderboardUpdates = (onLeaderboardUpdate) => {
  const socket = useSocket();

  useEffect(() => {
    if (onLeaderboardUpdate) {
      socket.onLeaderboardUpdate(onLeaderboardUpdate);
    }

    return () => {
      socket.removeAllListeners();
    };
  }, [socket, onLeaderboardUpdate]);
};