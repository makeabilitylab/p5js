//
// RemoteHandWave server: a tiny Express + Socket.io relay for remote hand-waving.
// It serves the browser client from public/ and relays 'handwave' events (detected
// by ml5 handpose on each client) between all connected clients, so one person's
// wave appears on everyone else's screen.
//
// To run: `node server.js`, then open http://localhost:3000 in two browser tabs.
//

var express = require('express');
var app = express();

// Use the host's PORT env var if set (e.g., on a hosting service), else default to 3000.
// See: https://www.twilio.com/blog/working-with-environment-variables-in-node-js-html
// https://www.freecodecamp.org/news/how-to-deploy-a-nodejs-app-to-heroku-from-github-without-installing-heroku-on-your-machine-433bec770efe/
const port = process.env.PORT || 3000;
var server = app.listen(port);

app.use(express.static('public'));

console.log("My socket server is running on port", port);

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', onNewConnection);
//io.sockets.on('connection', newConnection);

// Called once per client when they connect. Wires up this client's event handlers.
function onNewConnection(socket){
    // To embed vars in strings, use backticks. See: https://stackoverflow.com/a/28088965
    console.log(`A user connected with id=${socket.id}. Total num of clients: `, socket.server.engine.clientsCount);
    
    // Fired when this client leaves (closes tab, loses connection, etc.).
    // socket.on('disconnect', onDisconnect);
    socket.on('disconnect', () => {
        console.log(`User disconnected with id=${socket.id}. Total num of clients: `, socket.server.engine.clientsCount);
    });

    // A client detected a hand-wave (bounding box, landmarks, wave angle). Rebroadcast
    // to every *other* client so they can render the remote hand. broadcast.emit
    // excludes the sender.
    socket.on("handwave", (data) => {
        console.log(`Received handwave data=`, data, "from user=", socket.id);
        socket.broadcast.emit("handwave", data);
    });
}


