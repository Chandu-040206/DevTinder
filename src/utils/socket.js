const socketIO = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const User = require("../models/user");

const onlineUsers = new Map();      // userId -> socketId
const activeChats = new Map();      // userId -> roomId

const createSecretRoomId = (userId, targetUserId) => {
    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");
};

const initiateServer = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        socket.on("userOnline", (userId) => {
            onlineUsers.set(userId.toString(), socket.id);
            socket.userId = userId.toString();

            io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        });

        socket.on("joinChat", ({ userId, targetUserId }) => {
            const roomId = createSecretRoomId(userId, targetUserId);

            socket.join(roomId);

            activeChats.set(userId.toString(), roomId);
        });

        socket.on("leaveChat", ({ userId }) => {
            activeChats.delete(userId.toString());
        });

        socket.on("sendMessage", async ({
            firstName,
            lastName,
            userId,
            targetUserId,
            text
        }) => {
            const roomId = createSecretRoomId(userId, targetUserId);

            let chat = await Chat.findOne({
                participants: { $all: [userId, targetUserId] }
            });

            if (!chat) {
                chat = new Chat({
                    participants: [userId, targetUserId],
                    messages: []
                });
            }

            const receiverRoom = activeChats.get(targetUserId.toString());

            const seen = receiverRoom === roomId;
            const delivered = onlineUsers.has(targetUserId.toString());

            const newMessage = {
                senderId: userId,
                text,
                delivered,
                seen
            };

            chat.messages.push(newMessage);
            await chat.save();

            const savedMessage =
                chat.messages[chat.messages.length - 1];

            io.to(roomId).emit("messageReceived", {
                _id: savedMessage._id,
                firstName,
                lastName,
                text,
                delivered,
                seen,
                createdAt: savedMessage.createdAt
            });
        });

        socket.on("markChatSeen", async ({
            chatId,
            userId
        }) => {
            const chat = await Chat.findById(chatId);

            let updatedIds = [];

            chat.messages.forEach((msg) => {
                if (
                    msg.senderId.toString() !== userId &&
                    !msg.seen
                ) {
                    msg.seen = true;
                    updatedIds.push(msg._id.toString());
                }
            });

            await chat.save();

            io.emit("messagesSeen", updatedIds);
        });

        socket.on("disconnect", async () => {
            const userId = socket.userId;

            if (userId) {
                onlineUsers.delete(userId);
                activeChats.delete(userId);

                await User.findByIdAndUpdate(userId, {
                    lastActive: new Date()
                });

                io.emit("onlineUsers", Array.from(onlineUsers.keys()));
            }
        });
    });
};

module.exports = initiateServer;