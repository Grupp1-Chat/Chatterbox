// Global requires
require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./services/users");
const formatMessage = require("./services/messages");

// Server requires
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Helper requires
const DB = require("./services/db");
const externalApi = require("./services/external");

app.use(express.json());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.static(path.join(__dirname, "node_modules", "materialize-css"))
);

// Username of auto-generated messages
const admin = "Chat Bot";
const RULES = new Map();

// Api endpoints
app.get("/api/rooms", (req, res) => {
  const ROOMS = DB.getRooms();
  let list = [];
  ROOMS.forEach((element) => {
    list.push({
      name: element.name,
      userCount: element.users.length,
      public: element.public ? true : false,
    });
  });
  res.send(list);
});
app.get("/api/rooms/:name", (req, res) => {
  const ROOMS = DB.getRooms();
  const room = req.params.name;
  const password = req.headers.password;
  const index = ROOMS.findIndex((item) => item.name === room);
  if (ROOMS[index].password === password)
    return res.send({ verified: true, room });
  res.send({ verified: false, room });
});
app.post("/api/rooms", (req, res) => {
  const room = req.body;
  const format = {
    name: room.name,
    password: room.password,
    users: [],
  };
  DB.createRoom(format, (result) => res.send(result));
});

// SocketIO connection
io.on("connection", (socket) => {
  //For room page
  socket.on("refresh", () => {
    socket.join("__refresh_room");
  });

  //
  //
  //
  // When a user joins a room
  socket.on("joinRoom", (user) => {
    const currentUser = { id: socket.id, name: user.username, room: user.room };

    // Saves socket id and username to the USERS collection
    DB.createUser(currentUser);

    // Saves to roomname with user socket id to the ROOM collection
    DB.updateRoomAdd(currentUser);

    // Joins the user to the room
    socket.join(user.room);

    // Displays the previous messages if room has already existed before the user joins
    DB.getMessage(currentUser.room, (result) => {
      result.messages.forEach((element) => {
        socket.emit("message", element);
      });
    });

    // Welcome message
    socket.emit(
      "message",
      formatMessage(
        admin,
        `Welcome <span>${user.username}</span>! Happy chatting!`
      )
    );
    socket.emit(
      "message",
      formatMessage(
        admin,
        `Enter <span>"/"</span> for a list of commands.`
      )
    );

    // Broadcast to other users when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(
          admin,
          `<span>${user.username}</span> has joined the chat`
        )
      );

    // Broadcast configurations to everyone
    const USERS = DB.getUsers();
    const ROOMS = DB.getRooms();
    const roomIndex = ROOMS.findIndex((room) => room.name === user.room);
    let userList = [];
    ROOMS[roomIndex].users.forEach((element) => {
      const index = USERS.findIndex((item) => item.id === element);
      userList.push(USERS[index].name);
    });
    io.to(user.room).emit("configurations", {
      name: user.room,
      users: userList,
    });
    socket.broadcast.to("__refresh_room").emit("refresh");
  });

  //
  //
  //
  // Listen to chat messages
  socket.on("chat-message", (message) => {
    const user = DB.getUser(socket.id);
    const formattedMessage = formatMessage(user.name, message);

    // Sends the message to self and everyone
    DB.createMessage(user.room, formattedMessage, (message) => {
      socket.emit("message", { ...message, username: "You" });
      socket.broadcast.to(user.room).emit("message", message);
    });
  });
  socket.on("typing-start", (id) => {
    const user = DB.getUser(socket.id);
    socket.broadcast.to(user.room).emit("typing-start", id);
  });
  //
  //
  //
  // Listens to command calls
  socket.on("chat-bot-message", (message) => {
    const formattedMessage = formatMessage(admin, message);
    socket.emit("message", formattedMessage);
  });
  socket.on("search-gifs", (query) => {
    externalApi.searchGifs(query, ({ data }) => {
      socket.emit("search-gifs", data);
    });
  });
  socket.on("search-stickers", (query) => {
    externalApi.searchStickers(query, ({ data }) => {
      socket.emit("search-stickers", data);
    });
  });
  socket.on("get-all-emojis", () => {
    externalApi.getAllEmojis((data) => socket.emit("get-all-emojis", data));
  });
  socket.on("search-emojis", (query) => {
    externalApi.searchEmojis(query, (data) =>
      socket.emit("search-emojis", data)
    );
  });
  socket.on("get-room-rules", () => {
    const user = DB.getUser(socket.id);
    const rule = RULES.get(user.room);
    if (!rule) {
      const message = `There are currently no rules for this room. <br>
        Use <span class="orange-text">"/make-rules"</span> to make rules for this rooms.
      `;
      const formattedMessage = formatMessage(admin, message);
      socket.emit("message", formattedMessage);
      return;
    }
    const message =
      `<span class="orange-text">Room Rules:</span><br>-->` +
      rule.join(`<br>-->`);
    const formattedMessage = formatMessage(admin, message);
    socket.emit("message", formattedMessage);
  });
  socket.on("make-room-rules", (query) => {
    const user = DB.getUser(socket.id);
    if (typeof RULES.get(user.room) === "undefined") {
      RULES.set(user.room, [query]);
    } else {
      RULES.get(user.room).push(query);
    }
    const rule = RULES.get(user.room);
    const message =
      `<span class="orange-text">Room Rules:</span><br>-->` +
      rule.join(`<br>-->`);
    const formattedMessage = formatMessage(admin, message);
    socket.emit("message", formattedMessage);
  });
  socket.on("delete-room-rules", () => {
    const user = DB.getUser(socket.id);
    if (typeof RULES.get(user.room) !== "undefined") {
      RULES.delete(user.room);
    }
    const message = `There are currently no rules for this room. <br>
        Use <span class="orange-text">"/make-rules"</span> to make rules for this rooms.
      `;
    const formattedMessage = formatMessage(admin, message);
    socket.emit("message", formattedMessage);
  });

  //
  //
  //
  // When a user leaves a room
  socket.on("disconnect", () => {
    // Removes user to USERS collection
    const user = DB.deleteUser(socket.id);
    if (!user) return;

    DB.updateRoomDelete(user, (room) => {
      if (room.users.length === 0) {
        if (!room.public) {
          DB.deleteRoom(room);
        }
        DB.deleteMessageCollection(room.name);
      }

      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(admin, `${user.name} has left the chat.`)
        );

      // Broadcast configurations to everyone
      let userList = [];
      const USERS = DB.getUsers();
      room.users.forEach((element) => {
        const index = USERS.findIndex((item) => item.id === element);
        userList.push(USERS[index].name);
      });
      io.to(user.room).emit("configurations", {
        name: user.room,
        users: userList,
      });
      socket.broadcast.to("__refresh_room").emit("refresh");
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
