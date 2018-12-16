var socket = io();
socket.on('connect',()=>{
    console.log('Connected to server');
});
socket.on('login',function(users){
    console.log(users);
});

socket.on('new message',function(message){
    console.log(message);
});
socket.on('disconnect',()=>{console.log('Disconnected form server');});