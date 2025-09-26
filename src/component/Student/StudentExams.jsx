import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const StudentExams = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam] = useState({
    exam_name: '',
    exam_date: '',
    notes: ''
  });
  const [filter, setFilter] = useState('upcoming'); // upcoming, completed, all

  useEffect(() => {
    if (userType !== 'student') {
      navigate('/student/login');
      return;
    }
    fetchExams();
  }, [userType, navigate]);

  const fetchExams = async () => {
    try {
      const response = await apiClient.get('/student/exams');
      setExams(response);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/student/exams', newExam);
      setNewExam({ exam_name: '', exam_date: '', notes: '' });
      setShowAddModal(false);
      fetchExams();
    } catch (error) {
      console.error('Error adding exam:', error);
      alert('Failed to add exam. Please try again.');
    }
  };

  const handleUpdateExam = async (examId, isCompleted) => {
    try {
      await apiClient.put(`/student/exams/${examId}`, { is_completed: isCompleted });
      fetchExams();
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Failed to update exam. Please try again.');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await apiClient.del(`/student/exams/${examId}`);
        fetchExams();
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Failed to delete exam. Please try again.');
      }
    }
  };

  const getDaysUntilExam = (examDate) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExamStatus = (exam) => {
    const daysUntil = getDaysUntilExam(exam.exam_date);
    if (exam.is_completed) return { status: 'completed', color: 'text-green-500 bg-green-50', text: 'Completed' };
    if (daysUntil < 0) return { status: 'overdue', color: 'text-red-500 bg-red-50', text: 'Overdue' };
    if (daysUntil === 0) return { status: 'today', color: 'text-orange-500 bg-orange-50', text: 'Today' };
    if (daysUntil <= 7) return { status: 'soon', color: 'text-yellow-500 bg-yellow-50', text: `${daysUntil} days` };
    return { status: 'upcoming', color: 'text-blue-500 bg-blue-50', text: `${daysUntil} days` };
  };

  const filteredExams = exams.filter(exam => {
    const now = new Date();
    const examDate = new Date(exam.exam_date);
    
    if (filter === 'upcoming') return examDate >= now && !exam.is_completed;
    if (filter === 'completed') return exam.is_completed;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Exams</h1>
          <p className="text-slate-300">Track your upcoming exams and study schedule</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Upcoming ({exams.filter(e => new Date(e.exam_date) >= new Date() && !e.is_completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Completed ({exams.filter(e => e.is_completed).length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All ({exams.length})
            </button>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            + Add Exam
          </button>
        </div>

        {/* Exams List */}
        <div className="space-y-4">
          {filteredExams.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-white mb-2">No exams found</h3>
              <p className="text-slate-400">
                {filter === 'all' 
                  ? "You don't have any exams scheduled yet. Add your first exam to get started!"
                  : `No ${filter} exams found.`
                }
              </p>
            </div>
          ) : (
            filteredExams.map((exam) => {
              const examStatus = getExamStatus(exam);
              const daysUntil = getDaysUntilExam(exam.exam_date);
              
              return (
                <div
                  key={exam.id}
                  className={`bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6 transition-all duration-200 hover:shadow-xl ${
                    exam.is_completed ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={exam.is_completed}
                          onChange={(e) => handleUpdateExam(exam.id, e.target.checked)}
                          className="w-5 h-5 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
                        />
                        <h3 className={`text-xl font-semibold ${exam.is_completed ? 'line-through text-slate-400' : 'text-white'}`}>
                          {exam.exam_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${examStatus.color}`}>
                          {examStatus.text}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-slate-400 mb-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(exam.exam_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{new Date(exam.exam_date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                        
                        {!exam.is_completed && daysUntil >= 0 && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>{daysUntil === 0 ? 'Today' : `${daysUntil} days left`}</span>
                          </div>
                        )}
                      </div>
                      
                      {exam.notes && (
                        <p className={`text-sm ${exam.is_completed ? 'text-slate-500' : 'text-slate-300'}`}>
                          {exam.notes}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New Exam</h2>
            
            <form onSubmit={handleAddExam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Exam Name *
                </label>
                <input
                  type="text"
                  value={newExam.exam_name}
                  onChange={(e) => setNewExam({ ...newExam, exam_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter exam name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Exam Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={newExam.exam_date}
                  onChange={(e) => setNewExam({ ...newExam, exam_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={newExam.notes}
                  onChange={(e) => setNewExam({ ...newExam, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter any notes or preparation details"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  Add Exam
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-700 text-slate-300 py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StudentExams;
