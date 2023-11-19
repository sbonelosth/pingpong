const users = [];

const onSocket = (io) => {
    io.on("connection", (socket) => {
        socket.on("user:join", (name) => {
            !users.some((user) => user.name === name) &&
                users.push({name, socketId: socket.id});
            io.emit("global:message", `${name} joined`);
        });

        socket.on("message:send", (payload) => {
            socket.broadcast.emit("message:receive", payload);
        });

        socket.on("disconnect", () => {
            const user = users.filter((user) => user.socketId === socket.id);
            io.emit("global:message", `${user[0].name} left`);
        });
    });
};

export default onSocket;