import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Messaging from '../common/Messaging';

const StudentMessages = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagingRef = useRef(null);

  useEffect(() => {
    if (userType !== 'student') {
      navigate('/student/login');
      return;
    }
    fetchAdminInfo();
  }, [userType, navigate]);

  const fetchAdminInfo = async () => {
    try {
      // Get student profile which includes admin/library information
      const response = await apiClient.get('/student/profile');
      
      // Extract admin info from student profile
      if (response) {
        setAdminInfo({
          user_id: response.admin_id,
          admin_name: response.library_name ? `${response.library_name} Admin` : 'Library Admin',
          library_name: response.library_name || 'Library'
        });
      }
    } catch (error) {
      console.error('Error fetching admin info:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
            <p className="text-white/70 mt-4">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex flex-col overflow-hidden">
      <Header />
      
      {/* Main Chat Interface - Full Height */}
      <div className="flex-1 flex flex-col pt-20 px-4 sm:px-6 lg:px-8 min-h-0">
        <div className="flex-1 max-w-7xl mx-auto w-full min-h-0">
          <div className="h-full bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col overflow-hidden min-h-0">
              {adminInfo ? (
                <>
                  {/* Chat Header - Compact */}
                  <div className="p-3 sm:p-4 border-b border-slate-700/50 bg-slate-700/30 rounded-t-2xl flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm sm:text-base">
                            {adminInfo.admin_name?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white truncate">
                          {adminInfo.admin_name || 'Library Admin'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          <p className="text-xs text-emerald-400 font-medium">Online</p>
                          <span className="text-slate-400">•</span>
                          <p className="text-xs text-slate-400 truncate">
                            {adminInfo.library_name || 'Library'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Messages Area */}
                  <div className="flex-1 overflow-hidden min-h-0 relative">
                    <Messaging 
                      ref={messagingRef}
                      userType="student" 
                      recipientId={adminInfo.user_id}
                      recipientName={adminInfo.admin_name}
                    />
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-slate-400 text-8xl mb-6">💬</div>
                    <h3 className="text-2xl font-bold text-white mb-3">No Admin Found</h3>
                    <p className="text-slate-400 text-lg">Unable to load admin information</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMessages;
