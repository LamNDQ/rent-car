"use client"

import { ChatRoom, Message } from "@app/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; 

export const chatApi = {
  /* Fetch recent chat rooms (for admin only) */
  getRooms: async (): Promise<ChatRoom[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch chat rooms. ${response.status}`);
      }

      const data: ChatRoom[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error in chatApi.getRooms:", error);
      throw error; 
    }
  },

  /* Fetch message history for a specific chat room */
  getMessages: async (roomId: string): Promise<Message[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages for room ${roomId}. HTTP Status: ${response.status}`);
      }

      const data: Message[] = await response.json();
      return data;
    } catch (error) {
      console.error(`Error in chatApi.getMessages for room ${roomId}:`, error);
      throw error;
    }
  },
};