// // socketRouter.js
// import Message from "../models/messageSchema.js";
// const rooms = new Map();


// //rooms.set("mongo_id", "socket_id")

// const socketRouter = (io) => {
// 	io.on("connection", (socket) => {
// 		console.log(`User connected: ${socket.id}`);

// 		// socket.on('testing-123', (data) => {
// 		// 	console.log('Received testing-123 event with data:', data);
// 		// 	// Handle the event data here
// 		// });

// 		socket.on("join-room", (roomId) => {
// 			socket.join(roomId);
// 			rooms[socket.id] = roomId;
// 			const receiver_socket_id = rooms.get("mongo_id")
// 			console.log(`User ${socket.id} joined room ${roomId}`);
// 		});

// 		socket.on("send-message", async (message) => {
// 			const roomId = rooms[socket.id];
// 			if (roomId) {
// 				io.to(roomId).emit("received-message", message);

// 				// Save message to MongoDB
// 				try {
// 					await Message.create(message);
// 					console.log("Message saved to database:", message);
// 				} catch (error) {
// 					console.error("Error saving message to database:", error);
// 				}

// 				try {
// 					const previousMessages = await Message.find({ roomId });
// 					socket.emit("previous-messages", previousMessages);
// 				} catch (error) {
// 					console.error("Error fetching previous messages:", error);
// 				}
// 			}
// 		});

// 		socket.on("disconnect", () => {
// 			const roomId = rooms[socket.id];
// 			if (roomId) {
// 				console.log(`User ${socket.id} disconnected from room ${roomId}`);
// 				delete rooms[socket.id];
// 			}
// 		});
// 	});




// };

// export default socketRouter;
