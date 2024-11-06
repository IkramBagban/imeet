"use client";
import React, { useEffect, useState } from "react";

// const url = "ws://localhost:3001";
// const host = '192.168.168.1'
const url = "ws://192.168.87.181:3001";

const SenderPage = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    setSocket(socket);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "sender",
        })
      );
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const pc = new RTCPeerConnection();
    setPc(pc);

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createAnswer") {
        await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
      } else if (message.type === "iceCandidate") {
        await pc.addIceCandidate(message.candidate);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        socket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.send(
        JSON.stringify({
          type: "createOffer",
          sdp: pc.localDescription,
        })
      );
    };

    getCameraStreamAndSend(pc);
  }, [socket]);

  const getCameraStreamAndSend = async (pc: RTCPeerConnection) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const video = document.createElement("video");
    video.srcObject = stream;
    document.body.appendChild(video);
    video.play();

    stream.getTracks().forEach((track) => {
      console.log("Track",track);
      pc.addTrack(track, stream);
    });
  };

  return (
    <div>
      <h1>Sender</h1>
      <button onClick={() => pc && getCameraStreamAndSend(pc)}>Create Stream</button>
    </div>
  );
};

export default SenderPage;
