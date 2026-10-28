"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    onSendMessage(text.trim());
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-zinc-700 bg-zinc-950 px-6 py-4 flex items-center gap-3"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? "Connecting to chat..." : "Type a message..."}
        disabled={disabled}
        className="flex-1 rounded-xl bg-zinc-900 border border-zinc-850 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 transition hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
      >
        <Send className="h-4.5 w-4.5" />
      </button>
    </form>
  );
}
