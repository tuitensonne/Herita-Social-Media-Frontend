import { io, Socket } from "socket.io-client";
const SOCKET_URL = process.env.EXPO_BASE_URL;

const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

export default socket;
