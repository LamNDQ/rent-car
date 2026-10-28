"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  isConnected: boolean;
  statusText?: string;
  onBack?: () => void;
}

export default function ChatHeader({
  title,
  isConnected,
  statusText,
  onBack,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-900/90 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 transition mr-1"
            title="Back to Homepage"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        
        {/* Simple Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-100 font-semibold text-lg border border-zinc-700">
          {title.charAt(0).toUpperCase()}
        </div>
        
        <div>
          <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Connection status indicator */}
            <span
              className={`h-2.5 w-2.5 rounded-full shadow-sm transition-all duration-300 ${
                isConnected
                  ? "bg-emerald-500 shadow-emerald-500/50"
                  : "bg-rose-500 shadow-rose-500/50"
              }`}
            />
            <span className="text-xs text-zinc-400">
              {statusText || (isConnected ? "Online" : "Disconnected")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
