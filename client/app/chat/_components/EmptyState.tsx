"use client";

import React from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";

interface EmptyStateProps {
  role: string;
  onGoBack: () => void;
}

export default function EmptyState({ role, onGoBack }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-3 p-8 bg-zinc-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-zinc-400 border border-zinc-800">
        <MessageSquare className="h-6 w-6" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-zinc-200">
          {role === "admin" ? "No active chat selected" : "No conversation active"}
        </h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
          {role === "admin"
            ? "Please choose a customer conversation from the sidebar to view history and start typing."
            : "The chat room is currently empty or loading. If you need support, start by typing a message."}
        </p>
      </div>
      {/* Quick back home button */}
      <button
        onClick={onGoBack}
        className="mt-4 text-xs font-semibold text-zinc-300 hover:text-zinc-100 inline-flex items-center gap-1.5 transition"
      >
        <ArrowLeft className="h-3 w-3" /> Go back to dashboard
      </button>
    </div>
  );
}
