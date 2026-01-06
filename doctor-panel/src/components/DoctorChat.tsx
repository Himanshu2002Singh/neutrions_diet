import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, Clock, MoreVertical, Paperclip, Search, MessageCircle, AlertCircle } from 'lucide-react';
import { 
  getMemberConversations, 
  getMemberChatMessages, 
  sendMemberChatMessage, 
  markMemberChatMessagesAsRead
} from '../services/api';

interface ChatConversation {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: 'user' | 'member';
  message: string;
  read: boolean;
  createdAt: string;
}

export default function DoctorChat() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get memberId from localStorage
  const getMemberId = useCallback(() => {
    const userStr = localStorage.getItem('doctor_panel_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const memberId = getMemberId();
    if (memberId) {
      fetchConversations(memberId);
    } else {
      setError('Please log in to access messages');
      setIsLoading(false);
    }
  }, [getMemberId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async (memberId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMemberConversations(memberId);
      if (response.success && response.data) {
        setConversations(response.data);
        
        // Auto-select first conversation with unread messages
        const unreadConversation = response.data.find(c => c.unreadCount > 0);
        if (unreadConversation) {
          setSelectedConversation(unreadConversation);
          await fetchMessages(unreadConversation.id);
        }
      } else {
        setError('Failed to load conversations');
      }
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    setIsLoadingMessages(true);
    try {
      const response = await getMemberChatMessages(conversationId);
      if (response.success && response.data) {
        const formattedMessages: ChatMessage[] = response.data.messages.map(msg => ({
          ...msg,
          senderType: msg.senderType as 'user' | 'member'
        }));
        setMessages(formattedMessages);

        // Mark messages as read
        await markMemberChatMessagesAsRead(conversationId, 'member');
      }
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSelectConversation = async (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setError(null);
    await fetchMessages(conversation.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const memberId = getMemberId();
    if (!memberId) {
      setError('Member not logged in');
      return;
    }

    setIsSending(true);
    try {
      const response = await sendMemberChatMessage(memberId, selectedConversation.id, newMessage.trim());
      
      if (response.success && response.data) {
        const newMsg: ChatMessage = {
          ...response.data,
          senderType: 'member'
        };
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      } else {
        setError('Failed to send message');
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatLastMessageTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(timestamp);
  };

  const filteredConversations = conversations.filter(conv => 
    conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupMessagesByDate = () => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Messages</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Make sure you have assigned users to chat with.
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Chat with your assigned users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Conversations List */}
        <div className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400">Users will appear here when they message you</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-gray-900 truncate">
                          {conversation.user?.name || 'Unknown User'}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatLastMessageTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.user?.name || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.user?.email}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No messages yet</h3>
                    <p className="text-gray-500 text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {Object.entries(messageGroups).map(([date, msgs]) => (
                      <div key={date}>
                        <div className="flex items-center justify-center mb-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {date}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {msgs.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.senderType === 'member' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                  message.senderType === 'member'
                                    ? 'bg-blue-600 text-white rounded-br-md'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <p className={`text-xs mt-1 ${message.senderType === 'member' ? 'text-blue-200' : 'text-gray-400'}`}>
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your reply..."
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={isSending}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className={`p-3 rounded-xl transition-colors ${
                      newMessage.trim() && !isSending
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Conversation</h3>
              <p className="text-gray-500 max-w-md">
                Choose a conversation from the list to view messages and chat with your assigned users
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

