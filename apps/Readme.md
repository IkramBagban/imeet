### server
```ts
// @ts-ignore
const mediasoup = require("mediasoup");
const WebSocketServer = require("ws").Server;
const https = require("https");
const fs = require("fs");
const path = require("path");

// console.log('__dirname', __dirname)
console.log(
  "=========> ",
  path.join(__dirname, "../../web/192.168.58.181+3.pem")
);

(async () => {
  // 1. Create a Mediasoup Worker
  const worker = await mediasoup.createWorker({
    logLevel: "debug", // Set to "warn" or "error" in production
    rtcMinPort: 10000, // Range of ports for WebRTC
    rtcMaxPort: 10100,
  });

  worker.on("died", () => {
    console.error("Mediasoup worker died, exiting...");
    process.exit(1);
  });

  // 2. Create a Router (represents a "room" or media context)
  const router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
      },
      {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
      },
    ],
  });

  // 3. Set up WebSocket Server for signaling
  //   const wss = new WebSocketServer({ port: 8080 });
  const server = https.createServer({
    cert: fs.readFileSync(
      path.join(__dirname, "../../web/certificates/localhost.pem")
    ),
    key: fs.readFileSync(
      path.join(__dirname, "../../web/certificates/localhost-key.pem")
    ),
  });
  const wss = new WebSocketServer({ server });
  server.listen(8080, "0.0.0.0", () => {
    console.log("Mediasoup server running on wss://0.0.0.0:8080");
  });
  const clients = new Map();

  // @ts-ignore

  wss.on("connection", (ws) => {
    console.log("New client connected", ws);
    clients.set(ws, { transports: {}, producers: {}, consumers: {} });
    // @ts-ignore

    ws.on("message", async (message) => {
      const data = JSON.parse(message);
      await handleSignaling(data, ws, router, clients);
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("Client disconnected");
    });
  });

  console.log("Mediasoup server running on ws://localhost:8080");
})();

// ---------------
// @ts-ignore

async function handleSignaling(data, ws, router, clients) {
  const clientData = clients.get(ws);

  let transport;
  switch (data.type) {
    case "createTransport":
      // Create a WebRTC Transport for sending or receiving
      transport = await router.createWebRtcTransport({
        listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }], // Adjust for production (e.g., public IP)
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      });

      clientData.transports[transport.id] = transport;
      ws.send(
        JSON.stringify({
          type: "transportCreated",
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        })
      );
      break;

    case "connectTransport":
      // Connect the transport after client sends DTLS parameters
      const { transportId, dtlsParameters } = data;

      transport = clientData.transports[transportId];
      await transport.connect({ dtlsParameters });
      ws.send(JSON.stringify({ type: "transportConnected" }));
      break;

    case "produce":
      // Client wants to send a stream (e.g., camera/mic)
      const { transportId: prodTransportId, kind, rtpParameters } = data;
      const producerTransport = clientData.transports[prodTransportId];
      const producer = await producerTransport.produce({ kind, rtpParameters });
      clientData.producers[producer.id] = producer;

      ws.send(JSON.stringify({ type: "producerCreated", id: producer.id }));

      // Notify other clients about the new producer (for group calls)
      broadcastNewProducer(producer, ws, clients);
      break;

    case "consume":
      // Client wants to receive a stream
      const { transportId: consTransportId, producerId } = data;
      const consumerTransport = clientData.transports[consTransportId];
      const consumer = await consumerTransport.consume({
        producerId,
        rtpCapabilities: router.rtpCapabilities,
      });
      clientData.consumers[consumer.id] = consumer;

      ws.send(
        JSON.stringify({
          type: "consumerCreated",
          id: consumer.id,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        })
      );
      break;
  }
}
// @ts-ignore

function broadcastNewProducer(producer, senderWs, clients) {
  for (const [ws] of clients) {
    if (ws !== senderWs) {
      ws.send(
        JSON.stringify({
          type: "newProducer",
          producerId: producer.id,
          kind: producer.kind,
        })
      );
    }
  }
}
```

-------------------
apps/web
```tsx

"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Meet() {
  const router = useRouter();
  //   const { roomId } = router.query;
  const roomId = 2;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // const ws = new WebSocket("ws://localhost:8080");
    const ws = new WebSocket("wss://192.168.58.181:8080");

    setSocket(ws);

    const pc = new RTCPeerConnection();
    setPeerConnection(pc);

    ws.onopen = () => {
      console.log("Connected to server");
      setupWebRTC(pc, ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleSignaling(data, pc, ws);
    };

    return () => {
      ws.close();
      pc.close();
    };
  }, [roomId]);

  async function setupWebRTC(pc: RTCPeerConnection, ws: WebSocket) {
    // Get local stream (camera/mic)
    const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Create send transport
    ws.send(JSON.stringify({ type: "createTransport" }));
  }

  async function handleSignaling(
    data: any,
    pc: RTCPeerConnection,
    ws: WebSocket
  ) {
    if (typeof window === "undefined")
      return console.log("window is undefined");
    switch (data.type) {
      case "transportCreated": {
        console.log("Transport created:", data.id);
        // Send the connection params directly as a workaround
        ws.send(
          JSON.stringify({
            type: "connectTransport",
            transportId: data.id,
            dtlsParameters: { role: "auto" },
          })
        );
        break;
      }
      case "producerCreated": {
        console.log("Producer created:", data.id);
        // transportId: prodTransportId, kind, rtpParameters
        ws.send(
          JSON.stringify({
            type: "consume",
            transportId: data.id,
            kind: "video",
            rtpParameters: {
              codecs: [
                {
                  payloadType: 105,
                  mimeType: "video/VP8",
                  rtpParameters: data.rtpParameters,
                },
              ],
            },
          })
        );
        break;
      }
    }
  }

  return (
    <div>
      <h1>Meeting Room: {roomId}</h1>
      <video ref={videoRef} autoPlay muted />
    </div>
  );
}

```
