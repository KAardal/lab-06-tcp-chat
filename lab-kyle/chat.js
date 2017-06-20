'use strict';

const net = require('net');
const server = net.createServer();

let clientPool = [];
let guestNumber = 0;

server.on('connection', (socket) => {

  socket.nickName = `Guest_${guestNumber+=1}`;
  socket.write(`You have joined as ${socket.nickName}.\n`);

  clientPool.forEach(item => item.write(`${socket.nickName} has entered the room.\n`));
  clientPool = [...clientPool, socket];

  let handleDisconnect = () => {

    clientPool = clientPool.filter(item => item !== socket);
    clientPool.forEach(item => item.write(`${socket.nickName} has left the room.\n`));
  };

  socket.on('error', handleDisconnect);
  socket.on('close', handleDisconnect);
  socket.on('data', (buffer) => {

    let data = buffer.toString();

    if(data.startsWith('/nick')) {

      socket.nickName = data.split('/nick ')[1].trim() || socket.nickName;
      socket.write(`You are now known as ${socket.nickName}.\n`);
      return;
    }

    if(data.startsWith('/dm')) {

      let splitData = data.split(' ');

      if(splitData.length < 1) return socket.write('You must enter a recipient.\n');
      if(splitData.length < 2) return socket.write('You must write a message.\n');

      let name = splitData[1].trim();
      let message = splitData.slice(2).reduce((acc, cur) => acc + cur, []);
      let recipient = clientPool.filter((item) => item.nickName === name);

      recipient[0].write(`Direct message from ${socket.nickName}: ${message}`);
      return;
    }

    if(data.startsWith('/troll')) {

      let splitData = data.split(' ');
      let num = parseInt(splitData[1]);

      if(splitData.length < 2 || isNaN(num)) return socket.write('You must enter a number of messages to send.\n');
      if(splitData.length < 3) return socket.write('You must write a message.\n');

      let message = splitData.slice(2).reduce((acc, cur) => acc + cur, []);

      for(let i = 0; i < num; i++) clientPool.forEach((item) => item.write(`${socket.nickName}: ${message}`));
      return;
    }

    if(data.startsWith('/quit')) {

      socket.end('You have left the room.\n');
      return;
    }
  
    clientPool.forEach((item) => item.write(`${socket.nickName}: ${data}`));
  });
});

server.listen(3000, () => {
  
  console.log('server up on port 3000');
});