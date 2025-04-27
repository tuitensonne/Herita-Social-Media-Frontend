import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_BASE_URL ?? "";
const index = SOCKET_URL.indexOf('/api');
const pureBaseUrl = index !== -1 ? SOCKET_URL.substring(0, index) : SOCKET_URL;

const socket: Socket = io(pureBaseUrl, {
  transports: ["websocket"],
});

export default socket;