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


var aesCrypto = {};

(function (obj) {
  "use strict";

  obj.formatter = {
    prefix: 'AESCryptoV10',
    stringify: function (params) {
      var str = this.prefix;
      str += params.salt.toString();
      str += params.ciphertext.toString();
      return str;
    },
    parse: function (str) {
      var params = CryptoJS.lib.CipherParams.create({}),
        prefixLen = this.prefix.length;

      if (str.indexOf(this.prefix) !== 0) { return params; }

      params.ciphertext = CryptoJS.enc.Hex.parse(str.substring(16 + prefixLen));
      params.salt = CryptoJS.enc.Hex.parse(str.substring(prefixLen, 16 + prefixLen));
      return params;
    }
  };

  obj.encrypt = function (text, password) {
    try {
      return CryptoJS.AES.encrypt(text, password, { format: obj.formatter }).toString();
    } catch (err) { return ''; }
  };

  obj.decrypt = function (text, password) {
    try {
      var decrypted = CryptoJS.AES.decrypt(text, password, { format: obj.formatter });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (err) { return ''; }
  };
}(aesCrypto));



app.use(express.static(publicPath));

// Chatroom

var numUsers = 0;
var numHost =0;
var numAndroid = 0;


var getCode = (code) =>{
  var x = aesCrypto.encrypt(code,'pass');
  return x;
}
var getUserName=(s)=>{
  var x= aesCrypto.decrypt(s,'pass');
  return x;
}

io.on('connection', (socket) => {
    console.log('User Connected!!');
    numUsers++;
    console.log('total User: '+ numUsers);
    socket.on('login',(variable)=>{
      numAndroid++;
      if(numUsers > 2 || numAndroid >1)
      {
        console.log('Server full');
        socket.emit('full');
        socket.disconnect(true);
      }
      else{
        console.log('Android user is: '+getUserName(variable));
        console.log('\n');
        if(getUserName(variable) === 'Reza')
          socket.emit('response',{string:getCode('Server')});
        else
          socket.emit('response',{string:getCode('NoAuth')})
      }
      
    });
    socket.on('host-login',(variable)=>{
      numHost++;
      if(numUsers > 2 || numHost >1)
      {
        console.log('Server full');
        socket.emit('full');
        socket.disconnect(true);
      }
      else{
        console.log('Host user is: '+getUserName(variable));
        console.log('\n');
        if(getUserName(variable) === 'Host')
          socket.emit('response',{string:getCode('Server')});
        else
        {
          socket.emit('response',{string:getCode('NoAuth')});
          numHost--;
        }
          
          
      }

    });
    socket.on('new message',(message)=>{
      console.log(message);
      console.log(aesCrypto.decrypt(message,'pass'));
      socket.broadcast.emit('message',message);
    });
    socket.on('disconnect', () => {
      console.log('User disconnected');
      if(numAndroid>0)
          numAndroid--;
      if(numHost>0)
          numHost--;
      numUsers--;
    });
});

 


server.listen(port,()=>{
    console.log(`Server is runnig on ${port}`);
});

