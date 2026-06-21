import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminMessages, useAdminPendingBookings } from '../../lib/queries';

function PanelShell({ title, actionLabel, actionTo, children }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-lg shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default function AppAdminHomePanels() {
  const navigate = useNavigate();
  const { data: pendingBookings = [], isLoading: bookingsLoading } = useAdminPendingBookings();
  const { data: messagesResponse = [], isLoading: messagesLoading } = useAdminMessages();

  const recentMessages = useMemo(() => {
    if (!Array.isArray(messagesResponse)) return [];
    return messagesResponse
      .filter((m) => (m?.sender_type || '').toLowerCase() === 'student')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [messagesResponse]);

  return (
    <div className="space-y-4">
      <PanelShell title="Pending Bookings" actionLabel="View all" actionTo="/admin/booking-management">
        {bookingsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : pendingBookings.length > 0 ? (
          <ul className="divide-y divide-white/10">
            {pendingBookings.slice(0, 4).map((booking) => (
              <li key={booking.id}>
                <button
                  type="button"
                  onClick={() => navigate('/admin/booking-management')}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{booking.name || 'Guest'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{booking.mobile || '—'}</p>
                    </div>
                    <span className="text-[11px] text-amber-300 shrink-0 bg-amber-500/15 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  </div>
                  {booking.created_at && (
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-400 text-sm py-8">No pending bookings</p>
        )}
      </PanelShell>

      <PanelShell title="Messages from Students" actionLabel="Open chat" actionTo="/admin/messages">
        {messagesLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : recentMessages.length > 0 ? (
          <ul className="divide-y divide-white/10">
            {recentMessages.slice(0, 4).map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() =>
                    navigate('/admin/messages', {
                      state: {
                        selectedStudent: {
                          student_id: message.student_id,
                          student_name: message.student_name || message.sender_email || 'Student',
                        },
                      },
                    })
                  }
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-white truncate">
                      {message.student_name || message.sender_email || 'Student'}
                    </span>
                    {message.created_at && (
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2 mt-1">{message.message}</p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-400 text-sm py-8">No messages yet</p>
        )}
      </PanelShell>
    </div>
  );
}
