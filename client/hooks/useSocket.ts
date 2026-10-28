import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (userId: string | null, role: string | null) => {
  const [socket, setSocket] = useState<Socket | null>();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId || !role) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000/chat";

    const newSocket = io(socketUrl, {
      query: { userId, role },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      setSocket(newSocket);
      setIsConnected(true);
      console.log("Socket.IO connection established successfully");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket.IO disconnected");
    });

    newSocket.on("connect_error", (err: Error) => {
      console.error(`Socket Connection error:`, err.message);
    });
    return () => {
      newSocket.disconnect();
    };
  }, [userId, role]);

  return {
    socket,
    isConnected,
  };
};
