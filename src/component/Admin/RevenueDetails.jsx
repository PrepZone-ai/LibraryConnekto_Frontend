import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    averageTransaction: 0,
    cashReceived: 0,
    onlineReceived: 0,
    cashExtension: 0,
    cashRemovalRequest: 0
  });
  const [timeFilter, setTimeFilter] = useState('all'); // all, month, week, today
  const [sourceFilter, setSourceFilter] = useState('all'); // all, online, cash, cash_extension, cash_removal
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const pageSize = 10;

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

      const transactions = Array.isArray(response)
        ? response
        : (Array.isArray(response?.items) ? response.items : []);

      if (transactions.length > 0) {
        setRevenueData(transactions);
        
        // Calculate stats
        const totalRevenue = transactions.reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);
        const totalTransactions = transactions.length;
        const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        const cashTransactions = transactions.filter(
          (t) => String(t.payment_method || '').toLowerCase() === 'cash'
        );
        const onlineTransactions = transactions.filter(
          (t) => String(t.payment_method || '').toLowerCase() !== 'cash'
        );
        const cashReceived = cashTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const onlineReceived = onlineTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const cashExtension = cashTransactions
          .filter((t) => t.revenue_source === 'cash_extension')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const cashRemovalRequest = cashTransactions
          .filter((t) => t.revenue_source === 'cash_removal_request')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        
        // Calculate monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyTransactions = transactions.filter(t => 
          new Date(t.created_at || t.payment_date) >= thirtyDaysAgo
        );
        const monthlyRevenue = monthlyTransactions.reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);
        
        setStats({
          totalRevenue,
          totalTransactions,
          monthlyRevenue,
          averageTransaction,
          cashReceived,
          onlineReceived,
          cashExtension,
          cashRemovalRequest
        });
      } else {
        setRevenueData([]);
        setStats({
          totalRevenue: 0,
          totalTransactions: 0,
          monthlyRevenue: 0,
          averageTransaction: 0,
          cashReceived: 0,
          onlineReceived: 0,
          cashExtension: 0,
          cashRemovalRequest: 0
        });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setRevenueData([]);
      setStats({
        totalRevenue: 0,
        totalTransactions: 0,
        monthlyRevenue: 0,
        averageTransaction: 0,
        cashReceived: 0,
        onlineReceived: 0,
        cashExtension: 0,
        cashRemovalRequest: 0
      });
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
  const filteredRevenueData = revenueData.filter((t) => {
    const paymentMethod = String(t.payment_method || '').toLowerCase();
    const revenueSource = String(t.revenue_source || '').toLowerCase();
    if (sourceFilter === 'online') return paymentMethod !== 'cash';
    if (sourceFilter === 'cash') return paymentMethod === 'cash';
    if (sourceFilter === 'cash_extension') return revenueSource === 'cash_extension';
    if (sourceFilter === 'cash_removal') return revenueSource === 'cash_removal_request';
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filteredRevenueData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * pageSize;
  const paginatedRevenueData = filteredRevenueData.slice(pageStart, pageStart + pageSize);

  const getRevenueSourceLabel = (source) => {
    if (source === 'cash_removal_request') return 'Cash - Removal';
    if (source === 'cash_extension') return 'Cash - Extension';
    if (source === 'online') return 'Online';
    return source || 'Other';
  };

  const monthlyRevenueRows = Object.entries(
    revenueData.reduce((acc, tx) => {
      const d = new Date(tx.created_at || tx.payment_date);
      if (Number.isNaN(d.getTime())) return acc;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[key]) {
        acc[key] = { month: key, totalAmount: 0, totalTransactions: 0, cashAmount: 0, onlineAmount: 0 };
      }
      const amount = Number(tx.amount) || 0;
      const isCash = String(tx.payment_method || '').toLowerCase() === 'cash';
      acc[key].totalAmount += amount;
      acc[key].totalTransactions += 1;
      if (isCash) acc[key].cashAmount += amount;
      else acc[key].onlineAmount += amount;
      return acc;
    }, {})
  )
    .map(([, value]) => value)
    .sort((a, b) => b.month.localeCompare(a.month));

  const exportRevenuePdf = (rows, title) => {
    if (!rows.length) {
      alert('No revenue data found for PDF export.');
      return;
    }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const generatedAt = new Date().toLocaleString();
    doc.setFontSize(16);
    doc.text(title, 40, 42);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, 40, 60);
    doc.text(`Records: ${rows.length}`, 40, 74);

    autoTable(doc, {
      startY: 90,
      head: [['Student', 'Student ID', 'Amount', 'Date', 'Method', 'Source', 'Status', 'Transaction ID']],
      body: rows.map((r) => ([
        r.student_name || 'Unknown Student',
        r.student_id || '—',
        formatCurrency(r.amount || 0),
        formatDateTime(r.created_at || r.payment_date),
        r.payment_method || 'online',
        getRevenueSourceLabel(r.revenue_source),
        r.status || 'completed',
        r.transaction_id || '—',
      ])),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 5 },
      headStyles: { fillColor: [66, 32, 115], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: 24, right: 24, top: 28, bottom: 26 },
      didDrawPage: () => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
        doc.setFontSize(9);
        doc.setTextColor(90);
        doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - 62, pageHeight - 12);
      },
    });
    const fileTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    doc.save(`${fileTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadAllRevenuePdf = () => {
    exportRevenuePdf(filteredRevenueData, 'Revenue Details Report');
  };

  const downloadMonthlyRevenuePdf = () => {
    const ym = selectedMonth;
    const monthlyRows = filteredRevenueData.filter((t) => {
      const d = new Date(t.created_at || t.payment_date);
      if (Number.isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === ym;
    });
    exportRevenuePdf(monthlyRows, `Monthly Revenue Report (${ym})`);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, sourceFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
            <p className="text-white/70 mt-4">Loading revenue data...</p>
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
              <div className="flex items-center gap-2">
                <label className="text-white/80 text-sm">Month:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={downloadAllRevenuePdf}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 text-sm font-semibold shadow-lg shadow-blue-500/25"
              >
                Download All PDF
              </button>
              <button
                onClick={downloadMonthlyRevenuePdf}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 text-sm font-semibold shadow-lg shadow-emerald-500/25"
              >
                Download Monthly PDF
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'online', label: 'Online' },
                { id: 'cash', label: 'Cash' },
                { id: 'cash_extension', label: 'Cash Extension' },
                { id: 'cash_removal', label: 'Cash Removal' },
              ].map((chip) => {
                const active = sourceFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setSourceFilter(chip.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-200 ${
                      active
                        ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={MoneyIcon}
              gradient="from-green-500 to-emerald-500"
              subtitle="Online + Cash received"
            />
            <StatCard
              title="Online Received"
              value={formatCurrency(stats.onlineReceived)}
              icon={CheckIcon}
              gradient="from-blue-500 to-cyan-500"
              subtitle="Razorpay / online payments"
            />
            <StatCard
              title="Cash Received"
              value={formatCurrency(stats.cashReceived)}
              icon={CalendarIcon}
              gradient="from-purple-500 to-pink-500"
              subtitle="Cash collections"
            />
            <StatCard
              title="Total Transactions"
              value={stats.totalTransactions}
              icon={UserIcon}
              gradient="from-orange-500 to-red-500"
              subtitle="All paid transactions"
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

          {/* Monthly Revenue Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Monthly Revenue Details</h2>
              <span className="text-white/70 text-sm">{monthlyRevenueRows.length} months</span>
            </div>
            {monthlyRevenueRows.length > 0 ? (
              <div className="overflow-auto rounded-xl border border-white/10 max-h-[360px]">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
                    <tr className="text-left text-white/80">
                      <th className="px-3 py-3 font-semibold">Month</th>
                      <th className="px-3 py-3 font-semibold">Transactions</th>
                      <th className="px-3 py-3 font-semibold">Online</th>
                      <th className="px-3 py-3 font-semibold">Cash</th>
                      <th className="px-3 py-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRevenueRows.map((row) => (
                      <tr
                        key={row.month}
                        className={`border-t border-white/10 hover:bg-white/5 ${
                          row.month === selectedMonth ? 'bg-emerald-500/10' : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-white font-medium">{row.month}</td>
                        <td className="px-3 py-2 text-white/80">{row.totalTransactions}</td>
                        <td className="px-3 py-2 text-cyan-300">{formatCurrency(row.onlineAmount)}</td>
                        <td className="px-3 py-2 text-purple-300">{formatCurrency(row.cashAmount)}</td>
                        <td className="px-3 py-2 text-green-400 font-semibold">{formatCurrency(row.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-white/70 text-sm">No monthly revenue details available.</p>
            )}
          </div>

          {/* Transaction List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <MoneyIcon className="w-4 h-4 text-white" />
                </div>
                <span>Revenue Collection History</span>
              </h2>
              <div className="text-sm text-white/70">
                {filteredRevenueData.length} {filteredRevenueData.length === 1 ? 'record' : 'records'} found
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/70 text-sm font-medium mb-1">Cash - Extension</p>
                <p className="text-white font-semibold">{formatCurrency(stats.cashExtension)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/70 text-sm font-medium mb-1">Cash - Removal Request</p>
                <p className="text-white font-semibold">{formatCurrency(stats.cashRemovalRequest)}</p>
              </div>
            </div>

            {filteredRevenueData.length > 0 ? (
              <div>
                <div className="overflow-auto rounded-xl border border-white/10 max-h-[540px]">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
                      <tr className="text-left text-white/80">
                        <th className="px-3 py-3 font-semibold">Student</th>
                        <th className="px-3 py-3 font-semibold">Student ID</th>
                        <th className="px-3 py-3 font-semibold">Amount</th>
                        <th className="px-3 py-3 font-semibold">Date</th>
                        <th className="px-3 py-3 font-semibold">Method</th>
                        <th className="px-3 py-3 font-semibold">Source</th>
                        <th className="px-3 py-3 font-semibold">Purpose</th>
                        <th className="px-3 py-3 font-semibold">Transaction ID</th>
                        <th className="px-3 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRevenueData.map((transaction, index) => (
                        <tr
                          key={transaction.id || transaction.transaction_id || index}
                          className="border-t border-white/10 hover:bg-white/5"
                        >
                          <td className="px-3 py-2 text-white">{transaction.student_name || 'Unknown Student'}</td>
                          <td className="px-3 py-2 text-white/80 font-mono">{transaction.student_id || '—'}</td>
                          <td className="px-3 py-2 text-green-400 font-semibold whitespace-nowrap">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-3 py-2 text-white/80 whitespace-nowrap">
                            {formatDateTime(transaction.created_at || transaction.payment_date)}
                          </td>
                          <td className="px-3 py-2 text-white/80 capitalize">{transaction.payment_method || 'online'}</td>
                          <td className="px-3 py-2 text-white/80">{getRevenueSourceLabel(transaction.revenue_source)}</td>
                          <td className="px-3 py-2 text-white/80 max-w-[220px] truncate" title={transaction.purpose || '—'}>
                            {transaction.purpose || '—'}
                          </td>
                          <td className="px-3 py-2 text-blue-300 font-mono text-xs max-w-[220px] truncate" title={transaction.transaction_id || '—'}>
                            {transaction.transaction_id || '—'}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(transaction.status)}`}>
                              {transaction.status || 'Completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-white/70 text-sm">
                    Showing {filteredRevenueData.length === 0 ? 0 : pageStart + 1}-
                    {Math.min(pageStart + pageSize, filteredRevenueData.length)} of {filteredRevenueData.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safeCurrentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span className="text-white/80 text-sm">
                      Page {safeCurrentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Revenue Data</h3>
                <p className="text-white/70">
                  No transaction records found for the selected time period.
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Revenue details will appear here for both online and cash payments.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      </div>
  );
};

export default RevenueDetails;
