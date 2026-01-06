import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, Star, Clock, Award, Phone, Video, MoreVertical, Paperclip, AlertCircle } from 'lucide-react';
import { apiService } from '../../../services/api';

interface Message {
  id: number;
  sender: 'user' | 'member';
  text: string;
  timestamp: string;
  read: boolean;
}

interface DietitianInfo {
  id: number;
  name: string;
  email: string;
  category: string;
  phone?: string;
  isOnline?: boolean;
}

interface Conversation {
  id: number;
  userId: number;
  memberId: number;
  createdAt: string;
}

export default function DietitianSupport() {
  const [dietitian, setDietitian] = useState<DietitianInfo | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get userId from localStorage
  const getUserId = useCallback(() => {
    // First try userId
    let userId = localStorage.getItem('userId');
    if (userId) return parseInt(userId);

    // Try parsing from neutrion-user
    const savedUser = localStorage.getItem('neutrion-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        return userData.id || userData.userId || null;
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchDietitianChat(userId);
    } else {
      setError('Please log in to access dietitian support');
      setIsLoading(false);
    }
  }, [getUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDietitianChat = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getUserDietitianChat(userId);
      
      if (response.success && response.data) {
        setDietitian(response.data.dietitian);
        setConversation(response.data.conversation);
        setUnreadCount(response.data.unreadCount);
        
        // Fetch messages for this conversation
        await fetchMessages(response.data.conversation.id);
      } else {
        setError(response.message || 'Failed to load dietitian chat');
      }
    } catch (err: any) {
      console.error('Failed to fetch dietitian chat:', err);
      setError(err.message || 'Failed to load chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await apiService.getChatMessages(conversationId);
      if (response.success && response.data) {
        // Convert senderType to match our interface
        const formattedMessages: Message[] = response.data.messages.map(msg => ({
          id: msg.id,
          sender: msg.senderType as 'user' | 'member',
          text: msg.message,
          timestamp: msg.createdAt,
          read: msg.read
        }));
        setMessages(formattedMessages);
      }
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    const userId = getUserId();
    if (!userId) {
      setError('User not logged in');
      return;
    }

    setIsSending(true);
    try {
      const response = await apiService.sendChatMessage(userId, conversation.id, newMessage.trim());
      
      if (response.success && response.data) {
        const userMessage: Message = {
          id: response.data.id,
          sender: 'user',
          text: response.data.message,
          timestamp: response.data.createdAt,
          read: true
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
      } else {
        setError(response.message || 'Failed to send message');
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleViewMessage = async () => {
    if (!conversation) return;
    
    const userId = getUserId();
    if (!userId) return;

    // Mark messages as read
    try {
      await apiService.markChatMessagesAsRead(conversation.id, 'user');
      setUnreadCount(0);
      
      // Update local messages to show as read
      setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
    } catch (err: any) {
      console.error('Failed to mark messages as read:', err);
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
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5E17A]"></div>
      </div>
    );
  }

  if (error && !dietitian) {
    return (
      <div className="max-w-7xl mx-auto h-[calc(100vh-140px)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dietitian Support</h1>
          <p className="text-gray-600">Chat with your assigned dietitian for personalized guidance</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Chat</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please make sure you have an assigned dietitian. Contact support if you need help.
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dietitian Support</h1>
        <p className="text-gray-600">Chat with your assigned dietitian for personalized guidance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Dietitian Info Sidebar */}
        <div className="bg-white rounded-2xl shadow-md p-6 h-fit">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-[#C5E17A] overflow-hidden mb-3 flex items-center justify-center">
                <User className="w-12 h-12 text-black" />
              </div>
              {dietitian?.isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            
            <h2 className="text-lg font-bold text-gray-900">{dietitian?.name}</h2>
            <p className="text-sm text-gray-600">{dietitian?.category}</p>
            
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-700">4.8</span>
              <span className="text-sm text-gray-400">• Expert</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Response time: ~2 hours</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="w-4 h-4" />
                <span>Certified Nutritionist</span>
              </div>
            </div>

            {unreadCount > 0 && (
              <div className="p-3 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <span className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold">
                    {unreadCount}
                  </span>
                  <span>Unread messages</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <button 
                onClick={handleViewMessage}
                className="w-full flex items-center justify-center gap-2 p-3 bg-[#C5E17A] hover:bg-[#b5d16a] text-black rounded-xl font-medium transition-colors mb-2"
              >
                <Phone className="w-4 h-4" />
                Request Call Back
              </button>
              <button className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                <Video className="w-4 h-4" />
                Schedule Video Call
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-md flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C5E17A] flex items-center justify-center">
                <User className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{dietitian?.name}</h3>
                <p className="text-xs text-gray-500">
                  {dietitian?.isOnline ? 'Online now' : 'Typically responds within 2 hours'}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No messages yet</h3>
                <p className="text-gray-500 text-sm">Start a conversation with your dietitian</p>
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
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              message.sender === 'user'
                                ? 'bg-[#C5E17A] text-black rounded-br-md'
                                : 'bg-gray-100 text-gray-900 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-black/60' : 'text-gray-400'}`}>
                              {formatTime(message.timestamp)}
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
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5E17A] text-sm"
                  disabled={isSending || !dietitian}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending || !dietitian}
                className={`p-3 rounded-xl transition-colors ${
                  newMessage.trim() && !isSending && dietitian
                    ? 'bg-[#C5E17A] hover:bg-[#b5d16a] text-black'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Your dietitian typically responds within 2 hours during business hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

