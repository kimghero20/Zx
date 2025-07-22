const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('newPlayer', (data) => {
    players[socket.id] = { ...data, id: socket.id };
    io.emit('players', players);
  });

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].position = data;
      io.emit('players', players);
    }
  });

  socket.on('chat', (message) => {
    io.emit('chat', { id: socket.id, message });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
    io.emit('players', players);
  });
});

http.listen(PORT, () => {
  console.log('Server started on port', PORT);
});