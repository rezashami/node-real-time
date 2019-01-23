
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
var socket = io();
socket.on('connect',()=>{
    console.log('Connected to server');
});
socket.on('response',function(users){
    console.log(users);
});
socket.on('No-rasp',function () {
    console.log('No rasp is here');
});
socket.on('Rasp-disconnected',function () {
    console.log('No rasp is connected');
});

socket.on('Sended-Command',function () {
    console.log('Sended Command successfully');
});

socket.on('NewTemp',function (temp) {
    var x = getDecrypt(temp);
   $("#info").html = x;
});
socket.on('TempError',function (error) {
    var x = getDecrypt(error);
   $("#info").html = x;
});
socket.on('No-Auth',function () {
    console.log('Error in authentiacion');
});
socket.on("welcome-android", function () {
    console.log("welcome");
    $("#searchForm").hide();
    $("#menu").show();
});