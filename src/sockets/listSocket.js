const { getIO } = require('../config/socket');

const setupListSockets = () => {
  const io = getIO();

  io.on('connection', (socket) => {
    // Additional socket events can be added here
    
    socket.on('typing', (data) => {
      socket.to(`list-${data.listId}`).emit('user-typing', {
        userId: data.userId,
        userName: data.userName,
      });
    });

    socket.on('stop-typing', (data) => {
      socket.to(`list-${data.listId}`).emit('user-stop-typing', {
        userId: data.userId,
      });
    });
  });
};

module.exports = { setupListSockets };