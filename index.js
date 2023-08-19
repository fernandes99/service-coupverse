const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let users = [];

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("connect_room", (data) => {
    users = users.filter((user) => user.id !== socket.id);
    users = [
      ...users,
      {
        id: socket.id,
        roomId: data.roomId,
        userName: data.userName,
        ready: false,
      },
    ];

    socket.join(data.roomId);
    socket.data.roomId = data.roomId;
    io.in(data.roomId).emit("user_connected_room", users);
  });

  socket.on("leave_room", (data) => {});

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    users = users.filter((user) => user.id !== socket.id);

    io.in(roomId).emit("update_users", users);
  });

  socket.on("on_user_ready", (data, isReady) => {
    users = users.map((user) => {
      if (user.id === data.id) {
        return {
          ...user,
          ready: isReady,
        };
      }

      return user;
    });

    io.in(data.roomId).emit("update_users", users);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING ON PORT 3001");
});
