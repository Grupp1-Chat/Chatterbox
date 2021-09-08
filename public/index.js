const uname = document.getElementById("username");
const btn = document.getElementById("index-submit-btn");

btn.onclick = (e) => {
  e.preventDefault();
  if (!uname.value) return;
  window.sessionStorage.setItem("username", uname.value);
  window.location.href = "/rooms.html";
};
