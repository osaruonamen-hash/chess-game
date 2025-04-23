// ChessGame.jsx
import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import io from "socket.io-client";
import { Chess } from "chess.js";

const socket = io("https://chess-game-6.onrender.com");
const chess = new Chess();

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [roomId, setRoomId] = useState("");

  const joinGame = (room) => {
    setRoomId(room);
    socket.emit("join_game", room);
  };

  const makeAMove = (move) => {
    const result = game.move(move);
    if (result) {
      setGame(new Chess(game.fen())); // update state
      socket.emit("move", { roomId, move });
    }
    return result;
  };

  useEffect(() => {
    socket.on("opponent_move", (move) => {
      game.move(move);
      setGame(new Chess(game.fen()));
    });

    return () => {
      socket.off("opponent_move");
    };
  }, [game]);

  return (
    <div>
      <h1>Chess Game</h1>
      <button onClick={() => joinGame("room1")}>Join Game</button>
      <Chessboard
        position={game.fen()}
        onPieceDrop={(sourceSquare, targetSquare) => {
          const move = {
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // always promote to queen
          };
          makeAMove(move);
        }}
      />
    </div>
  );
};

export default ChessGame;
