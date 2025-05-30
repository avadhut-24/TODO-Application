import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import socketIOClient from 'socket.io-client';
import type { ListResponse } from '../types/list';

const WS_URL = 'http://localhost:5000';

export const useSocket = (listId: string) => {
  const socketRef = useRef<typeof Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = socketIOClient(WS_URL);

    // Join list room
    socketRef.current.emit('joinList', listId);

    // Listen for list updates
    socketRef.current.on('listUpdated', (updatedList: ListResponse) => {
      // Handle list update (e.g., update local state)
      console.log('List updated:', updatedList);
    });

    return () => {
      // Leave list room and disconnect
      socketRef.current?.emit('leaveList', listId);
      socketRef.current?.disconnect();
    };
  }, [listId]);

  return socketRef.current;
}; 