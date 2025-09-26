import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { 
  BarChartComponent, 
  LineChartComponent,
  PieChartComponent,
  AreaChartComponent 
} from '../common/Charts';

// Icons
const MoneyIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RevenueDetails = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    monthlyRevenue: 0,
    averageTransaction: 0
  });
  const [timeFilter, setTimeFilter] = useState('all'); // all, month, week, today

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    fetchRevenueData();
  }, [userType, navigate, timeFilter]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      // Fetch revenue/transaction data
      const response = await apiClient.get(`/admin/revenue?filter=${timeFilter}`);
      
      if (response && Array.isArray(response)) {
        setRevenueData(response);
        
        // Calculate stats
        const totalRevenue = response.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
        const totalTransactions = response.length;
        const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        
        // Calculate monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyTransactions = response.filter(t => 
          new Date(t.created_at || t.payment_date) >= thirtyDaysAgo
        );
        const monthlyRevenue = monthlyTransactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
        
        setStats({
          totalRevenue,
          totalTransactions,
          monthlyRevenue,
          averageTransaction
        });
      } else {
        setRevenueData([]);
        setStats({ totalRevenue: 0, totalTransactions: 0, monthlyRevenue: 0, averageTransaction: 0 });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setRevenueData([]);
      setStats({ totalRevenue: 0, totalTransactions: 0, monthlyRevenue: 0, averageTransaction: 0 });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient = 'from-blue-500 to-cyan-500', subtitle }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300">{value}</p>
          {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const TransactionCard = ({ transaction }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <MoneyIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-green-200 transition-colors">
                {transaction.student_name || 'Unknown Student'}
              </h3>
              <p className="text-white/70 text-sm">{transaction.student_id || 'No ID'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">{formatCurrency(transaction.amount)}</p>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)} border border-white/20`}>
              {transaction.status || 'Completed'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <CalendarIcon className="w-4 h-4 text-blue-400" />
              <p className="text-white/70 text-sm font-medium">Transaction Date</p>
            </div>
            <p className="text-white font-semibold">{formatDateTime(transaction.created_at || transaction.payment_date)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <UserIcon className="w-4 h-4 text-purple-400" />
              <p className="text-white/70 text-sm font-medium">Subscription</p>
            </div>
            <p className="text-white font-semibold">{transaction.subscription_months || 1} month(s)</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <p className="text-white/70 text-sm font-medium">Payment Method</p>
            </div>
            <p className="text-white font-semibold">{transaction.payment_method || 'Online'}</p>
          </div>
        </div>

        {transaction.transaction_id && (
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-blue-400" />
              <p className="text-white/70 text-sm font-medium">Transaction ID</p>
            </div>
            <p className="text-blue-300 font-mono text-sm">{transaction.transaction_id}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Prepare chart data
  const prepareChartData = () => {
    const monthlyData = {};
    const dailyData = {};
    
    revenueData.forEach(transaction => {
      const date = new Date(transaction.created_at || transaction.payment_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const dayKey = date.toISOString().split('T')[0];
      
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (transaction.amount || 0);
      dailyData[dayKey] = (dailyData[dayKey] || 0) + (transaction.amount || 0);
    });

    return {
      monthly: Object.entries(monthlyData).map(([month, amount]) => ({
        name: month,
        value: amount
      })),
      daily: Object.entries(dailyData).slice(-30).map(([day, amount]) => ({
        name: day,
        value: amount
      }))
    };
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
            <p className="text-white/70 mt-4">Loading revenue data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">

          {/* Time Filter */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl mb-8">
            <div className="flex items-center space-x-4">
              <CalendarIcon className="w-6 h-6 text-white" />
              <label className="text-white font-semibold">Filter by:</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all" className="bg-slate-800">All Time</option>
                <option value="month" className="bg-slate-800">This Month</option>
                <option value="week" className="bg-slate-800">This Week</option>
                <option value="today" className="bg-slate-800">Today</option>
              </select>
              <button
                onClick={fetchRevenueData}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={MoneyIcon}
              gradient="from-green-500 to-emerald-500"
              subtitle="All time earnings"
            />
            <StatCard
              title="Total Transactions"
              value={stats.totalTransactions}
              icon={CheckIcon}
              gradient="from-blue-500 to-cyan-500"
              subtitle="Completed payments"
            />
            <StatCard
              title="Monthly Revenue"
              value={formatCurrency(stats.monthlyRevenue)}
              icon={CalendarIcon}
              gradient="from-purple-500 to-pink-500"
              subtitle="Last 30 days"
            />
            <StatCard
              title="Average Transaction"
              value={formatCurrency(stats.averageTransaction)}
              icon={UserIcon}
              gradient="from-orange-500 to-red-500"
              subtitle="Per transaction"
            />
          </div>

          {/* Charts Section */}
          {revenueData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AreaChartComponent
                title="Monthly Revenue Trend"
                data={chartData.monthly}
                xKey="name"
                yKey="value"
                color="#10B981"
                height={300}
              />
              <BarChartComponent
                title="Daily Revenue (Last 30 Days)"
                data={chartData.daily.slice(-7)} // Show last 7 days
                xKey="name"
                yKey="value"
                colors={['#3B82F6']}
                height={300}
              />
            </div>
          )}

          {/* Transaction List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <MoneyIcon className="w-4 h-4 text-white" />
                </div>
                <span>Transaction History</span>
              </h2>
              <div className="text-sm text-white/70">
                {revenueData.length} {revenueData.length === 1 ? 'transaction' : 'transactions'} found
              </div>
            </div>

            {revenueData.length > 0 ? (
              <div className="space-y-4">
                {revenueData.map((transaction, index) => (
                  <TransactionCard key={transaction.id || transaction.transaction_id || index} transaction={transaction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Revenue Data</h3>
                <p className="text-white/70">
                  No transaction records found for the selected time period.
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Revenue will appear here once students make payments for their subscriptions.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RevenueDetails;
