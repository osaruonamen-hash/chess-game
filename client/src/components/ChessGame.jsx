import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("https://chess-game-6.onrender.com");

const ChessGame = () => {
  const [roomId, setRoomId] = useState(""); // Track the current room ID
  const [move, setMove] = useState(""); // Track player's move
  const [chatMessage, setChatMessage] = useState(""); // Track chat message
  const [opponentMove, setOpponentMove] = useState(""); // Track opponent's move
  const [gameBoard, setGameBoard] = useState([/* Initialize your chessboard state */]);

  // Handle joining the game room
  const joinGame = (room) => {
    setRoomId(room);
    socket.emit("join_game", room); // Join the room
  };

  // Handle making a move
  const makeMove = () => {
    socket.emit("move", { roomId, move });
    // Optionally update the game state locally after making the move
  };

  // Listen for opponent's move and update the game state
  useEffect(() => {
    socket.on("opponent_move", (opponentMove) => {
      console.log("Opponent made a move:", opponentMove);
      setOpponentMove(opponentMove); // Store the opponent's move
      // You could update the game state with opponent's move here
    });

    // Listen for chat messages
    socket.on("receive_chat", (message) => {
      console.log("Chat message from opponent:", message);
      // Handle incoming chat message
    });

    return () => {
      socket.off("opponent_move");
      socket.off("receive_chat");
    };
  }, []);

  // Send a chat message
  const sendChatMessage = () => {
    socket.emit("chat", { roomId, message: chatMessage });
    setChatMessage(""); // Clear input after sending
  };

  return (
    <div>
      <h1>Chess Game</h1>

      {/* Join Game */}
      <button onClick={() => joinGame("room1")}>Join Game</button>

      {/* Make Move */}
      <input
        type="text"
        placeholder="Enter your move (e.g., e2e4)"
        value={move}
        onChange={(e) => setMove(e.target.value)}
      />
      <button onClick={makeMove}>Make Move</button>

      {/* Chat */}
      <input
        type="text"
        placeholder="Enter chat message"
        value={chatMessage}
        onChange={(e) => setChatMessage(e.target.value)}
      />
      <button onClick={sendChatMessage}>Send Chat</button>

      {/* Display opponent's move */}
      <div id="opponent-move">
        Opponent's Move: {opponentMove ? opponentMove : "Waiting for opponent's move..."}
      </div>

      {/* Display the game board */}
      <div id="game-board">
        {/* You can integrate a chessboard UI here */}
        {/* Example (using react-chessboard or similar): */}
        {/* <Chessboard gameState={gameBoard} onMove={makeMove} /> */}
      </div>
    </div>
  );
};

export default ChessGame;
