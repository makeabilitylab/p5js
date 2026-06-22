//
// SimpleSlider server: a tiny Express + Socket.io relay for a shared slider value.
// It serves the browser client from public/ and relays 'slider' events between all
// connected clients, so moving the slider in one browser moves it in the others
// (and each client can relay that value out to an Arduino over Web Serial).
//
// To run: `node server.js`, then open http://localhost:3000 in two browser tabs.
//

var express = require('express');
var app = express();

// Use the host's PORT env var if set (e.g., on a hosting service), else default to 3000.
const port = process.env.PORT || 3000;
var server = app.listen(port);

app.use(express.static('public'));

console.log("My socket server is running on port", port);

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', onNewConnection);

// Called once per client when they connect. Wires up this client's event handlers.
function onNewConnection(socket){
    // To embed vars in strings, use backticks. See: https://stackoverflow.com/a/28088965
    console.log(`A user connected with id=${socket.id}. Total num of clients: `, socket.server.engine.clientsCount);

    // Fired when this client leaves (closes tab, loses connection, etc.).
    socket.on('disconnect', () => {
        console.log(`User disconnected with id=${socket.id}. Total num of clients: `, socket.server.engine.clientsCount);
    });

    // A client changed the slider. Rebroadcast the value to every *other* client so
    // their slider stays in sync. broadcast.emit excludes the sender.
    socket.on("slider", (data) => {
        console.log(`Received slider data=`, data, "from user=", socket.id);
        socket.broadcast.emit("slider", data);
    });
}


