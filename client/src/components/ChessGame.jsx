import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import socket from "../socket";

const ChessGame = ({ roomId }) => {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState("start");

  useEffect(() => {
    socket.emit("join_game", roomId);

    socket.on("opponent_move", (move) => {
      game.move(move);
      setPosition(game.fen());
    });

    return () => socket.off("opponent_move");
  }, [roomId, game]);

  const makeMove = (sourceSquare, targetSquare) => {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // Always promote to queen for simplicity
    };

    const result = game.move(move);

    if (result) {
      setPosition(game.fen());
      socket.emit("move", { roomId, move });
      return true;
    } else {
      return false;
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Room: {roomId}</h2>
      <Chessboard position={position} onPieceDrop={makeMove} />
    </div>
  );
};

export default ChessGame;