import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';

// Query keys factory
export const queryKeys = {
  // Student queries
  studentProfile: ['studentProfile'],
  studentDashboardStats: ['studentDashboardStats'],
  studentMessages: (limit) => ['studentMessages', limit],
  studentTasks: ['studentTasks'],
  studentAttendance: ['studentAttendance'],
  
  // Admin queries
  adminDetails: ['adminDetails'],
  adminStats: ['adminStats'],
  adminDashboard: ['adminDashboard'],
  adminPendingBookings: ['adminPendingBookings'],
  adminMessages: ['adminMessages'],
  adminRecentActivities: (limit) => ['adminRecentActivities', limit],
  adminRemovalRequests: (status, limit, offset) => ['adminRemovalRequests', status, limit, offset],
};

// Student query hooks
export const useStudentProfile = (options = {}) =>
  useQuery({
    queryKey: queryKeys.studentProfile,
    queryFn: () => apiClient.get('/student/profile'),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });

export const useStudentDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.studentDashboardStats,
    queryFn: () => apiClient.get('/student/dashboard/stats'),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useStudentMessages = (limit = 3) => {
  return useQuery({
    queryKey: queryKeys.studentMessages(limit),
    queryFn: () => apiClient.get(`/student/dashboard/messages?limit=${limit}`),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useStudentTasks = () => {
  return useQuery({
    queryKey: queryKeys.studentTasks,
    queryFn: () => apiClient.get('/student/tasks'),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useStudentAttendance = () => {
  return useQuery({
    queryKey: queryKeys.studentAttendance,
    queryFn: () => apiClient.get('/student/attendance'),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Admin query hooks
export const useAdminDetails = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.adminDetails,
    queryFn: () => apiClient.get('/admin/details'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: () => apiClient.get('/admin/stats'),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => apiClient.get('/admin/analytics/dashboard'),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAdminPendingBookings = () => {
  return useQuery({
    queryKey: queryKeys.adminPendingBookings,
    queryFn: () => apiClient.get('/booking/seat-bookings?status=pending').catch(() => []),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAdminMessages = () => {
  return useQuery({
    queryKey: queryKeys.adminMessages,
    queryFn: () => apiClient.get('/messaging/admin/messages').catch(() => []),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAdminRecentActivities = (limit = 5) => {
  return useQuery({
    queryKey: queryKeys.adminRecentActivities(limit),
    queryFn: () => apiClient.get(`/admin/recent-activities?limit=${limit}`).catch(() => []),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAdminRemovalRequests = (status = 'pending', limit = 5, offset = 0) => {
  return useQuery({
    queryKey: queryKeys.adminRemovalRequests(status, limit, offset),
    queryFn: () => apiClient.get(`/student-removal/requests?status=${status}&limit=${limit}&offset=${offset}`).catch(() => ({ requests: [] })),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Mutation hooks for invalidating queries
export const useInvalidateStudentQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateProfile: () => queryClient.invalidateQueries({ queryKey: queryKeys.studentProfile }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboardStats }),
    invalidateMessages: () => queryClient.invalidateQueries({ queryKey: ['studentMessages'] }),
    invalidateTasks: () => queryClient.invalidateQueries({ queryKey: queryKeys.studentTasks }),
    invalidateAttendance: () => queryClient.invalidateQueries({ queryKey: queryKeys.studentAttendance }),
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboardStats });
      queryClient.invalidateQueries({ queryKey: ['studentMessages'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentTasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentAttendance });
    },
  };
};

export const useInvalidateAdminQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminStats }),
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard }),
    invalidateBookings: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminPendingBookings }),
    invalidateMessages: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminMessages }),
    invalidateActivities: () => queryClient.invalidateQueries({ queryKey: ['adminRecentActivities'] }),
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPendingBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminMessages });
      queryClient.invalidateQueries({ queryKey: ['adminRecentActivities'] });
    },
  };
};
