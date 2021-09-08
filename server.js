require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.static(path.join(__dirname, "node_modules", "materialize-css"))
);



// Username of auto-generated messages
const ADMIN = "Admin";

let USERS = []; 
let ROOMS = [
  {
    name: "Public",
    password: "",
    public: true,
    users: [],
  },
  {
    name: "Educational",
    password: "",
    public: true,
    users: [],
  },
  {
    name: "Gaming",
    password: "",
    public: true,
    users: [],
  },
]; 
let MESSAGES = []; 

app.get("/api/rooms", (req, res) => {
  let list = [];
  ROOMS.forEach((element) => {
    list.push({
      name: element.name,
      userCount: element.users.length,
    });
  });
  res.send(list);
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
