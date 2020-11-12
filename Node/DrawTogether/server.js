var express = require('express');
var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

console.log("My socket server is running");

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', onNewConnection);
//io.sockets.on('connection', newConnection);

function onNewConnection(socket){
    // To embed vars in strings, use backticks. See: https://stackoverflow.com/a/28088965
    console.log(`A user connected with id=${socket.id}. Total num of clients: `, socket.server.engine.clientsCount);
    
    // socket.on('disconnect', onDisconnect);
    socket.on('disconnect', () => {
        console.log(`User disconnected with id=${socket.id}. Total num of clients: `, socket.server.engine.clientsCount);
    });

    socket.on('mouse', (data) => {
        console.log("Received mouse data=", data, "from user=", socket.id);
        socket.broadcast.emit('mouse', data);
    });
}


