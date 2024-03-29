const server = require('http').createServer();
const io = require('socket.io')(server);
const ip = require('ip');
const { readUserData, deletePlayer, writeGame, readUser, writeUser, getNewGameId, readGame } = require('./dbFunctions');
const { debug, Console } = require('console');

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
        console.log("loged in:" + userData.name);
        client.emit('loggedIn', userData);
    });

    client.on('deletePlayerID', () => {
        console.log("deletePlayerID");
        deletePlayer(ID);
    });

    client.on('getGame', (id) => {
        console.log("getting Game: " + id);
        var game = readGame(id);
        console.log(game);
        client.emit('startGame', game);
        client.join(id);
        GameID = id;
    });

    client.on('getUserName', (id) => { 
        var user = readUser(id);
        console.log("gettin User Name: " + user.name);
        client.emit('getUserName', user.name);
    });

    client.on('setPlayerName', (name) => {
        console.log("Setting Player Name to: " + name);
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
        console.log("createing New Game" );

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
        user.games.push({name: name, id: gameID, turn: true, opponent: game.player2});
        user2.games.push({name: name, id: gameID, turn: false, opponent: game.player1});
        client.emit('createdNewGame', game);
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
       if(updatedGame.words != null && updatedGame.words != undefined && updatedGame.words != "" && updatedGame.words[0] != undefined){
            updatedGame.name = updatedGame.words[0].word;
            updatedGame.turn = updatedGame.words.length % 2;
       }
       writeGame(updatedGame, updatedGame.id); 
       var gameToSend = readGame(updatedGame.id);
       client.to(GameID).emit('UpdatedGame', gameToSend);
       var user = readUser(updatedGame.player1);
       var user2 = readUser(updatedGame.player2);
       // update game name on user file
        user.games.forEach(element => {
        if(element.id == updatedGame.id){   
            element.name = updatedGame.name;
            element.turn = updatedGame.turn == 0 ? true : false;
            element.player1Score = updatedGame.player1Score;
            element.player2Score = updatedGame.player2Score;
            element.player1 = true;
            element.iconCubes = updatedGame.iconCubes;
            element.gameOver = updatedGame.gameOver;
            element.resignation = updatedGame.resignation;
            element.gameFinishedBy = updatedGame.gameFinishedBy;

            if(element.gameOver && updatedGame.gameFinishedBy == updatedGame.player1){
                console.log("game over for player 1");
                var index = user.games.indexOf(element);
                user.games.splice(index, 1);
            }
            writeUser(updatedGame.player1, user);
        }});

        console.log("updated game over for player 1" + updatedGame.gameOver);
        console.log("updated game finishedBy" + updatedGame.gameFinishedBy);
        console.log("updated game player1" + updatedGame.player1);
        console.log("updated game player2" + updatedGame.player2);

        user2.games.forEach(element => {
        if(element.id == updatedGame.id){
            element.name = updatedGame.name;
            element.turn = updatedGame.turn == 1 ? true : false;
            element.player1Score = updatedGame.player1Score;
            element.player2Score = updatedGame.player2Score;
            element.player1 = false;
            element.iconCubes = updatedGame.iconCubes;
            element.gameOver = updatedGame.gameOver;
            element.resignation = updatedGame.resignation;
            element.gameFinishedBy = updatedGame.gameFinishedBy;
            if(element.gameOver && updatedGame.gameFinishedBy == updatedGame.player2){
                console.log("game over for player 2");

                var index = user2.games.indexOf(element);
                user2.games.splice(index, 1);
            }
            writeUser(updatedGame.player2, user2);
        }});
    });

});

server.listen(3000); 