import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Manager } from 'socket.io-client';
import { useAuth } from './AuthContext';

const WS_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

type SocketType = ReturnType<typeof Manager.prototype.socket>;

interface SocketContextType {
  socket: SocketType | null;
  joinList: (listId: string) => void;
  leaveList: (listId: string) => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<SocketType | null>(null);
  const socketRef = useRef<SocketType | null>(null);
  const { isAuthenticated, isLoading } = useAuth();

  // Only initialize socket when user is authenticated and not loading
  useEffect(() => {
    // Don't connect if still loading auth state or not authenticated
    if (isLoading || !isAuthenticated) {
      console.log('SocketProvider: Skipping connection - Loading:', isLoading, 'Authenticated:', isAuthenticated);
      return;
    }

    console.log('SocketProvider: Initializing socket connection for authenticated user...');
    const manager = new Manager(WS_URL, {
      autoConnect: true,
      transports: ['websocket'],
      path: '/socket.io'
    });
    const newSocket = manager.socket('/');

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected successfully. ID:', newSocket.id);
      setIsConnected(true);
      
      // Authenticate immediately on connection
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Authenticating socket with token');
        newSocket.emit('authenticate', token);
      }
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    return () => {
      if (newSocket.connected) {
        console.log('Cleaning up socket connection...');
        newSocket.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, isLoading]); // Connect when auth state changes

  const joinList = (listId: string) => {
    if (socket?.connected) {
      console.log('Joining list room:', listId, 'Socket ID:', socket.id);
      socket.emit('joinList', listId);
      
      socket.once('joinedList', (room: string) => {
        console.log('Successfully joined room:', room);
      });
    } else {
      console.warn('Cannot join list room: Socket not connected');
    }
  };

  const leaveList = (listId: string) => {
    if (socket?.connected) {
      console.log('Leaving list room:', listId, 'Socket ID:', socket.id);
      socket.emit('leaveList', listId);
    } else {
      console.warn('Cannot leave list room: Socket not connected');
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinList, leaveList, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};