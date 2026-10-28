"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@app/hooks";
import { useSocket } from "@app/hooks/useSocket";
import { chatApi } from "@app/lib/api";
import { ChatRoom, Message, SenderRole, MessageStatus } from "@app/types";
import { Loader2 } from "lucide-react";
import ChatHeader from "./_components/ChatHeader";
import ChatMessageList from "./_components/ChatMessageList";
import ChatInput from "./_components/ChatInput";
import AdminSidebar from "./_components/AdminSidebar";
import EmptyState from "./_components/EmptyState";

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();

  // Chat Room state
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Loading states
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Determine chatRoomId based on role
  const chatRoomId = user?.role === "admin" ? selectedRoomId : user?.id || null;

  // Initialize socket connection using the existing hook
  const { socket, isConnected } = useSocket(
    user?.id || null,
    user?.role || null,
  );

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  // Fetch Chat Rooms (Admin only)
  useEffect(() => {
    if (user?.role !== "admin") return;

    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const data = await chatApi.getRooms();
        setRooms(data);
      } catch (err) {
        console.error("Failed to load chat rooms:", err);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [user]);

  // Fetch Message History when room changes
  useEffect(() => {
    if (!chatRoomId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const data = await chatApi.getMessages(chatRoomId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load message history:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  // Handle Realtime Websocket Events
  useEffect(() => {
    if (!socket || !chatRoomId) return;

    // Join room & mark as read on connection / room switch
    socket.emit("join_room", { chatRoomId });
    socket.emit("mark_read", { chatRoomId });

    // Listen to incoming messages globally
    const handleReceiveMessage = (msg: Message) => {
      // If message belongs to current active room, append to messages
      if (msg.chatRoomId === chatRoomId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;

          // Replace matching temporary message
          const tempIndex = prev.findIndex(
            (m) => m._id.startsWith("temp-") && m.content === msg.content,
          );
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = msg;
            return updated;
          }
          return [...prev, msg];
        });

        // Auto mark as read if message is from the other side
        if (msg.senderId !== user?.id) {
          socket.emit("mark_read", { chatRoomId });
        }
      }

      // Update the room list last message and unread count
      if (user?.role === "admin") {
        setRooms((prevRooms) => {
          const roomExists = prevRooms.some((r) => r._id === msg.chatRoomId);

          // If the room doesn't exist in our list yet, re-fetch rooms to get the new room
          if (!roomExists) {
            chatApi.getRooms().then(setRooms).catch(console.error);
            return prevRooms;
          }

          const updatedRooms = prevRooms.map((room) => {
            if (room._id === msg.chatRoomId) {
              return {
                ...room,
                lastMessage: msg.content,
                unreadCount:
                  msg.chatRoomId === chatRoomId ? 0
                  : msg.senderId !== user.id ? room.unreadCount + 1
                  : room.unreadCount,
                updatedAt: msg.createdAt,
              };
            }
            return room;
          });

          return [...updatedRooms].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          );
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, chatRoomId, user?.id, user?.role]);

  // Send Message Handler
  const handleSendMessage = (content: string) => {
    if (!socket || !chatRoomId || !user) return;

    // Create a temporary message to display immediately on UI
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      chatRoomId,
      senderId: user.id,
      senderRole: user.role as SenderRole,
      content,
      status: MessageStatus.SENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Append to messages list
    setMessages((prev) => [...prev, tempMessage]);

    // Send via socket
    socket.emit("send_message", {
      chatRoomId,
      content,
    });
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setMessages([]);
    setRooms((prev) =>
      prev.map((r) => (r._id === roomId ? { ...r, unreadCount: 0 } : r)),
    );
  };

  const handleGoBack = () => {
    if (user?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  // Loading screen for auth checking
  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-100">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  // Not logged in or unauthorized
  if (!user) return null;

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* SIDEBAR (Admin Only) */}
      {user.role === "admin" && (
        <AdminSidebar
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={handleSelectRoom}
          loading={loadingRooms}
          onBack={handleGoBack}
        />
      )}

      {/* MAIN CHAT AREA */}
      <div className="flex flex-1 flex-col h-full bg-zinc-900">
        {chatRoomId ?
          <>
            <ChatHeader
              title={
                user.role === "admin" ?
                  rooms.find((r) => r._id === chatRoomId)?.username ||
                  "Customer"
                : "Chat with Admin"
              }
              isConnected={!!isConnected}
              onBack={() => router.push("/")}
            />

            {loadingMessages ?
              <div className="flex-1 flex items-center justify-center bg-zinc-900">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
              </div>
            : <ChatMessageList messages={messages} currentUserId={user.id} />}

            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={!isConnected}
            />
          </>
        : <EmptyState role={user.role} onGoBack={handleGoBack} />}
      </div>
    </div>
  );
}
