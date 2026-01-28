const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('join-list', (listId) => {
      socket.join(`list-${listId}`);
      console.log(`👤 Socket ${socket.id} joined list-${listId}`);
    });

    socket.on('leave-list', (listId) => {
      socket.leave(`list-${listId}`);
      console.log(`👤 Socket ${socket.id} left list-${listId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO };