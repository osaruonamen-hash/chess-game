// client/src/components/ChessGame.jsx
import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import io from "socket.io-client";
import { Chess } from "chess.js";

const socket = io("https://chess-game-6.onrender.com");

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [roomId, setRoomId] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [roomInput, setRoomInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");

  const joinGame = (room) => {
    if (room.trim() === "") {
      alert("Please enter a room ID");
      return;
    }
    setRoomId(room);
    socket.emit("join_game", room);
    setJoinedRoom(true);
  };

  const makeAMove = (move) => {
    const result = game.move(move);
    if (result) {
      setGame(new Chess(game.fen()));
      socket.emit("move", { roomId, move });
    }
    return result;
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chat", { roomId, message });
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("opponent_move", (move) => {
      const updatedGame = new Chess(game.fen());
      updatedGame.move(move);
      setGame(updatedGame);
    });

    socket.on("receive_chat", (message) => {
      setChatMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("opponent_move");
      socket.off("receive_chat");
    };
  }, [game]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Multiplayer Chess Game</h1>

      {/* Room Join Controls */}
      {!joinedRoom && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            style={{ padding: "8px", marginRight: "10px" }}
          />
          <button onClick={() => joinGame(roomInput)}>Join Game</button>
        </div>
      )}

      {/* Chat Box */}
      {joinedRoom && (
        <div>
          <div style={{ maxHeight: "200px", overflowY: "scroll", marginBottom: "10px" }}>
            {chatMessages.map((msg, index) => (
              <div key={index} style={{ padding: "5px", borderBottom: "1px solid #ccc" }}>
                {msg}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ padding: "8px", width: "300px", marginRight: "10px" }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* Room Info */}
      {joinedRoom && <p>You are in Room: <strong>{roomId}</strong></p>}

      {/* Chessboard */}
      <Chessboard
        position={game.fen()}
        onPieceDrop={(sourceSquare, targetSquare) => {
          if (!roomId) {
            alert("Join a game room first!");
            return false;
          }

          const move = {
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
          };

          return makeAMove(move);
        }}
        boardWidth={400}
      />
    </div>
  );
};

export default ChessGame;
