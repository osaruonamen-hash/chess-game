// server/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", // Localhost for development
      "https://chess-game-5.onrender.com", // URL for deployment
    ],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection Setup
mongoose.connect(
  "mongodb+srv://vladimirehigiator8:x6IFb5pDWc1vq6af@cluster0.lvycxd0.mongodb.net/chessDB?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// MongoDB Models
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", UserSchema);

const LeaderboardSchema = new mongoose.Schema({
  username: { type: String, required: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
});
const Leaderboard = mongoose.model("Leaderboard", LeaderboardSchema);

const GameHistorySchema = new mongoose.Schema({
  players: [String],
  moves: [String],
  winner: String,
});
const GameHistory = mongoose.model("GameHistory", GameHistorySchema);

// Socket.IO setup
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_game", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("move", ({ roomId, move }) => {
    socket.to(roomId).emit("opponent_move", move);
  });

  socket.on("chat", ({ roomId, message }) => {
    socket.to(roomId).emit("receive_chat", message);
  });

  // When the game ends, update the leaderboard and save the game history
  socket.on("game_over", async ({ winner, loser, moves }) => {
    // Update leaderboard
    await Leaderboard.updateOne({ username: winner }, { $inc: { wins: 1 } }, { upsert: true });
    await Leaderboard.updateOne({ username: loser }, { $inc: { losses: 1 } }, { upsert: true });

    // Save game history
    const newGameHistory = new GameHistory({
      players: [winner, loser],
      moves,
      winner,
    });
    await newGameHistory.save();
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Routes for Leaderboard and Game History

// Get leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find().sort({ wins: -1 });
    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

// Get game history
app.get("/game-history", async (req, res) => {
  try {
    const gameHistory = await GameHistory.find();
    res.json(gameHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching game history" });
  }
});

// User registration route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// User login route (for authentication)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "your_jwt_secret", { expiresIn: "1h" });
    res.send({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Server running on port ${port}`));
