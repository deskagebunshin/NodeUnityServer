const fs = require('fs');

function writeGame(game, gameName = "game.json"){
    if(!game) {
        console.log("no game");
        return;
    }
    try {
        gameName = "Games/" + gameName + ".json";
        fs.writeFileSync(gameName, JSON.stringify(game));
        console.log("save succeded: " + e);

    } catch(e) {
        console.log("save failed: " + e);
    }
}



function readUserData(id){

    data = readUser(id);

    var users = fs.readdirSync("Users");
    for(var i = 0; i < users.length; i++){
        users[i] = users[i].replace(".json", "");
    }
    users.splice(users.indexOf(id), 1);

    var friends = [];
    for(var i = 0; i < users.length; i++){
        var friendData = readUser(users[i]);
        var friend = {name: friendData.name, id: users[i]};
        if(friend.name == null || friend.name == undefined || friend.name == "" || friend.name == "new user"){
            continue;
        }
        friends.push(friend);
    }

    data.friends = friends;
    return data;
}

function readUser(id){
    if(!id) {
        console.log("id missing");
        return;
    }
    if(!fs.existsSync("Users/"+id+".json")){
        console.log("user not found");
        var newUser = {name: "new user", id:id, games: []};
        writeUser(id, newUser);
        return newUser;
    }
    let db = fs.readFileSync("Users/"+id+".json");

    var data = JSON.parse(db);
   
    return data;
}

function writeUser(id, data){
    if(!data || !id) {
        console.log("data or id missing");
        return;
    }
    try {
        fs.writeFileSync("Users/"+id+".json", JSON.stringify(data));
        console.log("save succeded: " + e);

    } catch(e) {
        console.log("save failed: " + e);
    }

}

function openGames (){
    let games = fs.readFileSync("Games/openGames.json");
    return games;
}
 
function addGameToOpenGames(gameID){
    let games = openGames();
    games.push(gameID);
    fs.writeFileSync("Games/openGames.json", JSON.stringify(games));
}

function removeGameFromOpenGames(gameID){
    let games = openGames();
    games.splice(games.indexOf(gameID), 1);
    fs.writeFileSync("Games/openGames.json", JSON.stringify(games));
}

function getNewGameId(){
    if(!fs.existsSync("Games/gameID.json")){
        fs.writeFileSync("Games/gameID.json", JSON.stringify({id: 0}));
    }

    let id = fs.readFileSync("Games/gameID.json");
    id = JSON.parse(id);
    id.id++;
    fs.writeFileSync("Games/gameID.json", JSON.stringify(id));
    return "xxx"+id.id;
}

function readGame(id){

    if(!fs.existsSync("Games/"+id+".json")){
        console.log("game not found");
        return;
    }
    let db = fs.readFileSync("Games/"+id+".json");

    var data = JSON.parse(db);
   
    return data;
}

module.exports = {readUserData, writeGame, readUser, writeUser, addGameToOpenGames, removeGameFromOpenGames, getNewGameId, readGame};