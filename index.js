const express = require("express");
const app = express();
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {origin: "*"},
});
const cors = require("cors");
const corsOptions = {
  origin: "https://video-call-frontend-eight.vercel.app",
};

// Enable CORS with specific origin
app.use(cors(corsOptions));

io.on("connection", (socket) => {
  console.log(`New client connected ${socket.id}`);
  socket.emit("me", socket.id);
  socket.join(socket.id);
  socket.on("disconnect", () => {
    socket.broadcast.emit("message", "Call Ended");
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      callerName: data.callerName,
      name: data.name,
      roomId: data.roomId,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("leaveCall", (data) => {
    io.to(data.id).emit("leaveCall", data.roomId);
  });

  socket.on("chatMessage", (data) => {
    io.to(data.roomId).emit("chatMessage", {
      message: data.message,
      name: data.name,
      sender: data.sender,
    });
  });
  socket.on("joinRoom", (room) => {
    socket.join(room);
  });
});

app.listen(8000, () => {
  console.log("Server listening on port 8000");
});
