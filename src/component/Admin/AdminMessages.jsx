import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const AdminMessages = () => {
  const navigate = useNavigate();
  const { userType, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  
  // Get auto-selected student from navigation state
  const location = useLocation();
  const autoSelectStudent = location?.state?.selectedStudent;

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    fetchStudents();
  }, [userType, navigate]);

  // Auto-select student if provided from navigation state
  useEffect(() => {
    if (autoSelectStudent && students.length > 0) {
      const student = students.find(s => s.student_id === autoSelectStudent.student_id);
      if (student) {
        setSelectedStudent(student);
      }
    }
  }, [autoSelectStudent, students]);

  useEffect(() => {
    if (selectedStudent) {
      fetchMessages();
    }
  }, [selectedStudent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchStudents = async () => {
    try {
      let response = await apiClient.get('/messaging/admin/students');
      // Fallback: if empty, fetch raw students and map minimal fields
      if (!Array.isArray(response) || response.length === 0) {
        const raw = await apiClient.get('/admin/students');
        response = (Array.isArray(raw) ? raw : []).map((s) => ({
          student_id: String(s.id || s.student_id || ''),
          student_name: s.name || s.student_name || 'Student',
          email: s.email || '',
          latest_message: null,
          latest_message_time: null,
          unread_count: 0
        }));
      }
      setStudents(response || []);
      // Auto-select a student for immediate chat view
      if ((response || []).length > 0) {
        if (autoSelectStudent) {
          const match = response.find(s => s.student_id === autoSelectStudent.student_id);
          setSelectedStudent(match || response[0]);
        } else if (!selectedStudent) {
          setSelectedStudent(response[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedStudent) return;
    
    try {
      const response = await apiClient.get(`/messaging/admin/messages?student_id=${selectedStudent.student_id}`);
      // Reverse the order so newest messages appear at the bottom
      setMessages(response.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      if (isBroadcast) {
        await apiClient.post('/messaging/admin/broadcast', { message: newMessage });
      } else {
        const messageData = {
          message: newMessage,
          student_id: selectedStudent.student_id,
          is_broadcast: false
        };
        await apiClient.post('/messaging/admin/send-message', messageData);
      }
      
      setNewMessage('');
      // Refresh messages to show the new message
      if (selectedStudent) {
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredStudents = (students || []).filter(student => {
    const name = (student.student_name || '').toLowerCase();
    const id = (student.student_id || '').toLowerCase();
    const term = (searchTerm || '').toLowerCase();
    return name.includes(term) || id.includes(term);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
            <p className="text-white/70 mt-4">Loading messages...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="flex h-screen pt-16 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>
        {/* Left Sidebar - Students List */}
        <div className="w-80 bg-slate-800/60 backdrop-blur-lg border-r border-slate-700/50 flex flex-col relative z-10">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <h1 className="text-xl font-semibold text-white mb-4">Students</h1>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="flex-1 overflow-y-auto">
            {filteredStudents.map((student) => (
              <div
                key={student.student_id}
                className={`p-4 border-b border-slate-700/30 cursor-pointer hover:bg-slate-700/30 transition-all duration-200 ${
                  selectedStudent?.student_id === student.student_id ? 'bg-purple-500/20 border-l-4 border-l-purple-400' : ''
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-sm">
                        {(student.student_name || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {student.student_name || 'Unnamed Student'}
                    </p>
                    {student.unread_count > 0 && (
                      <div className="mt-1">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                          {student.unread_count} unread
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Broadcast Toggle */}
          <div className="p-4 border-t border-slate-700/50">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBroadcast}
                onChange={(e) => setIsBroadcast(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-600 rounded bg-slate-700"
              />
              <span className="text-sm text-slate-300">Broadcast to all students</span>
            </label>
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="flex-1 flex flex-col relative z-10">
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="bg-slate-800/60 backdrop-blur-lg border-b border-slate-700/50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-sm">
                        {selectedStudent.student_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {selectedStudent.student_name}
                    </h2>
                  </div>
                  {isBroadcast && (
                    <span className="ml-auto inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      Broadcast Mode
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-slate-900/30 p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💬</div>
                      <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
                      <p className="text-slate-400">Start a conversation with {selectedStudent.student_name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_type === 'admin'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                              : 'bg-slate-800/60 text-white border border-slate-700/50 backdrop-blur-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_type === 'admin' ? 'text-purple-100' : 'text-slate-400'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-slate-800/60 backdrop-blur-lg border-t border-slate-700/50 p-4">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={
                        isBroadcast 
                          ? "Send a broadcast message to all students..." 
                          : `Message ${selectedStudent.student_name}...`
                      }
                      className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows="1"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                      disabled={sending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-500/25"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-900/30">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to Messages</h3>
                <p className="text-slate-400">Select a student from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
