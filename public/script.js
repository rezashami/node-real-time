var socket = io();
socket.on('connect',()=>{
    console.log('Connected to server');
});
socket.on('response',function(users){
    console.log(users);
});