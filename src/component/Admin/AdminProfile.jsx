import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { lookupBankByIfsc } from '../../utils/ifscLookup';

const BASE_MONTH_OPTIONS = [1, 3, 6, 9, 12];

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user, userType, logout, setUser, isLoggedIn, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState({
    admin_name: '',
    email: '',
    phone: '',
    library_name: '',
    library_address: '',
    library_phone: '',
    library_description: '',
    profile_image: null,
    total_seats: 0,
    latitude: null,
    longitude: null,
    has_shift_system: false,
    shift_timings: [],
    referral_code: '',
    bank_account_holder_name: '',
    bank_account_number: '',
    bank_ifsc_code: '',
    bank_name: '',
    bank_branch_name: '',
    razorpay_linked_account_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanData, setNewPlanData] = useState({
    months: 1,
    amount: '',
    discounted_amount: '',
    plan_scope: 'non_shift',
    shift_time: ''
  });
  const [savingPlan, setSavingPlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editPlanData, setEditPlanData] = useState({
    months: 1,
    amount: '',
    discounted_amount: '',
    plan_scope: 'non_shift',
    shift_time: ''
  });
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [generatingRefCode, setGeneratingRefCode] = useState(false);
  const [ifscLookupLoading, setIfscLookupLoading] = useState(false);

  const getPlanScopeLabel = (plan) => {
    if (plan?.is_shift_plan) {
      return plan?.shift_time ? `Shift: ${plan.shift_time}` : 'Shift-specific';
    }
    return profileData.has_shift_system ? 'Non-shift / All shifts' : 'General';
  };

  const getAvailableMonthsForScope = (scope, shiftTime = '') => {
    const normalizedShift = (shiftTime || '').trim();
    const usedMonths = new Set(
      (subscriptionPlans || [])
        .filter((plan) => {
          if (scope === 'shift') {
            if (!normalizedShift) return false;
            return Boolean(plan.is_shift_plan) && (plan.shift_time || '').trim() === normalizedShift;
          }
          return !plan.is_shift_plan;
        })
        .map((plan) => Number(plan.months))
    );
    return BASE_MONTH_OPTIONS.filter((month) => !usedMonths.has(month));
  };

  const addPlanMonthOptions = getAvailableMonthsForScope(
    newPlanData.plan_scope,
    newPlanData.shift_time
  );

  const parseShiftTiming = (timing) => {
    if (typeof timing === 'string') {
      const [start = '', end = ''] = timing.split(' - ').map((s) => s.trim());
      return { start, end };
    }
    return {
      start: timing?.start || '',
      end: timing?.end || ''
    };
  };

  const normalizeShiftTimings = (timings) => {
    if (!Array.isArray(timings)) return [];
    return timings.map(parseShiftTiming);
  };

  const formatShiftTimingsForApi = (timings) => {
    if (!Array.isArray(timings)) return [];
    return timings
      .map(parseShiftTiming)
      .filter((timing) => timing.start && timing.end)
      .map((timing) => `${timing.start} - ${timing.end}`);
  };

  useEffect(() => {
    // Wait for auth to be initialized
    if (authLoading) return;
    
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    
    if (isLoggedIn && user) {
      fetchProfileData();
      loadReferralCode();
    }
  }, [userType, navigate, authLoading, isLoggedIn, user]);

  useEffect(() => {
    if (!showAddPlanModal) return;
    const current = Number(newPlanData.months);
    if (addPlanMonthOptions.length === 0) return;
    if (!addPlanMonthOptions.includes(current)) {
      setNewPlanData((prev) => ({ ...prev, months: addPlanMonthOptions[0] }));
    }
  }, [
    showAddPlanModal,
    newPlanData.months,
    newPlanData.plan_scope,
    newPlanData.shift_time,
    subscriptionPlans
  ]);

  const fetchProfileData = async () => {
    try {
      const response = await apiClient.get('/admin/details');
      setProfileData({
        admin_name: response.admin_name || '',
        email: user?.email || '',
        phone: response.mobile_no || '',
        library_name: response.library_name || '',
        library_address: response.address || '',
        library_phone: response.mobile_no || '',
        library_description: '',
        profile_image: null,
        total_seats: response.total_seats || 0,
        latitude: response.latitude || null,
        longitude: response.longitude || null,
        has_shift_system: response.has_shift_system || false,
        shift_timings: normalizeShiftTimings(response.shift_timings),
        referral_code: response.referral_code || '',
        bank_account_holder_name: response.bank_account_holder_name || '',
        bank_account_number: response.bank_account_number || '',
        bank_ifsc_code: response.bank_ifsc_code || '',
        bank_name: response.bank_name || '',
        bank_branch_name: response.bank_branch_name || '',
        razorpay_linked_account_id: response.razorpay_linked_account_id || ''
      });
      
      // Fetch subscription plans after profile data is loaded
      fetchSubscriptionPlans();
    } catch (error) {
      console.error('Error fetching profile data:', error);
      
      // Handle authentication errors
      if ((error.message || '').toLowerCase().includes('not authenticated') || 
          error.message.includes('401') || 
          error.message.includes('Unauthorized') ||
          error.message.includes('403')) {
        setMessage({ type: 'error', text: 'Authentication failed. Please log in again.' });
        // Redirect to login after a short delay
        setTimeout(() => {
          logout();
          navigate('/admin/auth');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadReferralCode = async () => {
    try {
      const codes = await apiClient.get('/referral/codes');
      const adminCode = (codes || []).find(c => c.type === 'admin');
      setReferralCode(adminCode ? adminCode.code : null);
    } catch (error) {
      console.error('Error loading referral code:', error);
    }
  };

  const handleGenerateReferralCode = async () => {
    try {
      setGeneratingRefCode(true);
      await apiClient.post('/referral/codes', { type: 'admin' });
      await loadReferralCode();
      setMessage({ type: 'success', text: 'Referral code generated successfully' });
    } catch (error) {
      console.error('Error generating referral code:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to generate referral code' });
    } finally {
      setGeneratingRefCode(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      setLoadingPlans(true);
      // Use admin-specific endpoint to get only current admin's subscription plans
      const res = await apiClient.get('/admin/subscription-plans');
      // API returns PaginatedResponse { items, total, page, page_size }
      const plans = Array.isArray(res) ? res : (res?.items ?? []);
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      
      // Handle authentication errors
      if (error.message.includes('Could not validate credentials') || 
          error.message.includes('401') || 
          error.message.includes('Unauthorized')) {
        setMessage({ type: 'error', text: 'Authentication failed. Please log in again.' });
        setTimeout(() => {
          logout();
          navigate('/admin/auth');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to load subscription plans' });
      }
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      setSavingPlan(true);
      setMessage({ type: '', text: '' });

      // Validate form data
      if (addPlanMonthOptions.length === 0) {
        setMessage({ type: 'error', text: 'No duration is available for the selected plan scope.' });
        return;
      }
      if (!newPlanData.amount || parseFloat(newPlanData.amount) <= 0) {
        setMessage({ type: 'error', text: 'Please enter a valid amount' });
        return;
      }

      if (newPlanData.discounted_amount && parseFloat(newPlanData.discounted_amount) >= parseFloat(newPlanData.amount)) {
        setMessage({ type: 'error', text: 'Discounted amount must be less than regular amount' });
        return;
      }

      if (profileData.has_shift_system && newPlanData.plan_scope === 'shift') {
        if (!newPlanData.shift_time) {
          setMessage({ type: 'error', text: 'Select a shift for shift-specific plans' });
          return;
        }
      }

      const isShiftPlan = profileData.has_shift_system && newPlanData.plan_scope === 'shift';
      const planData = {
        months: parseInt(newPlanData.months, 10),
        amount: parseFloat(newPlanData.amount),
        discounted_amount: newPlanData.discounted_amount ? parseFloat(newPlanData.discounted_amount) : null,
        is_custom: ![1, 3, 6, 9, 12].includes(parseInt(newPlanData.months, 10)),
        is_active: true,
        is_shift_plan: isShiftPlan,
        shift_time: isShiftPlan ? newPlanData.shift_time : null
      };

      // Create the plan
      console.log('Sending plan data:', planData);
      await apiClient.post('/subscription/plans', planData);

      // Reset form and close modal
      setNewPlanData({
        months: 1,
        amount: '',
        discounted_amount: '',
        plan_scope: 'non_shift',
        shift_time: ''
      });
      setShowAddPlanModal(false);
      setMessage({ type: 'success', text: 'Subscription plan created successfully!' });

      // Refresh the plans list
      fetchSubscriptionPlans();

    } catch (error) {
      console.error('Error saving subscription plan:', error);
      let errorMessage = 'Failed to create subscription plan. Please try again.';
      
      // Handle specific error cases
      if (error.message.includes('422')) {
        errorMessage = 'Invalid data provided. Please check your input and try again.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Bad request. Please check your input and try again.';
      } else if (error.message.includes('409')) {
        errorMessage = error.message || 'A plan with this duration and scope already exists.';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSavingPlan(false);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setEditPlanData({
      months: plan.months,
      amount: plan.amount.toString(),
      discounted_amount: plan.discounted_amount ? plan.discounted_amount.toString() : '',
      plan_scope: plan.is_shift_plan ? 'shift' : 'non_shift',
      shift_time: plan.shift_time || ''
    });
    setShowEditPlanModal(true);
  };

  const handleUpdatePlan = async () => {
    try {
      setSavingPlan(true);
      setMessage({ type: '', text: '' });

      // Validate form data
      if (!editPlanData.amount || parseFloat(editPlanData.amount) <= 0) {
        setMessage({ type: 'error', text: 'Please enter a valid amount' });
        return;
      }

      if (editPlanData.discounted_amount && parseFloat(editPlanData.discounted_amount) >= parseFloat(editPlanData.amount)) {
        setMessage({ type: 'error', text: 'Discounted amount must be less than regular amount' });
        return;
      }

      if (profileData.has_shift_system && editPlanData.plan_scope === 'shift') {
        if (!editPlanData.shift_time) {
          setMessage({ type: 'error', text: 'Select a shift for shift-specific plans' });
          return;
        }
      }

      const isShiftPlan = profileData.has_shift_system && editPlanData.plan_scope === 'shift';
      const planData = {
        months: parseInt(editPlanData.months, 10),
        amount: parseFloat(editPlanData.amount),
        discounted_amount: editPlanData.discounted_amount ? parseFloat(editPlanData.discounted_amount) : null,
        is_custom: ![1, 3, 6, 9, 12].includes(parseInt(editPlanData.months, 10)),
        is_active: true,
        is_shift_plan: isShiftPlan,
        shift_time: isShiftPlan ? editPlanData.shift_time : null
      };

      // Update the plan
      await apiClient.put(`/subscription/plans/${editingPlan.id}`, planData);

      // Reset form and close modal
      setEditPlanData({
        months: 1,
        amount: '',
        discounted_amount: '',
        plan_scope: 'non_shift',
        shift_time: ''
      });
      setShowEditPlanModal(false);
      setEditingPlan(null);
      setMessage({ type: 'success', text: 'Subscription plan updated successfully!' });

      // Refresh the plans list
      fetchSubscriptionPlans();

    } catch (error) {
      console.error('Error updating subscription plan:', error);
      let errorMessage = 'Failed to update subscription plan. Please try again.';
      
      // Handle specific error cases
      if (error.message.includes('422')) {
        errorMessage = 'Invalid data provided. Please check your input and try again.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Bad request. Please check your input and try again.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Subscription plan not found.';
      } else if (error.message.includes('409')) {
        errorMessage = error.message || 'A plan with this duration and scope already exists.';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) {
      return;
    }

    try {
      setDeletingPlan(planId);
      await apiClient.del(`/subscription/plans/${planId}`);
      setMessage({ type: 'success', text: 'Subscription plan deleted successfully!' });
      fetchSubscriptionPlans();
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      setMessage({ type: 'error', text: 'Failed to delete subscription plan. Please try again.' });
    } finally {
      setDeletingPlan(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIfscBlur = async () => {
    const currentIfsc = (profileData.bank_ifsc_code || '').trim().toUpperCase();
    if (!currentIfsc) return;
    try {
      setIfscLookupLoading(true);
      const result = await lookupBankByIfsc(currentIfsc);
      setProfileData((prev) => ({
        ...prev,
        bank_ifsc_code: result.ifsc,
        bank_name: result.bankName || prev.bank_name,
        bank_branch_name: result.branchName || prev.bank_branch_name,
      }));
      setMessage({ type: '', text: '' });
    } catch (lookupError) {
      setMessage({ type: 'error', text: lookupError?.message || 'Could not fetch bank details from IFSC.' });
    } finally {
      setIfscLookupLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        profile_image: file
      }));
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setEditing(false);
    // Reload original data
    fetchProfileData();
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const ifscValue = (profileData.bank_ifsc_code || '').trim().toUpperCase();
      const accountValue = (profileData.bank_account_number || '').trim();
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      const accountRegex = /^\d{9,18}$/;

      const formattedShiftTimings = profileData.has_shift_system
        ? formatShiftTimingsForApi(profileData.shift_timings)
        : [];
      if (profileData.has_shift_system && formattedShiftTimings.length === 0) {
        setMessage({ type: 'error', text: 'Please add at least one valid shift timing.' });
        return;
      }

      if (ifscValue && !ifscRegex.test(ifscValue)) {
        setMessage({ type: 'error', text: 'Please enter a valid IFSC code (example: HDFC0001234).' });
        return;
      }

      if (accountValue && !accountRegex.test(accountValue)) {
        setMessage({ type: 'error', text: 'Please enter a valid account number (9 to 18 digits).' });
        return;
      }

      // Prepare data according to backend schema
      const updateData = {
        admin_name: profileData.admin_name,
        library_name: profileData.library_name,
        mobile_no: profileData.phone,
        address: profileData.library_address,
        total_seats: profileData.total_seats,
        latitude: profileData.latitude,
        longitude: profileData.longitude,
        has_shift_system: profileData.has_shift_system,
        shift_timings: formattedShiftTimings,
        referral_code: profileData.referral_code,
        bank_account_holder_name: profileData.bank_account_holder_name?.trim() || null,
        bank_account_number: accountValue || null,
        bank_ifsc_code: ifscValue || null,
        bank_name: profileData.bank_name?.trim() || null,
        bank_branch_name: profileData.bank_branch_name?.trim() || null,
        razorpay_linked_account_id: profileData.razorpay_linked_account_id?.trim() || null
      };

      const response = await apiClient.put('/admin/details', updateData);

      // Update user context with new data
      setUser(prev => ({
        ...prev,
        admin_name: response.admin_name,
        library_name: response.library_name
      }));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleShiftTimingChange = (index, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      shift_timings: prev.shift_timings.map((timing, i) =>
        i === index ? { ...parseShiftTiming(timing), [field]: value } : parseShiftTiming(timing)
      )
    }));
  };

  const handleAddShiftTiming = () => {
    setProfileData((prev) => ({
      ...prev,
      shift_timings: [...normalizeShiftTimings(prev.shift_timings), { start: '09:00', end: '13:00' }]
    }));
  };

  const handleRemoveShiftTiming = (index) => {
    setProfileData((prev) => ({
      ...prev,
      shift_timings: normalizeShiftTimings(prev.shift_timings).filter((_, i) => i !== index)
    }));
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
            <p className="text-white/70 mt-4">Initializing authentication...</p>
          </div>
        </div>
        </div>
    );
  }

  // Show loading while profile data is being fetched
  if (loading && isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
            <p className="text-white/70 mt-4">Loading profile...</p>
          </div>
        </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="flex-grow container mx-auto px-4 pt-24 pb-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative">
          

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}>
              {message.text}
            </div>
          )}

          {/* Profile Overview Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl mb-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Profile Image */}
              <div className="text-center lg:text-left">
                <div className="inline-block relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto lg:mx-0 shadow-lg">
                    {profileData.profile_image ? (
                      <img 
                        src={typeof profileData.profile_image === 'string' 
                          ? profileData.profile_image 
                          : URL.createObjectURL(profileData.profile_image)
                        } 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-white text-4xl font-bold">
                        {profileData.admin_name?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  )}
                </div>
                {editing && (
                  <p className="text-white/70 text-sm">Click to change profile picture</p>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {profileData.admin_name || 'Admin Name'}
                </h2>
                <p className="text-xl text-purple-300 mb-4">
                  {profileData.library_name || 'Library Name'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-white/80">{profileData.phone || 'Phone not set'}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-white/80">{profileData.library_address || 'Address not set'}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-white/80">{profileData.total_seats || 0} Total Seats</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white/80">
                      {profileData.has_shift_system ? 'Shift System Enabled' : 'No Shift System'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex flex-col gap-3">
                {!editing ? (
                  <button
                    onClick={handleEdit}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </div>
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowAddPlanModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Subscription Plan
                  </div>
                </button>
                <button
                  onClick={() => navigate('/admin/referral')}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
                >
                  Referral to your friend
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Personal Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="admin_name"
                      value={profileData.admin_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                      {profileData.admin_name || 'Not set'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Admin Email
                  </label>
                  <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70">
                    {profileData.email || 'Not set'}
                  </div>
                  <p className="text-white/50 text-xs mt-1">This is your login email and cannot be changed</p>
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                      {profileData.phone || 'Not set'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Total Seats
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      name="total_seats"
                      value={profileData.total_seats}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter total number of seats"
                      min="1"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                      {profileData.total_seats || 0} seats
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Library Information */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Library Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Library Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="library_name"
                      value={profileData.library_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter library name"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                      {profileData.library_name || 'Not set'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Library Address
                  </label>
                  {editing ? (
                    <textarea
                      name="library_address"
                      value={profileData.library_address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Enter library address"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white min-h-[76px]">
                      {profileData.library_address || 'Not set'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Referral Code
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="referral_code"
                      value={profileData.referral_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter referral code (optional)"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white flex items-center justify-between">
                      <span>{referralCode || 'Not set'}</span>
                      {!referralCode && (
                        <button
                          onClick={handleGenerateReferralCode}
                          disabled={generatingRefCode}
                          className="ml-3 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm rounded-md disabled:opacity-50"
                        >
                          {generatingRefCode ? 'Generating...' : 'Generate'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="has_shift_system"
                      checked={profileData.has_shift_system}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        has_shift_system: e.target.checked,
                        shift_timings: e.target.checked
                          ? (normalizeShiftTimings(prev.shift_timings).length > 0
                              ? normalizeShiftTimings(prev.shift_timings)
                              : [{ start: '09:00', end: '13:00' }])
                          : []
                      }))}
                      disabled={!editing}
                      className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
                    />
                    <span className="text-white/70 text-sm">Has Shift System</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bank & Payout Details */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2m-2 0h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                </svg>
              </div>
              Bank & Payout Details
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Payment Settlement (Razorpay Route)
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="razorpay_linked_account_id"
                    value={profileData.razorpay_linked_account_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="acc_... (settles booking, subscription and transfer payments here)"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                    {profileData.razorpay_linked_account_id || 'Not set'}
                  </div>
                )}
                <p className="text-white/50 text-xs mt-1">
                  Rs.1 booking tokens stay on the platform; other online payments route to this linked account when Route is enabled on the server.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10">
                <h4 className="text-white font-medium mb-4">Bank Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Account Holder Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="bank_account_holder_name"
                        value={profileData.bank_account_holder_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter account holder name"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {profileData.bank_account_holder_name || 'Not set'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      IFSC Code
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="bank_ifsc_code"
                        value={profileData.bank_ifsc_code}
                        onChange={handleInputChange}
                        onBlur={handleIfscBlur}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter IFSC code"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {profileData.bank_ifsc_code || 'Not set'}
                      </div>
                    )}
                    {ifscLookupLoading && (
                      <p className="text-blue-200 text-xs mt-1">Detecting bank and branch from IFSC...</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Branch Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="bank_branch_name"
                        value={profileData.bank_branch_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Auto-filled from IFSC (editable)"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {profileData.bank_branch_name || 'Not set'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Account Number
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="bank_account_number"
                        value={profileData.bank_account_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter bank account number"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {profileData.bank_account_number || 'Not set'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Bank Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="bank_name"
                        value={profileData.bank_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter bank name"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {profileData.bank_name || 'Not set'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shift System Section */}
          {profileData.has_shift_system && (
            <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Shift Timings
                </h3>
                {editing && (
                  <button
                    type="button"
                    onClick={handleAddShiftTiming}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200"
                  >
                    + Add Shift
                  </button>
                )}
              </div>

              {(profileData.shift_timings || []).length === 0 ? (
                <div className="text-white/70 text-sm bg-white/5 border border-white/10 rounded-lg p-4">
                  No shift timings configured yet.
                  {editing ? ' Click "Add Shift" to create one.' : ''}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(profileData.shift_timings || []).map((timing, index) => {
                    const shift = parseShiftTiming(timing);
                    return (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium">Shift {index + 1}</h4>
                          {editing ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveShiftTiming(index)}
                              className="text-red-300 hover:text-red-200 text-xs font-medium"
                            >
                              Remove
                            </button>
                          ) : (
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          )}
                        </div>
                        {editing ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-white/70 mb-1">Start</label>
                              <input
                                type="time"
                                value={shift.start}
                                onChange={(e) => handleShiftTimingChange(index, 'start', e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/70 mb-1">End</label>
                              <input
                                type="time"
                                value={shift.end}
                                onChange={(e) => handleShiftTimingChange(index, 'end', e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-white/70 text-sm">
                            {shift.start && shift.end ? `${shift.start} - ${shift.end}` : 'Not configured'}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subscription Plans Section */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                Subscription Plans
              </h3>
              <button
                onClick={() => setShowAddPlanModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Plan
                </div>
              </button>
            </div>

            {loadingPlans ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="ml-3 text-white/70">Loading subscription plans...</span>
              </div>
            ) : subscriptionPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <div key={plan.id} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-white/70 text-sm">
                          {plan.months} Month{plan.months > 1 ? 's' : ''}
                        </span>
                      </div>
                      {plan.is_custom && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      {plan.discounted_amount ? (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">₹{plan.discounted_amount}</div>
                          <div className="text-sm text-white/50 line-through">₹{plan.amount}</div>
                          <div className="text-xs text-green-400 mt-1">
                            Save ₹{plan.amount - plan.discounted_amount}
                          </div>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-white text-center">₹{plan.amount}</div>
                      )}
                    </div>
                    <div className="mb-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-500/30">
                        {getPlanScopeLabel(plan)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        disabled={deletingPlan === plan.id}
                        className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-medium rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all duration-200 disabled:opacity-50"
                      >
                        {deletingPlan === plan.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="text-white/70 text-lg font-medium mb-2">No Subscription Plans</h4>
                <p className="text-white/50 text-sm mb-4">
                  Create subscription plans for your students to choose from
                </p>
                <button
                  onClick={() => setShowAddPlanModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 hover:scale-105"
                >
                  Create Your First Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Subscription Plan Modal */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white">Add Subscription Plan</h3>
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Duration (Months)
                </label>
                <select 
                  value={newPlanData.months}
                  onChange={(e) => setNewPlanData(prev => ({ ...prev, months: e.target.value }))}
                  disabled={addPlanMonthOptions.length === 0}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {addPlanMonthOptions.length > 0 ? (
                    addPlanMonthOptions.map((month) => (
                      <option key={month} value={month} className="bg-slate-800">
                        {month} Month{month > 1 ? 's' : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" className="bg-slate-800">No available durations</option>
                  )}
                </select>
                {addPlanMonthOptions.length === 0 && (
                  <p className="text-xs text-red-300 mt-2">
                    Duration not available for selected scope. Try another scope or shift.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={newPlanData.amount}
                  onChange={(e) => setNewPlanData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Discounted Amount (₹) - Optional
                </label>
                <input
                  type="number"
                  value={newPlanData.discounted_amount}
                  onChange={(e) => setNewPlanData(prev => ({ ...prev, discounted_amount: e.target.value }))}
                  placeholder="Enter discounted amount"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {profileData.has_shift_system && (
                <>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Plan Scope
                    </label>
                    <select
                      value={newPlanData.plan_scope}
                      onChange={(e) => setNewPlanData(prev => ({ ...prev, plan_scope: e.target.value, shift_time: e.target.value === 'shift' ? prev.shift_time : '' }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="non_shift" className="bg-slate-800">Non-shift / All</option>
                      <option value="shift" className="bg-slate-800">Shift specific</option>
                    </select>
                  </div>
                  {newPlanData.plan_scope === 'shift' && (
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Shift Time
                      </label>
                      <select
                        value={newPlanData.shift_time}
                        onChange={(e) => setNewPlanData(prev => ({ ...prev, shift_time: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="" className="bg-slate-800">Select shift</option>
                        {(profileData.shift_timings || []).map((timing, index) => {
                          const label = typeof timing === 'string' ? timing : `${timing.start} - ${timing.end}`;
                          return <option key={index} value={label} className="bg-slate-800">{label}</option>;
                        })}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddPlanModal(false);
                    setNewPlanData({ months: 1, amount: '', discounted_amount: '', plan_scope: 'non_shift', shift_time: '' });
                  }}
                  disabled={savingPlan}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  disabled={savingPlan}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPlan ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Plan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscription Plan Modal */}
      {showEditPlanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white">Edit Subscription Plan</h3>
              <button
                onClick={() => {
                  setShowEditPlanModal(false);
                  setEditingPlan(null);
                  setEditPlanData({ months: 1, amount: '', discounted_amount: '', plan_scope: 'non_shift', shift_time: '' });
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Duration (Months)
                </label>
                <select 
                  value={editPlanData.months}
                  onChange={(e) => setEditPlanData(prev => ({ ...prev, months: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="1" className="bg-slate-800">1 Month</option>
                  <option value="3" className="bg-slate-800">3 Months</option>
                  <option value="6" className="bg-slate-800">6 Months</option>
                  <option value="9" className="bg-slate-800">9 Months</option>
                  <option value="12" className="bg-slate-800">12 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={editPlanData.amount}
                  onChange={(e) => setEditPlanData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Discounted Amount (₹) - Optional
                </label>
                <input
                  type="number"
                  value={editPlanData.discounted_amount}
                  onChange={(e) => setEditPlanData(prev => ({ ...prev, discounted_amount: e.target.value }))}
                  placeholder="Enter discounted amount"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {profileData.has_shift_system && (
                <>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Plan Scope
                    </label>
                    <select
                      value={editPlanData.plan_scope}
                      onChange={(e) => setEditPlanData(prev => ({ ...prev, plan_scope: e.target.value, shift_time: e.target.value === 'shift' ? prev.shift_time : '' }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="non_shift" className="bg-slate-800">Non-shift / All</option>
                      <option value="shift" className="bg-slate-800">Shift specific</option>
                    </select>
                  </div>
                  {editPlanData.plan_scope === 'shift' && (
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Shift Time
                      </label>
                      <select
                        value={editPlanData.shift_time}
                        onChange={(e) => setEditPlanData(prev => ({ ...prev, shift_time: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="" className="bg-slate-800">Select shift</option>
                        {(profileData.shift_timings || []).map((timing, index) => {
                          const label = typeof timing === 'string' ? timing : `${timing.start} - ${timing.end}`;
                          return <option key={index} value={label} className="bg-slate-800">{label}</option>;
                        })}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditPlanModal(false);
                    setEditingPlan(null);
                    setEditPlanData({ months: 1, amount: '', discounted_amount: '', plan_scope: 'non_shift', shift_time: '' });
                  }}
                  disabled={savingPlan}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePlan}
                  disabled={savingPlan}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPlan ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Plan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
  );
};

export default AdminProfile;
