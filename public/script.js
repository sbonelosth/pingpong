id = (selector) => { return document.getElementById(selector) }
q = (selector) => { return document.querySelector(selector) }

const socket = io()
const msgs = id("msgs")
const form = id("form")
const input = id("msg-input")
const msgscontainer = id("msgs-container")

const preview = q(".preview")

const disclaimer = q(".disclaimer")
disclaimer.innerText = "The username is for display purposes, it's not compulsory."

const showPopup = q("#show-popup-btn")
const popupWidget = q(".popup-widget")

showPopup.addEventListener("click", () => {
    popupWidget.style.display = "flex"
    showPopup.style.display = "none"
})

const proceed = q("#proceed-btn")
var username

q(".close").addEventListener("click", () => {
    popupWidget.style.display = "none"
    showPopup.style.display = "flex"
})

proceed.addEventListener("click", () => {
    username = q("#username").value
    username = (username === "") ? "noname" : username
    popupWidget.style.display = "none"

    q("main").style.display = "flex"

    socket.emit("user:join", username)
    id("user-room").innerHTML = username
})

socket.on("global:message", msg => {
    msgs.innerHTML += `<p class="join-msg">${msg}</p>`
    msgscontainer.scrollTo(0, msgscontainer.scrollHeight)
})

const imagefile = id("image-uploads")

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
    input.removeAttribute("required")
})

form.addEventListener("submit", e => {
    e.preventDefault()

    const file = imagefile.files[0]

    if (file && file.type.startsWith("image/")) {
        // a file reader object
        const reader = new FileReader()
        // adding an event listener for when the img file is loaded
        reader.addEventListener("load", function () {
            // getting the img file data as a base64 encoded string
            const data = reader.result
            // emitting a socket.io event to the server with the img file data
            socket.emit("upload", data)
        })
        // reading the img file as a data URL
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
    input.setAttribute("required", "")
    imagefile.value = ""
    img = false
    preview.innerHTML = ""
    msgscontainer.scrollTo(0, msgscontainer.scrollHeight)
})

var rec = document.getElementsByClassName("received-img")

// adding a socket.io event listener for when a new image is received from the server
socket.on("image", function (data) {
    // creating an image element
    const image = document.createElement("img")
    // setting the image source to the data URL
    image.src = data
    // appending the image to the the message received
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
    msgs.innerHTML += `<p class="received-name">${payload.name} - ${now}</p>`
    msgscontainer.scrollTo(0, msgscontainer.scrollHeight)
})

const leave = id("leave")

leave.addEventListener("click", function () {
    socket.emit("user:left", username)
    q(".input-container").style.display = "none"
    msgs.innerHTML = `<p class="join-msg">Refresh the page to join a chatroom</p>`
})

window.onbeforeunload = () => { return "Everything will be erased" }