"use client";
import { useEffect } from "react";

// const host = '192.168.168.1'
const url = "ws://192.168.87.181:3001";

const ReceiverPage = () => {
  useEffect(() => {
    const socket = new WebSocket(url);
    socket.onopen = () => {
      console.log("Receiver WebSocket connected");
      socket.send(
        JSON.stringify({
          type: "receiver",
        })
      );
    };
    startReceiving(socket);
  }, []);

  function startReceiving(socket: WebSocket) {
    const video = document.createElement("video");
    document.body.appendChild(video);

    const pc = new RTCPeerConnection();
    pc.ontrack = (event) => {
      console.log("Received track:", event);
      if (event.streams && event.streams[0]) {
        video.srcObject = event.streams[0];
        video.play();
      }
    };

    socket.onmessage = async (event) => {
      console.log("Message from sender:", event.data);
      const message = JSON.parse(event.data);

      if (message.type === "createOffer") {
        await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: answer,
          })
        );
      } else if (message.type === "iceCandidate") {
        await pc.addIceCandidate(message.candidate);
      }
    };
  }

  return <div>Receiver</div>;
};

export default ReceiverPage;
