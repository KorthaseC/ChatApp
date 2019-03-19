const form = document.querySelector("form"); //suche nach dem ersten Element Form
const input = document.querySelector(".input"); //suche nach dem ersten Element input
const messages = document.querySelector(".messages"); //suche nach dem ersten Element messages
let username = prompt("Please enter a username: ", ""); //frage nach dem Usernamen
const lobby = document.querySelector(".lobby");
let time = 0;
const socket = io();

null_user();

//Senden des Username an den Server
socket.emit("userNames", username)

//Prüfen ob Username leer bzw Null ist
function null_user() {
  if (username === null) {
    window.stop();
    location.reload();
  } else {
    if (username.match(/\W\s/)) {
      window.stop();
      alert("Username must contain letter");
      location.reload();
    } else {
      if (username === "") {
        window.stop();
        alert("Username can't be empty");
        location.reload();
      }
    }
  }
}

//Rückgabe des Username wenn der Name bereits vergeben ist 
socket.on("change_usernames", function used(data) {
  if (data === username) {
    window.stop();
    alert("Username is used");
    location.reload();
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();   //verhindern das form ausgeführt wird

  addMessage(username + ": " + input.value); //aufruf der addMessage Funktion

  socket.emit("chat_message", {
    message: input.value      //Senden der Nachricht
  });

  input.value = "";   //zurücksetzen des Wertes für die nächste Nachricht
  return false;
}, false);

socket.on("chat_message", function (data) {
  addMessage(data.username + ": " + data.message); //hinzufügen der Nachricht mit den usernamen und dem Textinhalt
});

socket.on("user_join", function (data) {
  addMessage(data + " just joined the chat!"); //Nachricht welcher user gejoint ist
});

socket.on("user_leave", function (data) {
  addMessage(data.username + " has left the chat."); //Nachricht welcher user geleavt ist

  //Löschen aus der Lobbyliste
  lobbyLoop(data.lobbylist);
});

addMessage("You have joined the chat as '" + username + "' .");
socket.emit("user_join", username); //teilt anderen mit das man gejoint ist

function addMessage(message) {    //erwartet einen String 
  const li = document.createElement("li"); //erstellt ein neues Listen Objekt
  li.innerHTML = message; //nimmt den eigegeben Sting und setzt in in das neue li Objekt
  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);  //scrollen zum ende damit die neuste Nachricht direkt im Blick ist
}

//Lobbyeintrag hinzufügen
function addUser(names) {
  const li = document.createElement("li");
  li.innerHTML = names;
  lobby.appendChild(li);
}

//senden des Usernamen;
socket.emit("user_lobby", username);

//Lobbyliste durchlaufen
function lobbyLoop(data) {
  //Löschen der Lobbyliste vor dem aufbau der neuen (alles leeren im Element "lob")
  document.getElementById('lob').innerHTML = '';

  //einfügen der Lobbyliste vom Server
  for (var i = 0; data.length > i; i++) { //kommt hier nicht rein
    console.log(i);
    console.log(data[i]);
    addUser(data[i]); //user in lobby eintragen
  }
}

//empfangen und einfügen der User in die Lobby
socket.on("user_lobby", function (data) {
  lobbyLoop(data);
});
