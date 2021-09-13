// If a username is saved in the session storage, then it redirects to rooms
// the app reads it as if the user is signed in since a username exists
if (window.sessionStorage.username) window.location.href = "/rooms.html";

const uname = document.getElementById("username");
const btn = document.getElementById("index-submit-btn");

//once a user signs in with a username, the username is saved to the session storage with the value username
btn.onclick = (e) => {
  e.preventDefault();
  if (!uname.value) return;
  window.sessionStorage.setItem("username", uname.value);
  window.location.href = "/rooms.html";
};
