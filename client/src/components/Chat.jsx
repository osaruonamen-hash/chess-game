import React, { useState, useEffect } from "react";
import socket from "../socket";

const Chat = ({ roomId }) => {
  const [msg, setMsg] = useState("");
  const [chatLog, setChatLog] = useState([]);

  const sendMsg = () => {
    socket.emit("chat", { roomId, message: msg });
    setChatLog((prev) => [...prev, `You: ${msg}`]);
    setMsg("");
  };

  useEffect(() => {
    socket.on("receive_chat", (msg) => {
      setChatLog((prev) => [...prev, `Opponent: ${msg}`]);
    });

    return () => socket.off("receive_chat");
  }, []);

  return (
    <div>
      <div>{chatLog.map((m, i) => <p key={i}>{m}</p>)}</div>
      <input value={msg} onChange={(e) => setMsg(e.target.value)} />
      <button onClick={sendMsg}>Send</button>
    </div>
  );
};

export default Chat;
