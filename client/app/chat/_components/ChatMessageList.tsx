"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "@app/types";
import ChatMessageItem from "./ChatMessageItem";

interface ChatMessageListProps {
  messages: Message[];
  currentUserId: string;
}

export default function ChatMessageList({
  messages,
  currentUserId,
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-900 px-6 py-4 flex flex-col gap-4">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-zinc-500 gap-1.5">
          <p className="text-sm font-medium">No messages yet</p>
          <p className="text-xs text-zinc-600">Start the conversation below</p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessageItem
            key={message._id}
            message={message}
            isMe={message.senderId === currentUserId}
          />
        ))
      )}
      {/* Invisible anchor for scrolling */}
      <div ref={scrollRef} />
    </div>
  );
}
