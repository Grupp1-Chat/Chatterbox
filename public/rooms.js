// Redirect to index when username does not exist in the session storage
if (!window.sessionStorage.getItem("username")) window.location.href = "/";

const roomDisplay = document.getElementById("rooms-collection-display");
const createRoomName = document.getElementById("create-room-name");
const createRoomPassword = document.getElementById("create-room-password");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomPassword = document.getElementById("join-room-password");
const joinRoomBtn = document.getElementById("join-room-btn");

const socket = io();

// Sends a request to refresh the contents of the page
// It does so to dynamically update user numbers in the rooms
socket.emit("refresh");

// Responds to refresh the contents of the page
socket.on("refresh", (m) => {
  fetch("/api/rooms")
    .then((response) => response.json())
    .then((list) => {
      roomDisplay.innerHTML = "";
      list.forEach((element) => outputRoom(element));
    });
});

// Initializes the contents of the page
document.addEventListener("DOMContentLoaded", function () {
  const elems = document.querySelectorAll(".modal");
  M.Modal.init(elems);
  fetch("/api/rooms")
    .then((response) => response.json())
    .then((list) => {
      roomDisplay.innerHTML = "";
      list.forEach((element) => outputRoom(element));
    });
  // document.getElementById("room-username-display").innerHTML =
  //   window.sessionStorage.getItem("username");
});

// Creating a room
createRoomBtn.onclick = () => {
  // Store the room name and password
  const data = {
    name: createRoomName.value,
    password: createRoomPassword.value,
  };
  // Make a post method to make the server create a room with the data
  fetch("/api/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      createRoomName.value = "";
      createRoomPassword.value = "";
      // Saves the room to session storage
      // The session storage serves as a passport for the user
      window.sessionStorage.setItem("room", data.name);
      window.location.href = "/chat.html";
    });
};

// Joins a room
joinRoomBtn.onclick = () => {
  // The join room button has a name of the room
  const room = joinRoomBtn.attributes.name.value;
  // Grabs the password from the input field
  const password = joinRoomPassword.value;
  joinRoomPassword.value = "";
  joinRoomBtn.setAttribute("name", "");
  document.getElementById("modal-room-name").innerText = "";

  // Do a get method with the room name and the password
  fetch(`/api/rooms/${room}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      password,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // If verification is unsuccessful, stop the process

      if (!data.verified) {

        return alert("Wrong room password!");
      }else{ 
        // If verification is successful, sets the session storage and redirect to chat
        window.sessionStorage.setItem("room", data.room);
        window.location.href = "/chat.html";
      }
    });
};

// Load Roomlist to DOM
function outputRoom(item) {
  const li = document.createElement("li");
  li.setAttribute("class", "collection-item avatar");
  li.innerHTML = `
    <i class="user circle icon ${item.public ? "green" : "red"}"></i>
    <span class="title">${item.name}</span>
    <p>${item.userCount} online users</p>
    <button
        id="${item.name}"
        onclick="${
          item.public ? `joinPublicRoom(this)` : "joinRoomClick(this)"
        }"
        ${item.public ? "" : `data-target="modal-join"`}
        class="
        secondary-content
        btn
        ${item.public ? "" : `modal-trigger`}
      ui button positive
        "
    >
        Join Room
    </button>
  `;
  roomDisplay.appendChild(li);
}

function joinRoomClick(e) {
  joinRoomBtn.setAttribute("name", e.id);
  document.getElementById("modal-room-name").innerText = e.id;
}

function joinPublicRoom(e) {
  window.sessionStorage.setItem("room", e.id);
  window.location.href = "/chat.html";
}
