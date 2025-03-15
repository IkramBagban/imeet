"use client";

import React, { useEffect, useState } from "react";
import * as mediasoupClient from "mediasoup-client";
const Meet = () => {
  const [device, setDevice] = useState<mediasoupClient.Device | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [sendTransport, setSendTransport] = useState<any>();
  

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    ws.onopen = () => console.log("Connected to WebSocket");
    const handleWebSocketActions = () => {
      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);

        console.log("message", message);

        if (message.type === "routerRtpCapabilities") {
          const device = new mediasoupClient.Device();
          await device.load({ routerRtpCapabilities: message.data });
          setDevice(device);
          console.log("Mediasoup Device Loaded", device.rtpCapabilities);

          ws.send(JSON.stringify({ type: "createTransport" }));
        }

        if (message.type === "transportCreated") {
          const transport = device?.createSendTransport(message.data);
          setSendTransport(transport);
          console.log("Transport Created", transport);
        }
      };

      setSocket(ws);
      ws.send(JSON.stringify({ type: "getRouterRtpCapabilities" }));
    };

    if (ws.readyState === WebSocket.OPEN) {
      handleWebSocketActions();
    } else {
      setTimeout(() => handleWebSocketActions(), 1000);
    }
    return () => {
      ws.close();
    };
  }, [setSocket]);
  return <div>Meet</div>;
};

export default Meet;
