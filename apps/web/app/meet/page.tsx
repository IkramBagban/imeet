"use client";

import React, { useEffect, useState } from "react";
import * as mediasoupClient from "mediasoup-client";
const Meet = () => {
  const [device, setDevice] = useState(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

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
