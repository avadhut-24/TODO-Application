import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { IList } from './models/List.js';

let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  });

  // Store active list rooms
  const activeListRooms = new Map<string, Set<string>>();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join list room
    socket.on('joinList', (listId: string) => {
      socket.join(`list:${listId}`);
      if (!activeListRooms.has(listId)) {
        activeListRooms.set(listId, new Set());
      }
      activeListRooms.get(listId)?.add(socket.id);
      console.log(`Client ${socket.id} joined list room: ${listId}`);
    });

    // Leave list room
    socket.on('leaveList', (listId: string) => {
      socket.leave(`list:${listId}`);
      activeListRooms.get(listId)?.delete(socket.id);
      if (activeListRooms.get(listId)?.size === 0) {
        activeListRooms.delete(listId);
      }
      console.log(`Client ${socket.id} left list room: ${listId}`);
    });

    // Handle list updates
    socket.on('listUpdate', (listId: string, updatedList: IList) => {
      socket.to(`list:${listId}`).emit('listUpdated', updatedList);
      console.log(`List ${listId} updated by ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Clean up rooms
      activeListRooms.forEach((sockets, listId) => {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          activeListRooms.delete(listId);
        }
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}; 