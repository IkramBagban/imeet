import http from "http";
import express from "express";
import WebSocket from "ws";

const app = express();
const httpServer = http.createServer(app);



const wss = new WebSocket.Server({ server: httpServer });

wss.on("connection", (ws: WebSocket) => {
  console.log("webSocket connected", ws);
});

httpServer.listen(3001, ()=> {
    console.log("Server is listening on 3001")
})