var express = require('express');
var app = express();

const port = process.env.PORT || 3000;
var server = app.listen(port);

app.use(express.static('public'));

console.log("My socket server is running on port", port);

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', onNewConnection);

function onNewConnection(socket){
    // To embed vars in strings, use backticks. See: https://stackoverflow.com/a/28088965
    console.log(`A user connected with id=${socket.id}. Total num of clients: `, socket.server.engine.clientsCount);
    
    socket.on('disconnect', () => {
        console.log(`User disconnected with id=${socket.id}. Total num of clients: `, socket.server.engine.clientsCount);
    });

    socket.on("slider", (data) => {
        console.log(`Received slider data=`, data, "from user=", socket.id);
        socket.broadcast.emit("slider", data);
    });
}


