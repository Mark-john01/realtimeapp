const { Server } = require("socket.io");

const MAX_LENGTH = 2000;

function setupChat(server) {
  const allowedOrigins = (process.env.SOCKET_CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const io = new Server(server, { cors: { origin: allowedOrigins } });

  // Short label so users are readable (e.g. "User a1b2")
  const label = (socket) => `User ${socket.id.slice(0, 4)}`;

  const isValidText = (text) =>
    typeof text === "string" && text.trim() && text.trim().length <= MAX_LENGTH;

  // Join / leave notification payload
  const notification = (type, text) => ({
    type, // "join" | "leave"
    text,
    online: io.engine.clientsCount,
    sentAt: new Date().toISOString()
  });

  // Send everyone the current list of online users
  const broadcastUsers = () => {
    const users = [...io.sockets.sockets.values()].map((s) => ({
      id: s.id,
      label: label(s)
    }));
    io.emit("users", users);
  };

  io.on("connection", (socket) => {
    socket.emit("welcome", {
      senderId: socket.id,
      label: label(socket),
      online: io.engine.clientsCount
    });

    socket.broadcast.emit("notification", notification("join", `${label(socket)} joined the chat`));
    broadcastUsers();

    // ---------- Public message (everyone) ----------
    socket.on("message", (text, acknowledge) => {
      if (!isValidText(text)) {
        const error = `Message must not be empty or longer than ${MAX_LENGTH} characters`;
        if (typeof acknowledge === "function") {
          acknowledge({ success: false, error });
        } else {
          socket.emit("message:error", { error });
        }
        return;
      }

      io.emit("message", {
        text: text.trim(),
        senderId: socket.id,
        label: label(socket),
        sentAt: new Date().toISOString()
      });

      if (typeof acknowledge === "function") acknowledge({ success: true });
    });

    // ---------- Private message (exactly two users) ----------
    socket.on("private:message", (payload, acknowledge) => {
      const reply = (result) => {
        if (typeof acknowledge === "function") acknowledge(result);
      };

      const to = payload && payload.to;
      const text = payload && payload.text;

      if (!isValidText(text)) {
        return reply({ success: false, error: `Message must not be empty or longer than ${MAX_LENGTH} characters` });
      }

      const target = typeof to === "string" ? io.sockets.sockets.get(to) : null;
      if (!target) {
        return reply({ success: false, error: "That user is no longer online" });
      }
      if (target.id === socket.id) {
        return reply({ success: false, error: "You can't send a private message to yourself" });
      }

      const message = {
        text: text.trim(),
        from: socket.id,
        fromLabel: label(socket),
        to: target.id,
        toLabel: label(target),
        sentAt: new Date().toISOString()
      };

      // Only these two sockets receive the message
      target.emit("private:message", message);
      socket.emit("private:message", message);

      // Notification for BOTH users
      target.emit("notification", {
        type: "private",
        text: `${label(socket)} sent you a private message`,
        sentAt: message.sentAt
      });
      socket.emit("notification", {
        type: "private",
        text: `Private message sent to ${label(target)}`,
        sentAt: message.sentAt
      });

      reply({ success: true });
    });

    socket.on("disconnect", () => {
      io.emit("notification", notification("leave", `${label(socket)} left the chat`));
      broadcastUsers();
    });
  });
}

module.exports = setupChat;
