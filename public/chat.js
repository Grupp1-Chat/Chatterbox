// Get elements in DOM
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const graphics = document.getElementById("graphics-container");

// Initialize socket for client
const socket = io();
const username=window.sessionStorage.getItem("username")
console.log("username: "+ username)
const room=window.sessionStorage.getItem("room")
console.log("room: " +room)
socket.emit("joinRoom", {username, room});

socket.on("message", (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Configure room and users to DOM
socket.on("roomUsers", ({ name, users }) => {
  roomName.innerText = name;

  userList.innerHTML = "";
  console.log(users)
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  if (msg === "/") {
    const commands = `
      <span class="orange-text">/gifs</span> [your search keyword here] <br>
        - Gives you a list of gifs.
    `;

    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
    return outputMessage({
      username: "Chat Bot",
      time: "System time",
      content: commands,
    });
  }

  if (msg.startsWith("/")) {
    const msgArr = msg.split(" ");
    const cmd = msgArr.shift();
    const query = msgArr.join(" ").trim();
    e.target.elements.msg.value = "";
    if (cmd === "/gifs") {
      // For gif searching
      socket.emit("search-gifs", query);
      graphics.classList.remove("no-display");
      return;
    } else {
      return outputMessage({
        username: "Chat Bot",
        time: "System time",
        content: `<span class="red-text">Error:</span> Command <span class="orange-text">"${cmd}"</span> not found.`,
      });
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
  data.forEach((item) => outputGifs(item));
});

// Manage the graphics div
/* document.addEventListener("click", (e) => {
  if (graphics !== e.target && !graphics.contains(e.target)) {
    graphics.classList.add("no-display");
  }
}); */

// Output message to DOM
function outputMessage(message) {
  console.log("i ouput message" + message)
  const div = document.createElement("div");
  message.username === "You"
    ? div.setAttribute("class", "ui floating green message ")
    : div.setAttribute("class", "ui floating blue message");
  const p = document.createElement("p");
  message.username === "You"
    ? p.setAttribute("class", "meta red-text text-lighten-3")
    : p.setAttribute("class", "meta deep-purple-text text-lighten-3");
  p.innerText = message.username;
  p.innerHTML += `<span class="${
    message.username === "You" ? "orange-text" : "teal-text text-lighten-2"
  }"> at ${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerHTML = message.content;
  div.appendChild(para);
  document.querySelector(".ui.comments").appendChild(div);
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
