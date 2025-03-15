// @ts-ignore

import https from "https";
import http from "http";
import fs from "fs";
// import { Worker } from "mediasoup";

// import mediasoup from 'mediasoup'
import path from "path";
import WebSocket from "ws";
import express from "express";
import * as mediasoup from "mediasoup";
const app = express();
let worker: mediasoup.types.Worker;
let router: mediasoup.types.Router;

async function initMediasoup() {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
    mediaCodecs: [
      { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: { "x-google-start-bitrate": 1000 },
      },
    ],
  });
  console.log("Mediasoup Worker & Router initialized");
}

async function createWebRtcTransport() {
  const transport = await router.createWebRtcTransport({
    listenIps: [{ ip: "127.0.0.1", announcedIp: null }],
    enableUdp: true,
    preferUdp: true,
    enableTcp: true,
  });

  return {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParamters: transport.dtlsParameters,
    transport,
  };
}

init();
initMediasoup();
async function init() {
  // @ts-ignore
  const httpServer = http.createServer(app);
  const wss = new WebSocket.Server({ server: httpServer });

  wss.on("connection", async (ws) => {
    console.log("New WebSocket Connection");
    ws.on("message", async (message) => {
      console.log("message ===========> ", message);
      console.log("message to string===========> ", message.toString());
      const msg = JSON.parse(message.toString());

      if (msg.type === "getRouterRtpCapabilities") {
        console.log("getRouterRtcpCapabilites", router.rtpCapabilities);
        ws.send(
          JSON.stringify({
            type: "routerRtpCapabilities",
            data: router.rtpCapabilities,
          })
        );
      }

      if (msg.type === "createTransport") {
        const transportData = await createWebRtcTransport();
        ws.send(
          JSON.stringify({ type: "transportCreated", data: transportData })
        );
      }
    });
  });

  httpServer.listen(3000);
}
