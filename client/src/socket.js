// client/src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // your backend port
export default socket;
