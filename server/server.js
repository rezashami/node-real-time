/**
 * Require section is here
 */
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
var CryptoJS = require("crypto-js");
/**
 * Soem global variables
 */
const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
/**
 * Some code for use aes enc/dec easier
 */

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

      if (str.indexOf(this.prefix) !== 0) {
        return params;
      }

      params.ciphertext = CryptoJS.enc.Hex.parse(str.substring(16 + prefixLen));
      params.salt = CryptoJS.enc.Hex.parse(str.substring(prefixLen, 16 + prefixLen));
      return params;
    }
  };

  obj.encrypt = function (text, password) {
    try {
      return CryptoJS.AES.encrypt(text, password, {
        format: obj.formatter
      }).toString();
    } catch (err) {
      return '';
    }
  };

  obj.decrypt = function (text, password) {
    try {
      var decrypted = CryptoJS.AES.decrypt(text, password, {
        format: obj.formatter
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      return '';
    }
  };
}(aesCrypto));


// Config path for static usage

app.use(express.static(publicPath));

// Socket variables

var androidSocket = null;
var raspSocket = null;
var isAndroid = false;
var isRasp = false;

/**
 * Method for encrypting string
 * @param code is input of method
 */
var getEncrypt = (code) => {
  var x = aesCrypto.encrypt(code, 'pass');
  return x;
}
/**
 * Mthod for 
 * @param  s is input of method
 */
var getDecrypt = (s) => {
  var x = aesCrypto.decrypt(s, 'pass');
  return x;
}

/**
 * Main section of code
 */
io.on('connection', (socket) => {
  console.log('User Connected!!');
  
  /**
   * This method used for authentecation android user and saved info for other send
   * @param cadrInfo is contain user name and password
   */
  socket.on('android-login', (cadrInfo) => {
    var data = JSON.parse(getDecrypt(cadrInfo));
    var userName = data[0];
    var password = data[1];
    console.log(userName+" and "+password +" asas "+ getDecrypt(cadrInfo));
    if (userName!= "Android" || password != "admin123") {
      console.log('This is not Android');
      socket.emit('No-Auth');
      socket.disconnect();
    } else { 
      console.log('Hello Android!!');
      socket.emit('welcome-android');
      console.log('raspChecek ' + raspSocket != null);
      console.log('IsraspChecek ' + isRasp === true);
      if(raspSocket != null && isRasp == true)
      {
        raspSocket.emit('welcome-rasp');
      }
      androidSocket = socket;
      isAndroid = true;
    }
  });

  /**
   * This method used for authentecation rasp user and saved info for other send
   * @param raspInfo is contain user name and password
   */
  socket.on('rasp-login',(raspInfo)=>{
    var data = JSON.parse(getDecrypt(raspInfo));
    var userName = data.userName;
    var password = data.password;
    if (userName != "Rasp" || password != "admin123") {
      console.log('This is not rasp');
      socket.emit('No-Auth');
      socket.disconnect();
    } else { 
      console.log('Hello Rasp!!!');
      socket.emit('welcome-rasp');
      if(androidSocket != null && isAndroid == true)
      {
        androidSocket.emit('welcome-android');
      }
      raspSocket = socket;
      isRasp = true;
    }
  });

  /**
   * This method is used for getting command from android user and send it to rasp user
   * @param command is represent a command that send to rasp
   */
  socket.on('send-command', (command) => {
    var trueCommand = getDecrypt(command);
    console.log(trueCommand);
    if(raspSocket == null)
    {
      socket.emit('No-rasp');
    }
    else if(isRasp == false)
    {
      socket.emit('Rasp-disconnected');
    }
    else{
      raspSocket.emit('NewCommand',command);
      socket.emit('Sended-Command');
    }
    
  });

  /**
   * This method using for getting tempratuer infromation
   * @param tempObj is an object encrypted by aes, and contain temp and hit
   */
  socket.on('temp',(tempObj)=>{
    var treuTempObj = getDecrypt(tempObj);
    console.log(JSON.stringify(treuTempObj));
    if(androidSocket == null)
    {
      socket.emit('No-android');
    }
    else if(isAndroid == false)
    {
      socket.emit('Android-disconnected');
    }
    else{
      androidSocket.emit('NewTemp',tempObj);
      socket.emit('Sended-temp');
    }
  });
  socket.on('error-temp',(err)=>{
    const data = getDecrypt(err);
    var objs = JSON.parse(data);
    console.log(objs);
    if(androidSocket == null)
    {
      socket.emit('No-android');
    }
    else if(isAndroid == false)
    {
      socket.emit('Android-disconnected');
    }
    else{
      androidSocket.emit('TempError',err);
      socket.emit('Sended-error');
    }
  });

  /**
   * This method used when socket is disconnected
   */
  socket.on('disconnect', () => {
    if(isAndroid)
    {
      console.log('Android left');
      isAndroid = false;
      androidSocket = null;
    }
    else if(isRasp)
    {
      console.log('Rasp left');
      isRasp = false;
      raspSocket = null;
    }
  });
});

/**
 * Starting server on port variable
 */
server.listen(port, () => {
  console.log(`Server is runnig on ${port}`);
});