const server = require('http').createServer();
const io = require('socket.io')(server);
const ip = require('ip');
const { readUserData, writeGame, readUser, writeUser, getNewGameId, readGame } = require('./dbFunctions');
const { debug } = require('console');

console.log("my address: " + ip.address());

io.on('connection', client => {

    var ID = client.id;
    var GameID;
    console.log("connection");
    
    client.on('event', data => { console.log("event"); });
    
    client.on('disconnect', () => { console.log("disconnect"); });

    client.on('logIn', (id) => {
        console.log("logIn");
        client.join(id);
        ID = id;
        var userData = readUserData(id);
        if(userData === undefined){
            debug.log("user not found");
        }
        client.emit('loggedIn', userData);
    });

    client.on('getGame', (id) => {
        console.log("getGame" + id);
        var game = readGame(id);
        console.log(game);
        client.emit('startGame', game);
        client.join(id);
        GameID = id;
    });

    client.on('getUserName', (id) => { 
        console.log("getUserName");
        var user = readUser(id);
        client.emit('getUserName', user.name);
    });

    client.on('setPlayerName', (name) => {
        console.log("setPlayerName");
        var user = readUser(ID);
        user.name = name;
        writeUser(ID, user);
        client.emit('setPlayerName', user.name);
    });

    client.on('submitWord', (game, gameID) => {
        console.log("submitWord");
        writeGame(game, gameId);
        client.broadcast.to(gameID).emit('submitedWord', game);
    });

    client.on('signUp', () => {
        console.log("signUp");
        //asign id to client
        client.emit('signedUp', client.id);

    });

    client.on('createNewGame', (game) => {
        console.log("createNewGame" );
        console.log("new game:");
        console.log(game);
        var gameID = getNewGameId();
        game.id = gameID;
        var name;
        if(game.words == null || game.words.length == 0){
            name = "";
        } else {
            name = game.words[0].word;
        }
        var user = readUser(game.player1);
        var user2 = readUser(game.player2);
        user.games.push({name: name, id: gameID, opponent: game.player2});
        user2.games.push({name: name, id: gameID, opponent: game.player1});
        client.emit('createdNewGame', game);
        console.log(game);
        writeGame(game, game.id);
        writeUser(game.player2, user2);
        writeUser(game.player1, user);
        client.join(gameID);
        GameID = game.id;
    });

    
    client.on('joinRoom', (room) => {
        console.log("joined room " + room);
        client.join(room);
    });

    client.on('leaveRoom', (room) => {
        console.log("left room " + room);
        client.leave(room);
    });
    
    client.on('getNewRoom', (cb) => {
        console.log("getNewRoom");
        cb("this is your room id" + 8888);
    });

    client.on('UpdateGame', (game) => {
       console.log("UpdateGame");
       updatedGame = JSON.parse(game);
       updatedGame.name = updatedGame.words[0].word;
        console.log(updatedGame);
        console.log(updatedGame.id);
        writeGame(updatedGame, updatedGame.id); 
        var gameToSend = readGame(game.id);
        client.to(GameID).emit('UpdatedGame', gameToSend);
    });

});

server.listen(3000); 