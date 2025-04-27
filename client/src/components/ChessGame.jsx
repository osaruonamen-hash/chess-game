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
<div className="container">
  <h1>Chess Game</h1>

  {/* Chessboard component here */}
  <div className="chess-board">
    <Chessboard
      position={game.fen()}
      onPieceDrop={handlePieceDrop}
    />
  </div>

  {/* Chat Section */}
  <div className="chat-container">
    <ul>
      {chatMessages.map((msg, index) => (
        <li key={index}>{msg}</li>
      ))}
    </ul>
    <input
      type="text"
      className="chat-input"
      value={chatInput}
      onChange={e => setChatInput(e.target.value)}
      placeholder="Type a message"
    />
    <button onClick={sendChatMessage} className="button">Send</button>
  </div>

  {/* Leaderboard Section */}
  <div className="leaderboard-container">
    <h2>Leaderboard</h2>
    <ul className="leaderboard-list">
      {leaderboard.map((player, index) => (
        <li key={index}>
          {player.username} <span>Wins: {player.wins} - Losses: {player.losses}</span>
        </li>
      ))}
    </ul>
  </div>

  {/* Game History Section */}
  <div className="history-container">
    <h3>Game History</h3>
    <ul className="history-list">
      {gameHistory.map((game, index) => (
        <li key={index}>
          {game.players.join(" vs ")} - Winner: {game.winner}
        </li>
      ))}
    </ul>
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
