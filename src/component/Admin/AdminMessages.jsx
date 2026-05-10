import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';

/* ── tiny inline icons ─────────────────────────────── */
const IconSearch = () => (
  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconSend = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);
const IconBack = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const IconBroadcast = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

/* ── avatar ─────────────────────────────────────────── */
const Avatar = ({ name, size = 10 }) => (
  <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-purple-500 to-pink-500
      flex items-center justify-center shadow-lg flex-shrink-0`}>
    <span className="text-white font-semibold text-sm">
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  </div>
);

/* ── helpers ─────────────────────────────────────────── */
const formatTime = (ts) => {
  const d = new Date(ts);
  const diffH = (Date.now() - d) / 3_600_000;
  return diffH < 24
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString();
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const AdminMessages = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { userType } = useAuth();

  const [students, setStudents]           = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [messages, setMessages]           = useState([]);
  const [newMessage, setNewMessage]       = useState('');
  const [sending, setSending]             = useState(false);
  const [isBroadcast, setIsBroadcast]     = useState(false);
  const [searchTerm, setSearchTerm]       = useState('');

  /* mobile: which panel is showing — 'list' | 'chat' */
  const [mobileView, setMobileView] = useState('list');

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const autoSelectStudent = location?.state?.selectedStudent;

  /* ── auth guard ─────────────────────────────────── */
  useEffect(() => {
    if (userType !== 'admin') navigate('/admin/auth');
  }, [userType, navigate]);

  /* ── fetch students ─────────────────────────────── */
  const fetchStudents = useCallback(async () => {
    try {
      let response = await apiClient.get('/messaging/admin/students');
      if (!Array.isArray(response) || response.length === 0) {
        const raw = await apiClient.get('/admin/students');
        response = (Array.isArray(raw) ? raw : []).map((s) => ({
          student_id: String(s.id || s.student_id || ''),
          student_name: s.name || s.student_name || 'Student',
          email: s.email || '',
          latest_message: null,
          latest_message_time: null,
          unread_count: 0,
        }));
      }
      setStudents(response || []);
      // auto-select
      if ((response || []).length > 0) {
        const match = autoSelectStudent
          ? response.find(s => s.student_id === autoSelectStudent.student_id)
          : null;
        const first = match || response[0];
        setSelectedStudent(first);
      }
    } catch (err) {
      console.error('fetchStudents:', err);
    } finally {
      setLoading(false);
    }
  }, [autoSelectStudent]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  /* ── fetch messages ─────────────────────────────── */
  const fetchMessages = useCallback(async () => {
    if (!selectedStudent) return;
    try {
      const res = await apiClient.get(
        `/messaging/admin/messages?student_id=${selectedStudent.student_id}`
      );
      setMessages(res.reverse());
    } catch (err) {
      console.error('fetchMessages:', err);
    }
  }, [selectedStudent]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* ── select student (mobile-aware) ─────────────── */
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setMobileView('chat');
  };

  /* ── send ───────────────────────────────────────── */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      if (isBroadcast) {
        await apiClient.post('/messaging/admin/broadcast', { message: newMessage });
      } else {
        await apiClient.post('/messaging/admin/send-message', {
          message: newMessage,
          student_id: selectedStudent.student_id,
          is_broadcast: false,
        });
      }
      setNewMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      if (selectedStudent) await fetchMessages();
    } catch (err) {
      console.error('sendMessage:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  /* ── auto-grow textarea ─────────────────────────── */
  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  const filteredStudents = (students || []).filter(s => {
    const term = searchTerm.toLowerCase();
    return (s.student_name || '').toLowerCase().includes(term)
        || (s.student_id || '').toLowerCase().includes(term);
  });

  /* ── loading ────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-purple-400" />
          <p className="text-white/60 text-sm">Loading messages…</p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div
      className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}
    >
      {/* decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500  rounded-full blur-3xl opacity-10 animate-pulse" />
      </div>

      {/* ── main layout: flex row on md+, column on mobile ── */}
      <div className="relative z-10 flex flex-1 overflow-hidden" style={{ paddingTop: '4rem' /* navbar height */ }}>

        {/* ════════════════════════════════════════════
            SIDEBAR – student list
            Hidden on mobile when chat is open
        ════════════════════════════════════════════ */}
        <aside
          className={`
            flex flex-col bg-slate-800/70 backdrop-blur-lg border-r border-slate-700/50
            /* mobile: full width, shown/hidden based on mobileView */
            absolute inset-0 transition-transform duration-300 ease-in-out
            md:static md:w-72 lg:w-80 md:translate-x-0 md:flex
            ${mobileView === 'list' ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ minWidth: 0 }}
        >
          {/* sidebar header */}
          <div className="p-4 border-b border-slate-700/50 flex-shrink-0">
            <h1 className="text-xl font-semibold text-white mb-3">Students</h1>
            {/* search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Search students…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-700/60 border border-slate-600/50 rounded-xl
                           text-sm text-white placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* student list */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {filteredStudents.length === 0 ? (
              <p className="text-slate-400 text-sm text-center mt-10 px-4">No students found.</p>
            ) : (
              filteredStudents.map(student => (
                <button
                  key={student.student_id}
                  onClick={() => handleSelectStudent(student)}
                  className={`w-full text-left p-4 border-b border-slate-700/30
                    hover:bg-slate-700/40 transition-colors duration-150
                    ${selectedStudent?.student_id === student.student_id
                      ? 'bg-purple-500/20 border-l-4 border-l-purple-400'
                      : 'border-l-4 border-l-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={student.student_name} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {student.student_name || 'Unnamed Student'}
                      </p>
                      {student.unread_count > 0 && (
                        <span className="inline-flex mt-1 px-2 py-0.5 text-xs font-semibold rounded-full
                                         bg-red-500/20 text-red-300 border border-red-500/30">
                          {student.unread_count} unread
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* broadcast toggle – bottom of sidebar */}
          <div className="flex-shrink-0 p-4 border-t border-slate-700/50">
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div
                onClick={() => setIsBroadcast(b => !b)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200
                  ${isBroadcast ? 'bg-orange-500' : 'bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                  transition-transform duration-200 ${isBroadcast ? 'translate-x-5' : ''}`} />
              </div>
              <div className="flex items-center gap-1.5">
                <IconBroadcast />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  Broadcast to all students
                </span>
              </div>
            </label>
          </div>
        </aside>

        {/* ════════════════════════════════════════════
            CHAT PANEL
            Hidden on mobile when list is showing
        ════════════════════════════════════════════ */}
        <main
          className={`
            flex flex-col flex-1 min-w-0
            /* mobile: full width, shown/hidden */
            absolute inset-0 transition-transform duration-300 ease-in-out
            md:static md:translate-x-0
            ${mobileView === 'chat' ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {selectedStudent ? (
            <>
              {/* chat header */}
              <div className="flex-shrink-0 bg-slate-800/70 backdrop-blur-lg border-b border-slate-700/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* back button – only visible on mobile */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
                    aria-label="Back to student list"
                  >
                    <IconBack />
                  </button>

                  <Avatar name={selectedStudent.student_name} />

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-white truncate">
                      {selectedStudent.student_name}
                    </h2>
                  </div>

                  {isBroadcast && (
                    <span className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold
                                     rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      <IconBroadcast /> Broadcast
                    </span>
                  )}
                </div>
              </div>

              {/* messages area */}
              <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-900/30 p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <span className="text-5xl">💬</span>
                    <h3 className="text-lg font-medium text-white">No messages yet</h3>
                    <p className="text-slate-400 text-sm">
                      Start a conversation with {selectedStudent.student_name}
                    </p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[75%] sm:max-w-sm lg:max-w-md px-4 py-2 rounded-2xl text-sm
                          ${msg.sender_type === 'admin'
                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-sm shadow-lg shadow-purple-900/30'
                            : 'bg-slate-800/80 text-white border border-slate-700/50 backdrop-blur-sm rounded-bl-sm'
                          }
                        `}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <p className={`text-xs mt-1 text-right ${
                          msg.sender_type === 'admin' ? 'text-purple-200/70' : 'text-slate-500'
                        }`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* message input */}
              <div className="flex-shrink-0 bg-slate-800/70 backdrop-blur-lg border-t border-slate-700/50 px-4 py-3">
                <form onSubmit={sendMessage} className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={handleTextareaChange}
                      placeholder={
                        isBroadcast
                          ? 'Broadcast to all students…'
                          : `Message ${selectedStudent.student_name}…`
                      }
                      rows={1}
                      style={{ minHeight: '44px', maxHeight: '120px', resize: 'none', overflowY: 'auto' }}
                      className="w-full px-4 py-2.5 bg-slate-700/60 border border-slate-600/50 rounded-xl
                                 text-white placeholder-slate-400 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyDown={e => {
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
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
                               bg-gradient-to-r from-purple-600 to-pink-600
                               hover:from-purple-500 hover:to-pink-500
                               disabled:opacity-40 disabled:cursor-not-allowed
                               text-white text-sm font-medium transition-all duration-200
                               shadow-lg shadow-purple-900/40"
                  >
                    {sending
                      ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                      : <IconSend />
                    }
                    <span className="hidden sm:inline">{sending ? 'Sending…' : 'Send'}</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* no student selected (desktop empty state) */
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center p-8 bg-slate-900/20">
              <span className="text-6xl">💬</span>
              <h3 className="text-xl font-semibold text-white">Welcome to Messages</h3>
              <p className="text-slate-400 text-sm max-w-xs">
                Select a student from the sidebar to start a conversation.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminMessages;
