import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Image,
  Video,
  Mic,
  Plus,
  Search,
  Phone,
  VideoIcon,
  Smile,
  Paperclip,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  token: string;
}

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  last_message?: {
    content: string;
    message_type: string;
    created_at: string;
    is_read: boolean;
    is_own: boolean;
  };
  unread_count: number;
  is_online?: boolean;
}

interface Message {
  id: number;
  sender: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  content: string;
  message_type: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
  is_own: boolean;
}

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function MessagesModal({ isOpen, onClose, user }: MessagesModalProps) {
  const [conversations, setConversations] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState<{ [key: number]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  useEffect(() => {
    console.log("MessagesModal isOpen changed:", isOpen);
    if (isOpen) {
      loadConversations();
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    if (!user.id) return;

    const wsUrl = `ws://localhost:8000/ws/${user.id}?token=${user.token}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket conectado para mensagens");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        // Nova mensagem recebida
        const newMessage: Message = {
          id: data.id,
          sender: data.sender,
          content: data.content,
          message_type: data.message_type,
          media_url: data.media_url,
          is_read: data.is_read,
          created_at: data.created_at,
          is_own: false,
        };

        // Se a conversa está aberta, adicionar à lista de mensagens
        if (selectedContact && data.sender.id === selectedContact.id) {
          setMessages((prev) => [...prev, newMessage]);
          markMessageAsRead(data.id);
        }

        // Atualizar lista de conversas
        loadConversations();
      } else if (data.type === "typing") {
        // Indicador de digitaç��o
        setIsTyping((prev) => ({
          ...prev,
          [data.sender_id]: data.is_typing,
        }));

        // Clear typing after 3 seconds
        if (data.is_typing) {
          if (typingTimeoutRef.current[data.sender_id]) {
            clearTimeout(typingTimeoutRef.current[data.sender_id]);
          }

          typingTimeoutRef.current[data.sender_id] = setTimeout(() => {
            setIsTyping((prev) => ({
              ...prev,
              [data.sender_id]: false,
            }));
          }, 3000);
        }
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
    };
  };

  const loadConversations = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/messages/conversations",
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(
          data.map((conv: any) => ({
            id: conv.user.id,
            first_name: conv.user.first_name,
            last_name: conv.user.last_name,
            avatar: conv.user.avatar,
            last_message: conv.last_message,
            unread_count: conv.unread_count,
            is_online: false, // TODO: Implementar status online
          })),
        );
      }
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    }
  };

  const loadMessages = async (contactId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/messages/conversation/${contactId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);

        // Marcar mensagens não lidas como lidas
        const unreadMessages = data.filter(
          (msg: Message) => !msg.is_read && !msg.is_own,
        );
        for (const msg of unreadMessages) {
          markMessageAsRead(msg.id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      await fetch(`http://localhost:8000/messages/${messageId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Notificar via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "message_read",
            message_id: messageId,
          }),
        );
      }
    } catch (error) {
      console.error("Erro ao marcar mensagem como lida:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const response = await fetch("http://localhost:8000/messages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          recipient_id: selectedContact.id,
          content: newMessage,
          message_type: "text",
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            ...sentMessage,
            is_own: true,
          },
        ]);
        setNewMessage("");
        loadConversations(); // Atualizar lista de conversas
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (
      !selectedContact ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    )
      return;

    wsRef.current.send(
      JSON.stringify({
        type: "typing",
        recipient_id: selectedContact.id,
        is_typing: isTyping,
      }),
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    sendTypingIndicator(true);

    // Stop typing indicator after 1 second of no typing
    setTimeout(() => {
      sendTypingIndicator(false);
    }, 1000);
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedContact) return;

    try {
      // Upload file first
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("http://localhost:8000/upload/media", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha no upload do arquivo");
      }

      const uploadData = await uploadResponse.json();

      // Send message with media
      const response = await fetch("http://localhost:8000/messages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          recipient_id: selectedContact.id,
          content: file.name,
          message_type: uploadData.file_type,
          media_url: uploadData.file_path,
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            ...sentMessage,
            is_own: true,
          },
        ]);
        loadConversations();
      }
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      alert("Erro ao enviar arquivo");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl h-[80vh] flex overflow-hidden">
        {/* Conversations List */}
        <div
          className={`${isMobile && selectedContact ? "hidden" : "block"} w-full md:w-80 border-r border-gray-200 flex flex-col`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Mensagens</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((contact) => (
              <button
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact);
                  loadMessages(contact.id);
                }}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                  selectedContact?.id === contact.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={
                        contact.avatar ||
                        `https://ui-avatars.com/api/?name=${contact.first_name}+${contact.last_name}&background=3B82F6&color=fff`
                      }
                      alt={`${contact.first_name} ${contact.last_name}`}
                      className="w-12 h-12 rounded-full"
                    />
                    {contact.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {contact.first_name} {contact.last_name}
                      </h3>
                      {contact.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {contact.unread_count > 99
                            ? "99+"
                            : contact.unread_count}
                        </span>
                      )}
                    </div>

                    {contact.last_message && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {contact.last_message.message_type === "text"
                            ? contact.last_message.content
                            : `📎 ${contact.last_message.message_type}`}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatTime(contact.last_message.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma conversa encontrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`${isMobile && !selectedContact ? "hidden" : "flex"} flex-1 flex flex-col`}
        >
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isMobile && (
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="p-2 hover:bg-gray-100 rounded-full mr-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}

                  <img
                    src={
                      selectedContact.avatar ||
                      `https://ui-avatars.com/api/?name=${selectedContact.first_name}+${selectedContact.last_name}&background=3B82F6&color=fff`
                    }
                    alt={`${selectedContact.first_name} ${selectedContact.last_name}`}
                    className="w-10 h-10 rounded-full"
                  />

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedContact.first_name} {selectedContact.last_name}
                    </h3>
                    {isTyping[selectedContact.id] && (
                      <p className="text-sm text-blue-600">Digitando...</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                    <VideoIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_own ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md ${
                          message.is_own
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        } rounded-lg p-3`}
                      >
                        {message.message_type === "text" ? (
                          <p>{message.content}</p>
                        ) : message.message_type === "image" ? (
                          <div>
                            <img
                              src={`http://localhost:8000${message.media_url}`}
                              alt={message.content}
                              className="rounded max-w-full h-auto"
                            />
                            {message.content && (
                              <p className="mt-2 text-sm">{message.content}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">{message.content}</span>
                          </div>
                        )}

                        <div
                          className={`text-xs mt-1 ${
                            message.is_own ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Digite uma mensagem..."
                      className="w-full p-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-blue-600">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-600">
                  Escolha uma conversa para começar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
