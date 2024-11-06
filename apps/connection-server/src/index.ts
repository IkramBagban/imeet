import http from "http";
import express from "express";
import WebSocket from "ws";
import cors from "cors";

const app = express();
const httpServer = http.createServer(app);

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

const wss = new WebSocket.Server({ server: httpServer });
app.use(cors());

wss.on("connection", (ws: WebSocket) => {
  console.log("WebSocket connected");

  ws.on("message", (data: any) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case "sender":
        console.log("SENDER ADDED");
        senderSocket = ws;
        break;

      case "receiver":
        console.log("RECEIVER ADDED");
        receiverSocket = ws;
        break;

      case "createOffer":
        if (ws !== senderSocket) return;
        console.log("SENDING OFFER");
        receiverSocket?.send(
          JSON.stringify({
            type: "createOffer",
            sdp: message.sdp,
          })
        );
        break;

      case "createAnswer":
        if (ws !== receiverSocket) return;
        console.log("RECEIVING ANSWER");
        senderSocket?.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: message.sdp,
          })
        );
        break;

      case "iceCandidate":
        const targetSocket = ws === senderSocket ? receiverSocket : senderSocket;
        targetSocket?.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: message.candidate,
          })
        );
        break;

      default:
        break;
    }
  });
});

httpServer.listen(3001, () => {
  console.log("Server is listening on port 3001");
});
