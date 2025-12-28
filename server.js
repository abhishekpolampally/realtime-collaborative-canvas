import express from "express";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.static("public"));

const server = app.listen(3000, () =>
  console.log("Server running on port 3000")
);

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    wss.clients.forEach((client) => {
      if (client !== socket && client.readyState === 1) {
        client.send(data);
      }
    });
  });
});
