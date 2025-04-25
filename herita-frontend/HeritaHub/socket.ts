import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:8080";

const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

export default socket;
