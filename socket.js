import * as mysql from 'mysql'

const users = []
var rooms = {}

// Database

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'users'
})

/*
connection.connect(function(err){
    if (err) throw err
    console.log("Connected to the database...")
})
*/

// Define a function to create a new room with a unique name
function createRoom() {
    // Generate a random name for the room
    var name = Math.random().toString(36).substring(7)
    // Initialize the room status with an empty array of sockets
    rooms[name] = []
    return name
}

// Define a function to join a room with a socket
function joinRoom(socket) {
    // Loop through the rooms object
    for (var name in rooms) {
        // Check if the room has less than two sockets
        if (rooms[name].length < 2) {
            // Add the socket to the room array
            rooms[name].push(socket)
            socket.join(name)
            socket.emit('joined', name)
            return name
        }
    }
    // If no room is available, create a new one
    var name = createRoom()
    // Add the socket to the room array
    rooms[name].push(socket)
    socket.join(name)
    socket.emit('joined', name)
    return name
}

// Define a function to leave a room with a socket
function leaveRoom(socket) {
    // Loop through the rooms object
    for (var name in rooms) {
        // Check if the room contains the socket
        if (rooms[name].includes(socket)) {
            // Remove the socket from the room array
            rooms[name] = rooms[name].filter(s => s !== socket)
            socket.leave(name)
            socket.emit('left', name)
            return name
        }
    }

    return null
}

const onSocket = (io) => {
    io.on("connection", (socket) => {
        let room = joinRoom(socket)
        socket.on("user:join", (name) => {
            !users.some((user) => user.name === name) &&
                users.push({ name, socketId: socket.id })

            io.to(room).emit("global:message", `${name} joined room ${room}`)

            /*
            connection.query("SELECT * FROM users WHERE username = ?", [username], function(err, result){
                if(err) throw err
                if(result.length === 0){
                    connection.query("INSERT INTO users (username) VALUES (?)", [username], function(err, result){
                        if(err) throw err
                        console.log("Inserted a new user")
                    })
                }
            })
            */
        })

        socket.on("user:left", () => {
            const user = users.filter((user) => user.socketId === socket.id)
            room = leaveRoom(socket)
            // using optional chaining and nullish coalescing {object?.property ?? "default vaule"} to handle the crash
            io.to(room).emit("global:message", `${user[0]?.name ?? "User Not Found"} left room ${room}`)
        })

        socket.on("message:send", (payload) => {
            socket.broadcast.to(room).emit("message:receive", payload)
        })


        socket.on("upload", function(data) {
            // broadcast the file data to all other clients
            socket.broadcast.to(room).emit("image", data)
        })

        socket.on("disconnect", () => {
            const user = users.filter((user) => user.socketId === socket.id)
            room = leaveRoom(socket)
            // using optional chaining and nullish coalescing to handle the crash
            io.to(room).emit("global:message", `${user[0]?.name ?? "User Not Found"} left room ${room}`)
        })
    })
}

export default onSocket