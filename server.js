const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = {};

io.on('connection', socket => {
  console.log('User connected:', socket.id);
  socket.on('newPlayer', data => {
    players[socket.id] = { ...data, id: socket.id };
    io.emit('players', players);
  });
  socket.on('move', pos => {
    if (players[socket.id]) {
      players[socket.id].x = pos.x;
      players[socket.id].z = pos.z;
      io.emit('players', players);
    }
  });
  socket.on('chat', msg => {
    if (players[socket.id]) {
      io.emit('chat', { nickname: players[socket.id].nickname, message: msg });
    }
  });
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('players', players);
  });
});

http.listen(PORT, () => console.log('Server on', PORT));