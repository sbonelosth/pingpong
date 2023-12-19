//import * as fs from 'fs'

const socket = io()
const msgs = document.getElementById("msgs")
const form = document.getElementById("form")
const input = document.getElementById("msg-input")
const msgscontainer = document.getElementById("msgs-container")
const userRoom = document.getElementById("user-room")

const preview = document.querySelector(".preview")

const username = prompt("Enter your name:")

socket.emit("user:join", (username === "" || username == null) ? `unidentified user` : username)
userRoom.innerHTML = username

socket.on("global:message", msg => {
    msgs.innerHTML += `<p class="join-msg">${msg}</p>`
})

const imagefile = document.getElementById("image-uploads")

var img = null

imagefile.addEventListener("change", async () => {
    const f = imagefile.files[0]
    const reader = new FileReader()
    reader.onload = function () {
        const bytes = new Uint8Array(this.result)
        const url = URL.createObjectURL(f)
        img = new Image()
        img.src = url
        preview.innerHTML = img.outerHTML
    }
    reader.readAsArrayBuffer(f)
})

form.addEventListener("submit", e => {
    e.preventDefault()

    const file = imagefile.files[0]
    
    if (file && file.type.startsWith("image/")) {
        // create a file reader object
        const reader = new FileReader()
        // add an event listener for when the file is loaded
        reader.addEventListener("load", function() {
            // get the file data as a base64 encoded string
            const data = reader.result
            // emit a socket.io event to the server with the file data
            socket.emit("upload", data)
        })
        // read the file as a data URL
        reader.readAsDataURL(file)
    }

    let now = new Date().toLocaleTimeString('it-IT').slice(0, 5)

    msgs.innerHTML += `
        <div class="sent-msg-container">
            <p class="sent-msg">${input.value}</p>
        </div>`
    if (img) {
        msgs.innerHTML += `
            <div class="img-container sent-img">
            ${img.outerHTML}
            </div>`
    }
    msgs.innerHTML += `<p class="your-name">${now} - You</p>`

    socket.emit("message:send", { name: username, message: input.value })

    input.value = ""
    imagefile.value = ""
    img = false
    preview.innerHTML = ""
    msgscontainer.scrollTo(0, msgscontainer.scrollHeight)
})

var rec = document.getElementsByClassName("received-img")

// add a socket.io event listener for when a new image is received from the server
socket.on("image", function(data) {
    // create an image element
    const image = document.createElement("img")
    // set the image source to the data URL
    image.src = data
    // append the image to the the message received
    for (let index = 0; index < rec.length; index++) {
        rec[rec.length - 1].appendChild(image)
    }
    msgscontainer.scrollTo(0, msgscontainer.scrollHeight)
})

socket.on("message:receive", payload => {
    let now = new Date().toLocaleTimeString('it-IT').slice(0, 5)
    msgs.innerHTML += `
    <div class="received-msg-container">
        <p class="received-msg">${payload.message}</p>
    </div>
    <div class="img-container received-img"></div>`
    msgs.innerHTML += `<p class="received-name">${(payload.name === "") ? `user ${payload.id}` : payload.name} - ${now}</p>`
    msgscontainer.scrollTo(0, msgscontainer.scrollHeight)
})

const leave = document.getElementById("leave")

leave.addEventListener("click", function () {
    socket.emit("user:left", username)
    document.querySelector(".input-container").style.display = "none"
    msgs.innerHTML = `<p class="join-msg">Refresh the page to join a chatroom</p>`
})