// index.js
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple Chat</title>
      <style>
        body { font-family: Arial; margin: 20px; }
        #messages { list-style-type: none; padding: 0; max-height: 400px; overflow-y: scroll; }
        #messages li { padding: 5px 0; }
        input { padding: 5px; width: 80%; }
        button { padding: 5px; }
      </style>
    </head>
    <body>
      <ul id="messages"></ul>
      <input id="msgInput" autocomplete="off" placeholder="Type here..." />
      <button onclick="sendMessage()">Send</button>

      <script src="/socket.io/socket.io.js"></script>
      <script>
        const socket = io();
        const messages = document.getElementById("messages");
        const msgInput = document.getElementById("msgInput");
        let userTag = ""; // will assign on connect

        socket.on("connect", () => {
          userTag = socket.id.substring(0,6);
          console.log("Connected as " + userTag);
        });

        function sendMessage() {
          const msg = msgInput.value.trim();
          if(msg === "") return;
          socket.emit("chat message", msg);
          msgInput.value = "";
        }

        socket.on("chat message", (data) => {
          const li = document.createElement("li");
          const time = new Date(data.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
          li.textContent = \`\${data.user}: \${data.msg} (\${time})\`;
          messages.appendChild(li);
          messages.scrollTop = messages.scrollHeight;
        });

        msgInput.addEventListener("keydown", (e) => {
          if(e.key === "Enter") sendMessage();
        });
      </script>
    </body>
    </html>
  `);
});

io.on("connection", (socket) => {
  const userTag = socket.id.substring(0,6);
  console.log(userTag + " connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", { user: userTag, msg, time: Date.now() });
  });

  socket.on("disconnect", () => {
    console.log(userTag + " disconnected");
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, "0.0.0.0", () => console.log("Server running on port " + PORT));
