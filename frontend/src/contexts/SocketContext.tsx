import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Socket, io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
  joinList: (listId: string) => void;
  leaveList: (listId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('Initializing socket connection...');
    // Initialize socket connection when the app starts
    const newSocket = io(WS_URL, {
      withCredentials: true,
      autoConnect: true
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected successfully. ID:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
    });

    return () => {
      if (newSocket.connected) {
        console.log('Cleaning up socket connection...');
        newSocket.disconnect();
      }
    };
  }, []);

  const joinList = (listId: string) => {
    if (socket?.connected) {
      console.log('Joining list room:', listId, 'Socket ID:', socket.id);
      socket.emit('joinList', listId);
      
      // Add listener for join confirmation
      socket.once('joinedList', (room) => {
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
    <SocketContext.Provider value={{ socket, joinList, leaveList }}>
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