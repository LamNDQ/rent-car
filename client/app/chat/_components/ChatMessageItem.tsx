"use client";

import React from "react";
import { Message } from "@app/types";

interface ChatMessageItemProps {
  message: Message;
  isMe: boolean;
}

export default function ChatMessageItem({ message, isMe }: ChatMessageItemProps) {
  // Format the creation date to a readable HH:MM time
  const formatTime = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isTemp = message._id.startsWith("temp-");

  return (
    <div
      className={`flex w-full flex-col ${
        isMe ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-opacity duration-200 ${
          isMe
            ? "bg-zinc-100 text-zinc-900 rounded-br-none"
            : "bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700"
        } ${isTemp ? "opacity-70 animate-pulse" : "opacity-100"}`}
      >
        {/* Message Content */}
        <p className="wrap-break-words whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
      </div>
      
      {/* Timestamp under bubble */}
      <span className="mt-1 px-1 text-[10px] text-zinc-500 font-medium tracking-wide">
        {formatTime(message.createdAt)}
        {isMe && isTemp && " • Sending..."}
      </span>
    </div>
  );
}
