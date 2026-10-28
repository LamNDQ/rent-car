"use client";

import React from "react";
import { MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import { ChatRoom } from "@app/types";

interface AdminSidebarProps {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  loading: boolean;
  onBack: () => void;
}

export default function AdminSidebar({
  rooms,
  selectedRoomId,
  onSelectRoom,
  loading,
  onBack,
}: AdminSidebarProps) {
  return (
    <div className="flex w-full md:w-80 flex-col border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-md shrink-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-zinc-400" />
          <h1 className="text-lg font-semibold text-zinc-100">Conversations</h1>
        </div>
        <button
          onClick={onBack}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 transition"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center text-zinc-500 py-8 text-sm">
            No active conversations
          </div>
        ) : (
          rooms.map((room) => {
            const isActive = room._id === selectedRoomId;
            return (
              <button
                key={room._id}
                onClick={() => onSelectRoom(room._id)}
                className={`flex flex-col w-full text-left rounded-xl p-3.5 transition ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100"
                    : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-semibold text-sm truncate pr-2 text-zinc-100">
                    {room.username}
                  </span>
                  {room.isVip && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      VIP
                    </span>
                  )}
                </div>

                {room.lastMessage && (
                  <p className="text-xs truncate mt-1 text-zinc-400 max-w-[90%]">
                    {room.lastMessage}
                  </p>
                )}

                {room.unreadCount > 0 && !isActive && (
                  <div className="flex justify-end mt-1">
                    <span className="bg-zinc-100 text-zinc-900 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                      {room.unreadCount} new
                    </span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
