import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';

const Messaging = forwardRef(({ userType, recipientId = null, recipientName = null }, ref) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [recipientId]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages]);

  useEffect(() => {
    // Only auto-scroll if user is near bottom or it's a new message
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (isNearBottom || messages.length === 0) {
        scrollToBottom(true);
      }
    } else {
      scrollToBottom(true);
    }
  }, [messages]);

  // Handle scroll detection
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    }
  };

  // Add sample messages for demonstration
  const addSampleMessage = () => {
    const sampleMessages = [
      {
        id: Date.now() + 1,
        message: "Hello! Welcome to the library chat. How can I help you today?",
        sender_type: 'admin',
        admin_name: recipientName || 'Admin',
        created_at: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        message: "I'm here to assist you with any questions about library services, booking seats, or general inquiries.",
        sender_type: 'admin',
        admin_name: recipientName || 'Admin',
        created_at: new Date(Date.now() - 60000).toISOString()
      }
    ];
    
    setMessages(prev => [...prev, ...sampleMessages]);
  };

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    fetchMessages,
    addSampleMessage
  }));

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        if (smooth) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          container.scrollTop = container.scrollHeight;
        }
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      }
    }, 100);
  };

  const markMessagesAsRead = async () => {
    try {
      // Mark unread messages as read
      const unreadMessages = messages.filter(msg => 
        msg.sender_type === 'admin' && !msg.read
      );
      
      for (const message of unreadMessages) {
        try {
          await apiClient.put(`/messaging/messages/${message.id}/read`);
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      // Use different endpoints based on user type
      const endpoint = userType === 'admin' ? '/messaging/admin/messages' : '/messaging/messages';
      const response = await apiClient.get(endpoint);
      // Reverse the order so newest messages appear at bottom (ascending order)
      setMessages((response || []).reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);
    
    // Auto-scroll to bottom when sending
    scrollToBottom(false);
    
    try {
      let messageData;
      let endpoint;

      if (userType === 'admin') {
        messageData = {
          message: messageText,
          student_id: recipientId
        };
        endpoint = '/messaging/admin/send-message';
      } else {
        messageData = {
          message: messageText,
          admin_id: recipientId
        };
        endpoint = '/messaging/send-message';
      }

      await apiClient.post(endpoint, messageData);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setNewMessage(messageText);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageStatus = (message) => {
    if (message.sender_type === 'student') {
      return (
        <div className="flex items-center space-x-1 mt-1">
          <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-slate-400">{formatTime(message.created_at)}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 mt-1">
        <span className="text-xs text-slate-400">{formatTime(message.created_at)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
          <p className="text-slate-400 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* Messages List */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-0 scroll-smooth chat-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#475569 #1e293b'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
            <p className="text-slate-400 max-w-sm">
              Send a message to {recipientName || 'the admin'} to get started. They'll respond as soon as possible.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isUser = message.sender_type === 'student';
              const isBroadcast = message.is_broadcast;
              const showAvatar = index === 0 || messages[index - 1].sender_type !== message.sender_type;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 space-x-reverse`}>
                    {/* Avatar */}
                    {!isUser && showAvatar && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">
                          {recipientName?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`relative ${isUser ? 'ml-12' : 'mr-12'} group/message`}>
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                          isUser
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md hover:from-indigo-700 hover:to-purple-700'
                            : isBroadcast
                            ? 'bg-gradient-to-r from-amber-600/80 to-orange-600/80 text-white rounded-bl-md border border-amber-500/50 hover:from-amber-700/90 hover:to-orange-700/90'
                            : 'bg-slate-700/80 text-white rounded-bl-md border border-slate-600/50 hover:bg-slate-700/90'
                        }`}
                      >
                        {/* Broadcast indicator */}
                        {isBroadcast && (
                          <div className="flex items-center space-x-1 mb-2">
                            <svg className="w-4 h-4 text-amber-200" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-amber-200 font-medium">Broadcast Message</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                        {getMessageStatus(message)}
                      </div>
                      
                      {/* Message Tail */}
                      <div
                        className={`absolute top-0 w-0 h-0 ${
                          isUser
                            ? 'right-0 transform translate-x-full border-l-[8px] border-l-indigo-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                            : isBroadcast
                            ? 'left-0 transform -translate-x-full border-r-[8px] border-r-amber-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                            : 'left-0 transform -translate-x-full border-r-[8px] border-r-slate-700 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {recipientName?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="bg-slate-700/80 text-white px-4 py-3 rounded-2xl rounded-bl-md border border-slate-600/50">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-24 right-6 z-10">
          <button
            onClick={() => scrollToBottom(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border border-white/10"
            title="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {/* Message Input - Compact Design */}
      <div className="border-t border-slate-700/50 bg-slate-800/90 backdrop-blur-sm flex-shrink-0 animate-slide-up">
        <div className="p-3 sm:p-4">
          <form onSubmit={sendMessage} className="flex items-end space-x-2 sm:space-x-3">
            <div className="flex-1 relative">
              <div className="relative bg-slate-700/50 border border-slate-600/50 rounded-xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:shadow-md focus-within:shadow-indigo-500/10 transition-all duration-300 hover:border-slate-500/50">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    userType === 'admin' 
                      ? `Message ${recipientName || 'student'}...` 
                      : 'Message admin...'
                  }
                  className="w-full px-3 py-2 bg-transparent text-white placeholder-slate-400 focus:outline-none resize-none min-h-[36px] max-h-24 text-sm rounded-xl"
                  rows={1}
                  disabled={sending}
                  style={{
                    height: 'auto',
                    minHeight: '36px'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                  }}
                />
                {/* Send button inside input */}
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="absolute right-1.5 bottom-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-1.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>
          
          {/* Input Footer - Compact */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 px-1 space-y-0.5 sm:space-y-0">
            <p className="text-xs text-slate-500">
              Press Enter to send, Shift+Enter for new line
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="hidden sm:inline">•</span>
              <span>Messages are end-to-end encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Messaging.displayName = 'Messaging';

export default Messaging;
