import express = require("express");
import http = require("http");
import cors = require("cors");

import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", socket => {
  console.log(`a user connected with id: ${socket.id}`);

  socket.on("join_room", data => {
    socket.join(data);
  });

  socket.on("typing", data => {
    socket.to(data.room).emit("user_typing", data);
  });

  socket.on("stop_typing", data => {
    socket.broadcast.emit("user_stop_typing", data);
  });

  // BROADCAST MESSAGE TO ALL
  // socket.on("send_message", data => {
  //   socket.broadcast.emit("receive_message", data);
  // });

  // SEND MESSAGE TO SPECIFIC ROOM
  socket.on("send_message", data => {
    socket.to(data.room).emit("receive_message", data);
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
