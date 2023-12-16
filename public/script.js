const socket = io()
const msgs = document.getElementById("msgs")
const form = document.getElementById("form")
const input = document.getElementById("msg-input")
const msgscontainer = document.getElementById("msgs-container")
const userRoom = document.getElementById("user-room")

const userName = prompt("Enter your name:")

socket.emit("user:join", (userName === "" || userName == null) ? `unidentified user`: userName)
userRoom.innerHTML = userName

socket.on("global:message", msg => {
    msgs.innerHTML += `<p class="join-msg">${msg}</p>`
})


// const imgFile = document.getElementsByClassName("img-files")

form.addEventListener("submit", e => {
    e.preventDefault()

    let now = new Date().toLocaleTimeString('it-IT').slice(0, 5)

    /***
    const f = document.getElementById("image-uploads").files[0]
    const reader = new FileReader()
    reader.onload = function(){
        const base64 = this.result.replace(/.*base64,/, '')
        socket.emit("image", base64)
    }
    reader.readAsDataURL(f)
    */

    msgs.innerHTML += `
    <div class="sent-msg-container">
        <p class="sent-msg">${input.value}</p>
    </div>
    <p class="your-name">${now} - You</p>`
    socket.emit("message:send", { name:userName, message:input.value})
    input.value = ""
    msgscontainer.scrollTo(0, msgscontainer.scrollHeight)
})

socket.on("message:receive", payload => {
    let now = new Date().toLocaleTimeString('it-IT').slice(0, 5)
    msgs.innerHTML += `
    <div class="received-msg-container">
        <p class="received-msg">${payload.message}</p>
    </div>
    <p class="received-name">${(payload.name === "") ? `user ${payload.id}` : payload.name} - ${now}</p>`
    msgscontainer.scrollTo(0, msgscontainer.scrollHeight)
})

const leave = document.getElementById("leave")

leave.addEventListener("click", function() {
    socket.emit("user:left", userName)
    document.querySelector(".input-container").style.display = "none"
    msgs.innerHTML = `<p class="join-msg">Refresh the page to join a chatroom</p>`
})

/***
document.getElementById("image-uploads").addEventListener("change", () => {
    const f = this.files[0]
    const reader = new FileReader()
    reader.onload = function(){
        const base64 = this.result.replace(/.*base64,/, '')
        socket.emit("image", base64)
    }
    reader.readAsDataURL(f)
}, false)

socket.on("image", function(data){
    const img = new Image()
    img.src = 'data:image/jpeg;base64, ' + data
    msgs.appendChild(img)
})
*/