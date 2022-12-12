const express = require("express");
require("dotenv").config();
const { success, error } = require("consola");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const http = require("http");
const path = require("path");

const PORT = process.env.APP_PORT || 4000;
const DOMAIN = process.env.APP_DOMAIN;

const bootName = "Hamza Issaoui";

// Initialize the application
const app = express();

//Create Server http
const server = http.createServer(app);
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Run when client connects
io.on("connection", (socket) => {
  //on: methode of run
  //console.log("new WebSocket connection...");

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // emit : vous pouvez emettre des évenements d'un coté et enregistrez des ecouteurs de l'autre
    socket.emit("message", formatMessage(bootName, "Welcome with JobGate"));

    //Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(bootName, `${user.username} has joined the chat`)
      ); // to call clients in the current namespace exept the sender

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage (//reception of message from web)
  socket.on("chatMessage", (msg) => {
    //importer le nom du user avec le message
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg)); // send reception message to main
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(bootName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  }); // evenement "disconnect" est reservé et ne doit pas etre utilisé comme nom d'evenement par votre application
});

// Start listening for the server on PORT
server.listen(PORT, async () => {
  try {
    success({
      message: `Server started on PORT ${PORT} ` + `URL : ${DOMAIN}`,
      badge: true,
    });
  } catch (error) {
    error({
      message: "error with server",
      badge: true,
    });
  }
});
