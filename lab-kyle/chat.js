'use strict';

const net = require('net');
const server = net.createServer();

let clientPool = [];
let guestNumber = 0;

server.on('connection', (socket) => {
  socket.nickName = `Guest_${guestNumber+=1}`;
  socket.write(`You have joined as ${socket.nickName}.`);

  clientPool.forEach(item => item.write(`${socket.nickName} has entered the room.`));
  clientPool = [...clientPool, socket];

  let handleDisconnect = () => {
    clientPool.forEach(item => item.write(`${socket.nickName} has left the room.`));
    clientPool = clientPool.filter(item => item !== socket);
  };

  socket.on('close', handleDisconnect);
  socket.on('error', handleDisconnect);

  socket.on('data', (buffer) => {
    let data = buffer.toString();

    if(data.startsWith('/nick')) {
      socket.nickName = data.split('/nick ')[1].trim() || socket.nickName;
      socket.write(`You are now known as ${socket.nickName}.`);
      return;
    }

    if(data.startsWith('/dm')) {
      let splitData = data.split(' ');
      if(splitData.length < 1) return socket.write('You must enter a recipient.');
      if(splitData.length < 2) return socket.write('You must write a message.');
      let name = splitData[1].trim();
      let message = splitData.slice(2).reduce((acc, cur) => acc + cur, []);
      let recipient = clientPool.filter((item) => item.nickName === name);
      recipient[0].write(`Direct message from ${socket.nickName}: ${message}`);
      return;
    }

    if(data.startsWith('/troll')) {

    }

    if(data.startsWith('/quit')) {

    }


  });
});