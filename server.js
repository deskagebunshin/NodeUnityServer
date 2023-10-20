const server = require('http').createServer();
const io = require('socket.io')(server);

console.log("http://localhost:3000/");

io.on('connection', client => {
    console.log("connection");
    client.on('event', data => { console.log("event"); });
    client.on('disconnect', () => { console.log("disconnect"); });
    client.on('joinRoom', (room) => {
        console.log("joined room " + room);
        client.join(room);
    });
    client.on('getNewRoom', (cb) => {
        console.log("getNewRoom");
        cb("this is your room id" + 8888);
    });

});

server.listen(3000); 