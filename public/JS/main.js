const socket = io();
const chatform = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true, // option consiste a ignorer le point d'interrogation principale
});
//console.log(username, room)

// join chatroom
socket.emit("joinRoom", {
  username,
  room,
});

socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
  // chatMessages.scrollLeft = chatMessages.scrollWidth;
});

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room); //pour afficher le nom du room
  outputUsers(users); //pour afficher liste des users
});

// Message submit
chatform.addEventListener("submit", (e) => {
  e.preventDefault();

  //Get message text
  const msg = e.target.elements.msg.value;
  //console.log(msg);
  //msg = msg.trim();

  if (!msg) {
    return false;
  }

  //Emit message to server (send)
  socket.emit("chatMessage", msg);

  //Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username}<span> ${message.time} </span></p><p class="text">${message.text}</p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const liste = document.createElement('li');
    liste.innerText = user.username;
    userList.appendChild(liste); 
  });
}

// Prompt (affichage mini fenetre) the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure to leave the chat room ?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {

  }
});