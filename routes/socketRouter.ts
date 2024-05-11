import { Server } from "socket.io";
import Message from "../models/messageSchema";

interface Rooms {
  [key: string]: string;
}

const socketRouter = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const rooms: Rooms = {};

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);

      rooms[socket.id] = roomId;
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("send-message", async (message) => {
      const roomId = rooms[socket.id];
      if (roomId) {
        io.to(roomId).emit("received-message", message);

        // Save message to MongoDB
        try {
          await Message.create(message);
          console.log("Message saved to database:", message);
        } catch (error) {
          console.error("Error saving message to database:", error);
        }
        try {
          const previousMessages = await Message.find({ roomId });
          socket.emit("previous-messages", previousMessages);
        } catch (error) {
          console.error("Error fetching previous messages:", error);
        }
      }
    });

    socket.on("disconnect", () => {
      const roomId = rooms[socket.id];
      if (roomId) {
        console.log(`User ${socket.id} disconnected from room ${roomId}`);
        delete rooms[socket.id];
      }
    });
  });
};

export default socketRouter;
