const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
var CryptoJS = require("crypto-js");

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname,'../public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);


var salt = CryptoJS.enc.Utf8.parse("iasbs.ac.ir");
var password = "134";
var keyBits = CryptoJS.PBKDF2(password, salt, {hasher: CryptoJS.algo.SHA1,keySize: 8,iterations: 2048});

var iv = CryptoJS.enc.Base64.parse("Q9AnLe2Yl4l4/8P/zn4YyQ==");

app.use(express.static(publicPath));

// Chatroom

var numUsers = 0;


var getServerCode = () =>{
   
  var x = CryptoJS.AES.encrypt('The Server is RUnniNg',keyBits,{
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return x.toString();
}

io.on('connection', (socket) => {
    console.log('User Connected!!');
    numUsers++;
    socket.on('login',(variable)=>{
      if(numUsers > 1)
      {
        console.log('Server full');
        socket.emit('full');
        socket.disconnect(true);
      }
      else{
        console.log(variable);
        socket.emit('response',{string:getServerCode()});
      }
      
    });
    socket.on('disconnect', () => {
      console.log('User disconnected');
      numUsers--;
    });
});

 


server.listen(port,()=>{
    console.log(`Server is runnig on ${port}`);
});

