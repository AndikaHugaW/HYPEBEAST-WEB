"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  unread: boolean;
};

type Chat = {
  id: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: Message[];
};

export default function AdminChat() {
  const { user, profile, loading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && user && profile?.role === 'admin') {
      fetchChats();
    }
  }, [user, profile, loading]);

  const fetchChats = async () => {
    // TODO: Replace with actual API call
    const mockChats: Chat[] = [
      {
        id: "1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        lastMessage: "When will my order arrive?",
        timestamp: "2 min ago",
        unreadCount: 2,
        messages: [
          { id: "1", sender: "customer", message: "Hello, I have a question about my order", timestamp: "10:30 AM", unread: false },
          { id: "2", sender: "admin", message: "Hello! How can I help you?", timestamp: "10:32 AM", unread: false },
          { id: "3", sender: "customer", message: "When will my order arrive?", timestamp: "10:35 AM", unread: true },
        ],
      },
      {
        id: "2",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        lastMessage: "Thank you for the quick response!",
        timestamp: "1 hour ago",
        unreadCount: 0,
        messages: [
          { id: "1", sender: "customer", message: "I need to return a product", timestamp: "9:00 AM", unread: false },
          { id: "2", sender: "admin", message: "Sure, I can help with that. What's the order number?", timestamp: "9:05 AM", unread: false },
          { id: "3", sender: "customer", message: "Thank you for the quick response!", timestamp: "9:10 AM", unread: false },
        ],
      },
    ];
    setChats(mockChats);
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;
    // TODO: Send message via API
    setMessage("");
  };

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || (profile && profile.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Chat</h1>
            <p className="text-gray-600">Communicate with customers in real-time</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedChat === chat.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{chat.customerName}</div>
                          <div className="text-sm text-gray-500">{chat.customerEmail}</div>
                        </div>
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 truncate">{chat.lastMessage}</div>
                      <div className="text-xs text-gray-400 mt-1">{chat.timestamp}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <Card className="lg:col-span-2">
              {selectedChatData ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedChatData.customerName}</CardTitle>
                        <p className="text-sm text-gray-500">{selectedChatData.customerEmail}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                      {selectedChatData.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender === "admin"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${msg.sender === "admin" ? "text-blue-100" : "text-gray-500"}`}>
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="h-[600px] flex items-center justify-center">
                  <p className="text-gray-500">Select a conversation to start chatting</p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

