require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./services/users")
const formatMessage = require("./services/messages")

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
let users=[]
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
// Get all rooms
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

//Get specfic room from array
app.get("/api/rooms/:room", (req, res) =>{
  const room = req.params.room
  let foundRoom = ROOMS.find(({name})=>name === req.params.room)
  res.send(foundRoom)
})
// Post rooms to array
app.post("/api/rooms", (req, res)=>{
    const room =  req.body
    
})

const admin = "ChatBot"
//On connection
io.on("connection", socket =>{
  socket.on("joinRoom", ({username, room})=>{
      const user=userJoin(socket.id, username, room)
      console.log("user i connect " + user.username)
      socket.join(user.room);
      USERS.push(socket.id, user.room, user.id)
      console.log(USERS)  
      //welcome
      socket.emit('message', formatMessage(admin, "welcome to chat"))
  
      //Connected
      socket.broadcast.to(user.room).emit('message', formatMessage(admin, ` ${user.username} joined the chat`))
      //Send users and room info
      io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room)
      
      })
  })

  
  //Listen for message
  socket.on('chat-message', (msg)=>{
      const user = getCurrentUser(socket.id)
      console.log("message: "+ msg)
      io.to(user.room).emit('message', formatMessage(user.username,  msg))
  })
  
  //Disconnedcted
  socket.on("disconnect", () =>{
      const user= userLeave(socket.id)
      console.log(user)
      if (user){

          io.to(user.room).emit('message', formatMessage(admin,  `${user.username} has left the chat`)) 
          //Send users and room info
          io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room)
          })
      }
  })
})
      

// io.on("connection", (socket) => {
//   socket.on("refresh", () => {
//     socket.join("__refresh_room");
//   });

//   // Welcome message
//   socket.emit(
//     "message",
//     messageFormat(ADMIN, `Welcome ${user.username}! Happy chatting!`)
//   );
// })


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
