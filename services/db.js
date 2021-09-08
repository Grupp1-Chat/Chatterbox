const path = require("path");
const fs = require("fs");

const roomdb = path.join(__dirname, "rooms.json");
const usersdb = path.join(__dirname, "users.json");

const giphy = path.join(__dirname, "giphy.json");

function readDB(db) {
  try {
    const data = fs.readFileSync(db);
    const result = JSON.parse(data);
    return result.data;
  } catch (ex) {
    console.error(ex);
  }
}

function searchGifs() {
  return readDB(giphy);
}

module.exports = {
  searchGifs,
};

