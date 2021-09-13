// Get elements in DOM
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const chatInput = document.getElementById("msg");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const graphics = document.getElementById("graphics-container");

// Initialize socket for client
const socket = io();

// Displays the username to the DOM
document.getElementById("chat-room-uname-display").innerText =
  window.sessionStorage.getItem("username");

// Once a user enters chat.html, user sends its credentials to be recorded by the server
socket.emit("joinRoom", {
  username: window.sessionStorage.getItem("username"),
  room: window.sessionStorage.getItem("room"),
});

// An event to output every messages received to the chatbox
socket.on("message", (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Configure room and users to DOM
socket.on("configurations", ({ name, users }) => {
  roomName.innerText = name;

  userList.innerHTML = "";
  users.forEach((user) => {
    // <span class="orange-text"><i> is Typing...</i></span>
    userList.innerHTML += `<li id="user-list-${user}" style="font-weight:bold;">${user}</li>`;
  });
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  // Cancel operation if the user sends null
  if (!msg) {
    return false;
  }

  // Checks if message is a command query
  if (msg === "/") {
    const commands = `
      <span class="ui green ribbon label"> /gifs</span> <span class="blue-text">[your search keyword here]</span> <br>
        - Gives you a list of gifs. <br>
      <span class="ui green ribbon label">/stickers</span> <span class="blue-text">[your search keyword here]</span> <br>
      - Gives you a list of stickers. <br>
      <span class="ui green ribbon label">/emojis</span> <br>
      - Gives you a list of emojis. <br>
      <span class="ui green ribbon label">/emojis</span> <span class="blue-text">[your search keyword here]</span> <br>
      - Search a list of emojis with your keyword. <br>
      <span class="ui green ribbon label">/rules</span> <br>
      - Display the rules of the room. <br>
      <span class="ui green ribbon label">/make-rules</span> <span class="blue-text">[your rule here]</span> <br>
      - Add a rule to the room's rule list. <br>
      <span class="ui green ribbon label">/reset-rules</span> <br>
      - Deletes all rules of the room. <br>
    `;

    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
    // Sends a list of commands and return
    return socket.emit("chat-bot-message", commands);
  }

  // Checks for commands by the user
  if (msg.startsWith("/")) {
    const msgArr = msg.split(" ");
    const cmd = msgArr.shift();
    const query = msgArr.join(" ").trim();
    e.target.elements.msg.value = "";
    if (cmd === "/gifs") {
      graphics.classList.remove("no-display");
      loadContents();
      if (query === "") return noResult();
      socket.emit("search-gifs", query);
      return;
    } else if (cmd === "/stickers") {
      graphics.classList.remove("no-display");
      loadContents();
      if (query === "") return noResult();
      socket.emit("search-stickers", query);
      return;
    } else if (cmd === "/emojis") {
      graphics.classList.remove("no-display");
      loadContents();
      if (query === "") return socket.emit("get-all-emojis");
      socket.emit("search-emojis", query);
      return;
    } else if (cmd === "/rules") {
      if (query !== "")
        return socket.emit(
          "chat-bot-message",
          `<span class="red-text">Error:</span> Command <span class="orange-text">"${cmd}"</span> should not have queries.`
        );
      return socket.emit("get-room-rules", query);
    } else if (cmd === "/make-rules") {
      if (query === "")
        return socket.emit(
          "chat-bot-message",
          `<span class="red-text">Error:</span> Command <span class="orange-text">"${cmd}"</span> should have a query.`
        );
      return socket.emit("make-room-rules", query);
    } else if (cmd === "/reset-rules") {
      if (query !== "")
        return socket.emit(
          "chat-bot-message",
          `<span class="red-text">Error:</span> Command <span class="orange-text">"${cmd}"</span> should not have queries.`
        );
      return socket.emit("delete-room-rules", query);
    } else {
      return socket.emit(
        "chat-bot-message",
        `<span class="red-text">Error:</span> Command <span class="orange-text">"${cmd}"</span> not found.`
      );
    }
  }

  // Emit message to server
  socket.emit("chat-message", msg);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Display the list of searched gifs
socket.on("search-gifs", ({ data }) => {
  graphics.innerHTML = "";
  if (data.length > 0) {
    data.forEach((item) => outputGifs(item));
    return;
  }
  noResult();
});

// Display the list of searched stickers
socket.on("search-stickers", (data) => {
  graphics.innerHTML = "";
  if (data.length > 0) {
    data.forEach((item) => outputStickers(item));
    return;
  }
  noResult();
});

// Display the list of all emojis
socket.on("get-all-emojis", (data) => {
  if (!data) return noResult();
  graphics.innerHTML = "";
  data.forEach((item) => {
    graphics.innerHTML += `<a onclick="displayEmoji(this)" class="btn-flat" id="${item.character}">${item.character}</a>`;
  });
});

// Display the list of searched emojis
socket.on("search-emojis", (data) => {
  if (!data) return noResult();
  graphics.innerHTML = "";
  data.forEach((item) => {
    graphics.innerHTML += `<a onclick="displayEmoji(this)" class="btn-flat" id="${item.character}">${item.character}</a>`;
  });
});

// Outputs emoji to chat box
function displayEmoji(e) {
  chatInput.value += e.id;
}

// Manage the graphics div
document.addEventListener("click", (e) => {
  if (graphics !== e.target && !graphics.contains(e.target)) {
    graphics.classList.add("no-display");
    graphics.innerHTML = "";
  }
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  message.username === "You"
    ? div.setAttribute("class", "ui positive message")
    : div.setAttribute("class", "ui info message");
  const p = document.createElement("p");
  message.username === "You"
    ? p.setAttribute("class", "ui red horizontal label")
    : p.setAttribute("class", "ui blue horizontal label");
  p.innerText = message.username;
  p.innerHTML += `<span class="${
    message.username === "You" ? "orange-text" : "teal-text text-lighten-2"
  }"> at ${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerHTML = message.content;
  div.appendChild(para);
  document.querySelector(".chat-messages").appendChild(div);
}

// Output Gifs to Dom
function outputGifs(gif) {
  const img = document.createElement("img");
  img.src = gif.images.downsized.url;
  img.setAttribute("alt", gif.title);
  img.setAttribute("class", "graphics-container-item");
  img.onclick = () => {
    const message = `<img src="${gif.images.downsized.url}" alt="${gif.title}" class="graphics-container-item" />`;
    socket.emit("chat-message", message);
    graphics.classList.add("no-display");
    graphics.innerHTML = "";
  };
  graphics.appendChild(img);
}

// Output Stickers to DOM
function outputStickers(sticker) {
  graphics.innerHTML += `<img src="${sticker.images.fixed_height_downsampled.url}" onclick="useSticker(this)" class="graphics-container-item" />`;
}

// Send sticker as a message
function useSticker(e) {
  const message = `<img src="${e.src}" class="graphics-container-item" />`;
  socket.emit("chat-message", message);
  graphics.classList.add("no-display");
  graphics.innerHTML = "";
}

// No command result
function noResult() {
  const element = `<span class="ui red horizontal label " style="margin:1em">No result found.</span>`;
  graphics.innerHTML = element;
}

// Preloader for waiting to fetch results
function loadContents() {
  graphics.innerHTML = `
  <div class="ui active inverted dimmer">
      <div class="ui loader">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div><div class="gap-patch">
          <div class="circle"></div>
        </div><div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>
  `;
}

//
//
//
// Typing check to display which users are currently typing

const timeOut = new Map();
chatInput.onkeydown = () => {
  const id = "user-list-" + window.sessionStorage.getItem("username");
  socket.emit("typing-start", id);
};

function typingStop(id) {
  const element = document.getElementById(id);
  if (!element) return;
  element.removeChild(element.lastElementChild);
  clearTimeout(timeOut.get(id));
  timeOut.delete(id);
}

socket.on("typing-start", (id) => {
  if (timeOut.get(id)) {
    clearTimeout(timeOut.get(id));
    timeOut.delete(id);
    timeOut.set(
      id,
      setInterval(() => typingStop(id), 500)
    );
    return;
  }
  const element = document.getElementById(id);
  element.innerHTML += `<span class="orange-text"><i> is Typing...</i></span>`;
  timeOut.set(
    id,
    setInterval(() => typingStop(id), 500)
  );
});
