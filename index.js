const app = require("express")();
const http = require("http").Server(app);
const port = process.env.PORT || 3000;
const io = require("socket.io")(http); // zum Starten von Socket.io auf dem Server

const lobbylist = [];

// using express to serve up a static index.html file to the browser whenever it detects a GET request at the root (/), 
// and then telling our server to listen to the port we defined.
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//holen der css vom Client
app.get("/chat.css", function (req, res) {
  res.sendFile(__dirname + "/chat.css");
});

//holen der Javascriptdaten des Clients
app.get("/chat.js", function (req, res) {
  res.sendFile(__dirname + "/chat.js");
});

http.listen(port, function () {
  console.log("Listening on *: " + port);
});

//fügt Listner an jedes Event das ankommenden Sockets hinzu, bzw. wenn das socket verbunden ist sind das die Event die abgehört werden
io.on("connection", function (socket) {

  socket.on("userNames", function (data) {
    console.log(data);
    //Prüfen ob Username bereits vergeben ist
    if (lobbylist.includes(data)) {
      console.log(data);
      lobbylist.push(data); //fügt User in ein Array für die Lobbyliste wird später direkt gelöscht durch das automatische reloaden(user leave) den seite beim client
      console.log(lobbylist);
      socket.emit("change_usernames", data); //Sendet an den Sender zurück
    } else {
      lobbylist.push(data); //fügt User in ein Array für die Lobbyliste
      console.log(lobbylist);
    }
  });

  socket.on("user_join", function (data) {
    this.username = data;
    socket.broadcast.emit("user_join", data); //Event: user_join 1. gesetzt im socket und dann broadcastet zurück zu anderen teilnehmern 
  });

  socket.on("chat_message", function (data) {
    data.username = this.username;
    socket.broadcast.emit("chat_message", data); //fügt den username an und gibt ihn als neue Nachricht zurück
  });


  socket.on("disconnect", function (data) {
    //löschen der Users aus dem Array
    if (lobbylist.includes(this.username)) {
      for (var i = lobbylist.length - 1; i >= 0; i--) {
        if (lobbylist[i] === this.username) {
          lobbylist.splice(i, 1);
          console.log(lobbylist);
          username = this.username;
          socket.broadcast.emit("user_leave", { username, lobbylist }); //gibt zurück wenn jemand den Chat verlässt
          return;
        }
      }
    }
  });

  //Aufbau der Lobbyliste
  socket.on("user_lobby", function (data) {
    this.username = data;
    socket.broadcast.emit("user_lobby", lobbylist); //Event: schickt die lobby an die teilnehmer zurück 
    socket.emit("user_lobby", lobbylist);
  });
});

