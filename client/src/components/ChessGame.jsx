// src/components/ChessGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [whiteTime, setWhiteTime] = useState(300); // 5 minutes = 300 seconds
  const [blackTime, setBlackTime] = useState(300);
  const timerRef = useRef(null);

  const board = game.board(); // 2D array: [row][col] -> piece or null
  const turn = game.turn(); // 'w' or 'b'

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((time) => {
          if (time <= 0) {
            clearInterval(timerRef.current);
            alert('Black wins by timeout!');
            return 0;
          }
          return time - 1;
        });
      } else {
        setBlackTime((time) => {
          if (time <= 0) {
            clearInterval(timerRef.current);
            alert('White wins by timeout!');
            return 0;
          }
          return time - 1;
        });
      }
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [turn]);

  const handleSquareClick = (row, col) => {
    const square = 'abcdefgh'[col] + (8 - row);

    if (selectedSquare) {
      const move = { from: selectedSquare, to: square, promotion: 'q' };
      const result = game.move(move);

      if (result) {
        setGame(new Chess(game.fen()));
        setLastMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
      } else {
        setSelectedSquare(null);
      }
    } else {
      const clickedPiece = board[row][col];
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedSquare(square);
      }
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      
      {/* Top Player */}
      <div style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold' }}>
        Black ♚ - {formatTime(blackTime)}
      </div>

      {/* Chessboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 70px)',
        gridTemplateRows: 'repeat(8, 70px)',
        border: '5px solid #654321',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}>
        {board.map((rowArr, rowIndex) =>
          rowArr.map((piece, colIndex) => {
            const squareName = 'abcdefgh'[colIndex] + (8 - rowIndex);
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const backgroundColor = isLight ? '#eedab8' : '#a67c52';
            const isSelected = selectedSquare === squareName;
            const isLastMove = lastMove && (lastMove.from === squareName || lastMove.to === squareName);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                style={{
                  backgroundColor: isSelected ? '#88c0d0' : isLastMove ? '#f7f761' : backgroundColor,
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
              >
                {piece && (
                  <img
                    src={`/pieces/${piece.color}${piece.type.toUpperCase()}.png`}
                    alt=""
                    style={{
                      width: '55px',
                      height: '55px',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Player */}
      <div style={{ marginTop: '10px', fontSize: '20px', fontWeight: 'bold' }}>
        White ♔ - {formatTime(whiteTime)}
      </div>
    </div>
  );
};

export default ChessGame;
