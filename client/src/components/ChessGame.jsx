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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      position: "relative",
    }}>
      {/* Room Join Controls */}
      {!joinedRoom && (
        <div style={{
          background: "white",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}>
          <h2>Join a Room</h2>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              marginBottom: "10px",
              width: "200px",
            }}
          />
          <br />
          <button
            onClick={() => joinGame(roomInput)}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#4CAF50",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Join Game
          </button>
        </div>
      )}

      {/* Game and Chat UI */}
      {joinedRoom && (
        <div style={{ display: "flex", gap: "30px" }}>
          {/* Chessboard Card */}
          <div style={{
            background: "#1e1e1e",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.3)",
            position: "relative",
          }}>
            <div style={{ color: "white", marginBottom: "10px" }}>
              Room: <strong>{roomId}</strong>
            </div>
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
              boardOrientation="white"
              customDarkSquareStyle={{ backgroundColor: "#1a1a1a" }}
              customLightSquareStyle={{ backgroundColor: "#b9c2c9" }}
            />
          </div>

          {/* Chat Card */}
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "20px",
            width: "300px",
            maxHeight: "500px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)",
          }}>
            <div style={{
              flexGrow: 1,
              overflowY: "auto",
              marginBottom: "10px",
              paddingRight: "10px",
            }}>
              {chatMessages.map((msg, index) => (
                <div key={index} style={{
                  background: index % 2 === 0 ? "#e0f7fa" : "#f1f8e9",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  marginBottom: "8px",
                  alignSelf: "flex-start",
                  maxWidth: "80%",
                }}>
                  {msg}
                </div>
              ))}
            </div>
            <div style={{ display: "flex" }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  flexGrow: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  marginLeft: "10px",
                  padding: "10px 15px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#2196f3",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;
