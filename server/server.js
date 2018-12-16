const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname,'../public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

// Chatroom

var numUsers = 0;

io.on('connection', (socket) => {
    console.log('User Connected!!');
    socket.on('login',(variable)=>{
      console.log(variable);
      socket.emit('response',{string:"Server!!!!"});
    });
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
});




server.listen(port,()=>{
    console.log(`Server is runnig on ${port}`);
});

