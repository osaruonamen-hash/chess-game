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
  const [leaderboard, setLeaderboard] = useState([
    { name: "Luke", score: 102 },
    { name: "Peter", score: 97 },
    { name: "John", score: 35 },
    { name: "Matt", score: 70 },
    { name: "Alvin", score: 52 },
  ]);
  const [gameHistory, setGameHistory] = useState([
    { players: "Luke vs Elisa", moves: "1. d4 d5 2. c4 Nc6 3. Nc3 c5" },
    { players: "John vs Figo", moves: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6" },
    { players: "Peter vs Matt", moves: "1. d4 d5 2. c4 Nc6 3. Nc3 c5" },
  ]);

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
      setChatMessages((prev) => [...prev, `You: ${message}`]);
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
      setChatMessages((prevMessages) => [...prevMessages, `Opponent: ${message}`]);
    });

    return () => {
      socket.off("opponent_move");
      socket.off("receive_chat");
    };
  }, [game]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1a1c",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "30px",
      color: "#e0e0e0",
      fontFamily: "'Poppins', sans-serif",
    }}>
      {/* If not joined yet */}
      {!joinedRoom ? (
        <div style={{
          background: "#17232a",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.6)",
        }}>
          <h2 style={{ marginBottom: "20px" }}>Join a Chess Room</h2>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            style={{
              padding: "10px",
              width: "200px",
              borderRadius: "10px",
              border: "none",
              marginBottom: "20px",
            }}
          />
          <br />
          <button
            onClick={() => joinGame(roomInput)}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "#25d366",
              border: "none",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Join Game
          </button>
        </div>
      ) : (
        // Main Game Area
        <div style={{ display: "flex", gap: "20px", width: "100%", maxWidth: "1400px" }}>
          {/* Chat Section */}
          <div style={{
            background: "#17232a",
            borderRadius: "20px",
            padding: "20px",
            width: "250px",
            display: "flex",
            flexDirection: "column",
            height: "600px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.6)",
          }}>
            <h3 style={{ marginBottom: "15px", borderBottom: "1px solid #25d366", paddingBottom: "10px" }}>CHAT</h3>
            <div style={{
              flexGrow: 1,
              overflowY: "auto",
              marginBottom: "10px",
              paddingRight: "5px",
            }}>
              {chatMessages.map((msg, index) => (
                <div key={index} style={{
                  background: "#25d366",
                  color: "white",
                  padding: "8px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  fontSize: "14px",
                }}>
                  {msg}
                </div>
              ))}
            </div>
            <div style={{ display: "flex" }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type message"
                style={{
                  flexGrow: 1,
                  padding: "8px",
                  borderRadius: "10px 0 0 10px",
                  border: "none",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "8px 12px",
                  borderRadius: "0 10px 10px 0",
                  background: "#25d366",
                  border: "none",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Chessboard Section */}
          <div style={{
            background: "#17232a",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0px 8px 20px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "600px",
          }}>
            <h2 style={{ marginBottom: "10px" }}>{roomId}</h2>
            <Chessboard
              position={game.fen()}
              onPieceDrop={(source, target) => {
                const move = { from: source, to: target, promotion: "q" };
                return makeAMove(move);
              }}
              boardWidth={400}
              customDarkSquareStyle={{ backgroundColor: "#2d3e4f" }}
              customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
            />
          </div>

          {/* Leaderboard + Game History */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "250px",
          }}>
            {/* Leaderboard */}
            <div style={{
              background: "#17232a",
              borderRadius: "20px",
              padding: "20px",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.6)",
            }}>
              <h3 style={{ marginBottom: "15px", borderBottom: "1px solid #25d366", paddingBottom: "10px" }}>LEADERBOARD</h3>
              {leaderboard.map((player, index) => (
                <div key={index} style={{ marginBottom: "8px" }}>
                  {index + 1}. {player.name} — {player.score}
                </div>
              ))}
            </div>

            {/* Game History */}
            <div style={{
              background: "#17232a",
              borderRadius: "20px",
              padding: "20px",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.6)",
            }}>
              <h3 style={{ marginBottom: "15px", borderBottom: "1px solid #25d366", paddingBottom: "10px" }}>GAME HISTORY</h3>
              {gameHistory.map((game, index) => (
                <div key={index} style={{ marginBottom: "12px" }}>
                  <strong>{game.players}</strong>
                  <br />
                  <small>{game.moves}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;
