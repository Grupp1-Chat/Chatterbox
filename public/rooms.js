if (!window.sessionStorage.getItem("username")) window.location.href = "/";

const roomDisplay = document.getElementById("rooms-collection-display");
const createRoomName = document.getElementById("create-room-name");
const createRoomPassword = document.getElementById("create-room-password");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomPassword = document.getElementById("join-room-password");
const joinRoomBtn = document.getElementById("join-room-btn");

const socket = io();

socket.emit("refresh");
socket.on("refresh", (m) => {
  fetch("/api/rooms")
    .then((response) => response.json())
    .then((list) => {
      roomDisplay.innerHTML = "";
      list.forEach((element) => outputRoom(element));
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const elems = document.querySelectorAll(".modal");
  M.Modal.init(elems);
  fetch("/api/rooms")
    .then((response) => response.json())
    .then((list) => {
      roomDisplay.innerHTML = "";
      list.forEach((element) => outputRoom(element));
    });
});

createRoomBtn.onclick = () => {
  const data = {
    name: createRoomName.value,
    password: createRoomPassword.value,
  };
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
      window.sessionStorage.setItem("room", data.name);
      window.location.href = "/chat.html";
    });
};

joinRoomBtn.onclick = () => {
  const room = joinRoomBtn.attributes.name.value;
  const password = joinRoomPassword.value;
  joinRoomPassword.value = "";
  joinRoomBtn.setAttribute("name", "");
  document.getElementById("modal-room-name").innerText = "";

  fetch(`/api/rooms/${room}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      password,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.verified) return alert("Wrong room password!");
      window.sessionStorage.setItem("room", data.room);
      window.location.href = "/chat.html";
    });
};

// Load Roomlist to DOM
function outputRoom(item) {
  const li = document.createElement("li");
  li.setAttribute("class", "collection-item avatar");
  li.innerHTML = `
  <i class="user circle icon ${item.public ? "green" : "red"}">
</i>
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
        Join Group
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
