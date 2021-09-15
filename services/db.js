const path = require("path");
const fs = require("fs");

const roomdb = path.join(__dirname, "rooms.json");
const usersdb = path.join(__dirname, "users.json");
const messagesdb = path.join(__dirname, "messages.json");

function getdbs() {
  return {
    room: roomdb,
    user: usersdb,
    msg: messagesdb,
  };
}

function readDB(db) {
  try {
    const data = fs.readFileSync(db);
    const result = JSON.parse(data);
    return result;
  } catch (ex) {
    console.error(ex);
  }
}

function writeDB(db, data) {
  try {
    fs.writeFileSync(db, JSON.stringify(data));
    return data;
  } catch (ex) {
    console.error(ex);
  }
}

// function writeDB

function getRooms() {
  return readDB(roomdb);
}
function createRoom(room, callback) {
  const ROOMS = getRooms();
  ROOMS.push(room);
  writeDB(roomdb, ROOMS);
  callback(room);
}
function deleteRoom(room) {
  const ROOMS = getRooms();
  const index = ROOMS.findIndex((item) => item.name === room.name);
  ROOMS.splice(index, 1);
  writeDB(roomdb, ROOMS);
}
function updateRoomAdd(data) {
  const ROOMS = getRooms();
  let index = ROOMS.findIndex((room) => room.name === data.room);
  ROOMS[index].users.push(data.id);
  writeDB(roomdb, ROOMS);
}
function updateRoomDelete(data, callback) {
  const ROOMS = getRooms();
  const roomIndex = ROOMS.findIndex((room) => room.name === data.room);
  console.log("rooms: " + ROOMS +" index: "+ roomIndex)
  if (roomIndex !== -1){

    const userIndex = ROOMS[roomIndex].users.findIndex(
      (user) => user === data.id
    );
    ROOMS[roomIndex].users.splice(userIndex, 1);
    writeDB(roomdb, ROOMS);
    callback(ROOMS[roomIndex]);
  }
}

function getUsers() {
  return readDB(usersdb);
}
function createUser(user) {
  const USERS = getUsers();
  USERS.push(user);
  writeDB(usersdb, USERS);
}
function deleteUser(id) {
  const USERS = getUsers();
  const index = USERS.findIndex((item) => item.id === id);
  if (index === -1) return false;
  const user = USERS.splice(index, 1)[0];
  writeDB(usersdb, USERS);
  return user;
}
function getUser(id) {
  const USERS = getUsers();
  const index = USERS.findIndex((item) => item.id === id);
  const user = USERS[index];
  return user;
}

function getMessages() {
  return readDB(messagesdb);
}
function createMessage(room, message, callback) {
  const MESSAGES = getMessages();
  const index = MESSAGES.findIndex((item) => item.room === room);
  if (index === -1) {
    MESSAGES.push({
      room: room,
      messages: [message],
    });
  } else {
    MESSAGES[index].messages.push(message);
  }
  writeDB(messagesdb, MESSAGES);
  callback(message);
}
function deleteMessageCollection(room) {
  const MESSAGES = getMessages();
  const index = MESSAGES.findIndex((item) => item.room === room);
  MESSAGES.splice(index, 1);
  writeDB(messagesdb, MESSAGES);
}
function getMessage(room, callback) {
  const MESSAGES = getMessages();
  const index = MESSAGES.findIndex((item) => item.room === room);
  if (index !== -1) {
    const message = MESSAGES[index];
    callback(message);
  }
}

module.exports = {
  getRooms,
  createRoom,
  updateRoomDelete,
  updateRoomAdd,
  deleteRoom,
  getUsers,
  createUser,
  deleteUser,
  getUser,
  getMessages,
  createMessage,
  getMessage,
  deleteMessageCollection,
  getdbs,
  writeDB,
};
