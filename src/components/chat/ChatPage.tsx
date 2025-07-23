import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Image,
  Video,
  Mic,
  Paperclip,
  Smile,
  Plus,
  Search,
  Phone,
  VideoIcon,
  ArrowLeft,
  X,
  Download,
  Play,
  Pause,
  MoreVertical,
  MessageSquare,
} from "lucide-react";
import { getWebSocketURL } from "../../config/api";

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

interface Sticker {
  id: string;
  url: string;
  category: string;
}

interface ChatPageProps {
  user: User;
  onClose?: () => void;
}

export function ChatPage({ user, onClose }: ChatPageProps) {
  const [conversations, setConversations] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isTyping, setIsTyping] = useState<{ [key: number]: boolean }>({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Common emojis and stickers
  const commonEmojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
  ];

  const stickerCategories = [
    {
      id: "animals",
      name: "Animais",
      stickers: [
        {
          id: "1",
          url: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f436.png",
          category: "animals",
        },
        {
          id: "2",
          url: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f431.png",
          category: "animals",
        },
        {
          id: "3",
          url: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f981.png",
          category: "animals",
        },
      ],
    },
    {
      id: "emotions",
      name: "Emoções",
      stickers: [
        {
          id: "4",
          url: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f60d.png",
          category: "emotions",
        },
        {
          id: "5",
          url: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f970.png",
          category: "emotions",
        },
        {
          id: "6",
          url: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f929.png",
          category: "emotions",
        },
      ],
    },
  ];

  useEffect(() => {
    loadConversations();
    connectWebSocket();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    if (!user.id) return;

    const wsUrl = getWebSocketURL(`/ws/${user.id}?token=${user.token}`);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket conectado para mensagens");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
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

        if (selectedContact && data.sender.id === selectedContact.id) {
          setMessages((prev) => [...prev, newMessage]);
          markMessageAsRead(data.id);
        }

        loadConversations();
      } else if (data.type === "typing") {
        setIsTyping((prev) => ({
          ...prev,
          [data.sender_id]: data.is_typing,
        }));

        if (data.is_typing && typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping((prev) => ({
            ...prev,
            [data.sender_id]: false,
          }));
        }, 3000);
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
            is_online: Math.random() > 0.5, // Mock online status
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

  const sendMessage = async (
    content: string,
    messageType: string = "text",
    mediaUrl?: string,
  ) => {
    if (!selectedContact || (!content.trim() && !mediaUrl)) return;

    try {
      const response = await fetch("http://localhost:8000/messages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          recipient_id: selectedContact.id,
          content: content,
          message_type: messageType,
          media_url: mediaUrl,
        }),
      });

      if (response.ok) {
        const messageData = await response.json();
        const newMessage: Message = {
          id: messageData.id,
          sender: {
            id: user.id,
            first_name: user.name.split(" ")[0],
            last_name: user.name.split(" ").slice(1).join(" "),
            avatar: undefined,
          },
          content: content,
          message_type: messageType,
          media_url: mediaUrl,
          is_read: false,
          created_at: new Date().toISOString(),
          is_own: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        setNewMessage("");
        loadConversations();
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const handleFileUpload = async (file: File, messageType: string) => {
    if (!file || !selectedContact) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("http://localhost:8000/upload/media", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        await sendMessage(file.name, messageType, uploadData.file_path);
      }
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const file = new File([blob], "audio-message.wav", {
          type: "audio/wav",
        });
        await handleFileUpload(file, "audio");
        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setRecordingAudio(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorder && recordingAudio) {
      mediaRecorder.stop();
      setRecordingAudio(false);
      setMediaRecorder(null);
    }
  };

  const handleSendTyping = (isTyping: boolean) => {
    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      selectedContact
    ) {
      wsRef.current.send(
        JSON.stringify({
          type: "typing",
          recipient_id: selectedContact.id,
          is_typing: isTyping,
        }),
      );
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.is_own;

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}
      >
        {!isOwn && (
          <img
            src={
              message.sender.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.first_name + " " + message.sender.last_name)}&background=3B82F6&color=fff`
            }
            alt={`${message.sender.first_name} ${message.sender.last_name}`}
            className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
          />
        )}

        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
            isOwn
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-gray-200 text-gray-800 rounded-bl-sm"
          }`}
        >
          {message.message_type === "text" && (
            <p className="break-words">{message.content}</p>
          )}

          {message.message_type === "image" && message.media_url && (
            <div>
              <img
                src={`http://localhost:8000${message.media_url}`}
                alt="Imagem"
                className="rounded-lg max-w-full h-auto mb-1"
              />
              {message.content && <p className="text-sm">{message.content}</p>}
            </div>
          )}

          {message.message_type === "video" && message.media_url && (
            <div>
              <video
                src={`http://localhost:8000${message.media_url}`}
                controls
                className="rounded-lg max-w-full h-auto mb-1"
              />
              {message.content && <p className="text-sm">{message.content}</p>}
            </div>
          )}

          {message.message_type === "audio" && message.media_url && (
            <div className="flex items-center space-x-2">
              <audio controls className="max-w-full">
                <source
                  src={`http://localhost:8000${message.media_url}`}
                  type="audio/wav"
                />
              </audio>
              {message.content && <p className="text-sm">{message.content}</p>}
            </div>
          )}

          {message.message_type === "sticker" && message.media_url && (
            <img src={message.media_url} alt="Sticker" className="w-20 h-20" />
          )}

          <div
            className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}
          >
            {formatTime(message.created_at)}
            {isOwn && (
              <span className="ml-1">{message.is_read ? "✓✓" : "✓"}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      {/* Sidebar - Conversations */}
      <div
        className={`${isMobile && selectedContact ? "hidden" : "flex"} flex-col w-full md:w-80 border-r border-gray-200 bg-white`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2" />
              Mensagens
            </h1>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  setSelectedContact(conversation);
                  loadMessages(conversation.id);
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedContact?.id === conversation.id
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={
                        conversation.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.first_name + " " + conversation.last_name)}&background=3B82F6&color=fff`
                      }
                      alt={`${conversation.first_name} ${conversation.last_name}`}
                      className="w-12 h-12 rounded-full"
                    />
                    {conversation.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.first_name} {conversation.last_name}
                      </h3>
                      {conversation.last_message && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message?.content ||
                          "Iniciar conversa"}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`${!selectedContact && isMobile ? "hidden" : "flex"} flex-col flex-1`}
      >
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isMobile && (
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}

                  <div className="relative">
                    <img
                      src={
                        selectedContact.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedContact.first_name + " " + selectedContact.last_name)}&background=3B82F6&color=fff`
                      }
                      alt={`${selectedContact.first_name} ${selectedContact.last_name}`}
                      className="w-10 h-10 rounded-full"
                    />
                    {selectedContact.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                    )}
                  </div>

                  <div>
                    <h2 className="font-medium text-gray-900">
                      {selectedContact.first_name} {selectedContact.last_name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isTyping[selectedContact.id]
                        ? "Digitando..."
                        : selectedContact.is_online
                          ? "Online"
                          : "Offline"}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <VideoIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                  <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setNewMessage((prev) => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-2 hover:bg-gray-100 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sticker Picker */}
              {showStickerPicker && (
                <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                  {stickerCategories.map((category) => (
                    <div key={category.id} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {category.stickers.map((sticker) => (
                          <button
                            key={sticker.id}
                            onClick={() => {
                              sendMessage("", "sticker", sticker.url);
                              setShowStickerPicker(false);
                            }}
                            className="p-2 hover:bg-gray-100 rounded"
                          >
                            <img
                              src={sticker.url}
                              alt="Sticker"
                              className="w-12 h-12"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Attachment Options */}
              {showAttachments && (
                <div className="absolute bottom-20 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachments(false);
                    }}
                    className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded text-left"
                  >
                    <Image className="w-5 h-5 text-blue-600" />
                    <span>Foto</span>
                  </button>
                  <button
                    onClick={() => {
                      videoInputRef.current?.click();
                      setShowAttachments(false);
                    }}
                    className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded text-left"
                  >
                    <Video className="w-5 h-5 text-green-600" />
                    <span>Vídeo</span>
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById("file-input")?.click();
                      setShowAttachments(false);
                    }}
                    className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded text-left"
                  >
                    <Paperclip className="w-5 h-5 text-gray-600" />
                    <span>Arquivo</span>
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex-1 relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleSendTyping(e.target.value.length > 0);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(newMessage);
                        handleSendTyping(false);
                      }
                    }}
                    placeholder="Digite uma mensagem..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>

                <button
                  onClick={() => setShowStickerPicker(!showStickerPicker)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span className="text-lg">🎭</span>
                </button>

                <button
                  onClick={
                    recordingAudio ? stopAudioRecording : startAudioRecording
                  }
                  className={`p-2 rounded-full transition-colors ${
                    recordingAudio
                      ? "bg-red-100 text-red-600"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>

                {newMessage.trim() ? (
                  <button
                    onClick={() => {
                      sendMessage(newMessage);
                      handleSendTyping(false);
                    }}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : null}
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "image");
                }}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "video");
                }}
                className="hidden"
              />
              <input
                id="file-input"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "document");
                }}
                className="hidden"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Bate-papo
              </h3>
              <p className="text-gray-500">
                Selecione uma conversa para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
