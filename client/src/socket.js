// client/src/socket.js
import { io } from "socket.io-client";

const socket = io("http://your-backend-url:3001");
export default socket;
