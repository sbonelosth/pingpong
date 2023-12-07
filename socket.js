const users = [];
var rooms = {};

// Define a function to create a new room with a unique name
function createRoom() {
    // Generate a random name for the room
    var name = Math.random().toString(36).substring(7);
    // Initialize the room status with an empty array of sockets
    rooms[name] = [];
    // Return the name of the room
    return name;
}

// Define a function to join a room with a socket
function joinRoom(socket) {
    // Loop through the rooms object
    for (var name in rooms) {
        // Check if the room has less than two sockets
        if (rooms[name].length < 2) {
            // Add the socket to the room array
            rooms[name].push(socket);
            // Join the socket to the room namespace
            socket.join(name);
            // Emit a message to the socket with the room name
            socket.emit('joined', name);
            // Return the name of the room
            return name;
        }
    }
    // If no room is available, create a new one
    var name = createRoom();
    // Add the socket to the room array
    rooms[name].push(socket);
    // Join the socket to the room namespace
    socket.join(name);
    // Emit a message to the socket with the room name
    socket.emit('joined', name);
    // Return the name of the room
    return name;
}

// Define a function to leave a room with a socket
function leaveRoom(socket) {
    // Loop through the rooms object
    for (var name in rooms) {
        // Check if the room contains the socket
        if (rooms[name].includes(socket)) {
            // Remove the socket from the room array
            rooms[name] = rooms[name].filter(s => s !== socket);
            // Leave the socket from the room namespace
            socket.leave(name);
            // Emit a message to the socket with the room name
            socket.emit('left', name);
            // Return the name of the room
            return name;
        }
    }
    // If the socket is not in any room, return null
    return null;
}

const onSocket = (io) => {
    io.on("connection", (socket) => {
        // Call the joinRoom function with the socket
        let room = joinRoom(socket);
        
        socket.on("user:join", (name) => {
            !users.some((user) => user.name === name) &&
                users.push({ name, socketId: socket.id });
            io.to(room).emit("global:message", `${name} joined`);
        });

        socket.on("message:send", (payload) => {
            socket.broadcast.to(room).emit("message:receive", payload);
            // io.to(room).emit("message:receive", payload);
        });

        socket.on("disconnect", () => {
            const user = users.filter((user) => user.socketId === socket.id);
            room = leaveRoom(socket);
            io.to(room).emit("global:message", `${user[0].name} left`);
        });
    });
};

export default onSocket;