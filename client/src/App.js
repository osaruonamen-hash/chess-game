import './App.css';  // Make sure this import is at the top of your main component
import React from "react";
import ChessGame from "./components/ChessGame";
import Chat from "./components/Chat";

function App() {
  const roomId = "room123"; // This can be dynamic later

  return (
    <div>
      <h1>Multiplayer Chess</h1>
      <ChessGame roomId={roomId} />
      <Chat roomId={roomId} />
    </div>
  );
}

export default App;
