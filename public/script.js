const socket = io();
const msgs = document.getElementById("msgs");
const form = document.getElementById("form");
const input = document.getElementById("msg-input");

const userName = prompt("Enter your name");

socket.emit("user:join", userName);

socket.on("global:message", msg => {
    msgs.innerHTML += `<p class="join-msg">${msg}</p>`;
});

form.addEventListener("submit", e => {
    e.preventDefault();

    let now = new Date().toLocaleTimeString('it-IT').slice(0, 5);
    msgs.innerHTML += `
    <div class="sent-msg-container">
        <p class="your-name">You - ${now}</p>
        <p class="sent-msg">${input.value}</p>
    </div>
    `;
    socket.emit("message:send", { name:userName, message:input.value});
    input.value = "";
});

socket.on("message:receive", payload => {
    let now = new Date().toLocaleTimeString('it-IT').slice(0, 5);
    msgs.innerHTML += `
    <div class="received-msg-container">
        <p class="received-name">${payload.name} - ${now}</p>
        <p class="sent-msg">${payload.message}</p>
    </div>
    `;
})
 