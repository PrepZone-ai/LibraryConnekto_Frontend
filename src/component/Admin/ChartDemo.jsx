import React from 'react';
import { 
  PieChartComponent, 
  DonutChartComponent, 
  BarChartComponent, 
  LineChartComponent,
  AreaChartComponent,
  MultiLineChartComponent,
  ProgressRing,
  StatCardWithChart 
} from '../common/Charts';

const ChartDemo = () => {
  // Sample data for demonstration
  const studentData = [
    { name: 'Active Students', value: 25 },
    { name: 'Inactive Students', value: 5 }
  ];

  const seatData = [
    { name: 'Occupied Seats', value: 40 },
    { name: 'Available Seats', value: 10 }
  ];

  const weeklyData = [
    { name: 'Mon', value: 20 },
    { name: 'Tue', value: 25 },
    { name: 'Wed', value: 18 },
    { name: 'Thu', value: 30 },
    { name: 'Fri', value: 22 },
    { name: 'Sat', value: 15 },
    { name: 'Sun', value: 8 }
  ];

  const revenueData = [
    { name: 'Jan', value: 50000 },
    { name: 'Feb', value: 65000 },
    { name: 'Mar', value: 70000 },
    { name: 'Apr', value: 80000 },
    { name: 'May', value: 75000 },
    { name: 'Jun', value: 90000 }
  ];

  const multiLineData = [
    { name: 'Jan', students: 20, revenue: 50000 },
    { name: 'Feb', students: 25, revenue: 65000 },
    { name: 'Mar', students: 30, revenue: 70000 },
    { name: 'Apr', students: 35, revenue: 80000 },
    { name: 'May', students: 40, revenue: 75000 },
    { name: 'Jun', students: 45, revenue: 90000 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Chart Components Demo
          </span>
        </h1>

        {/* Stat Cards with Mini Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCardWithChart
            title="Total Students"
            value="30"
            icon="👥"
            gradient="from-emerald-500 to-green-500"
            chartData={weeklyData.slice(0, 4)}
            chartType="area"
            color="#10B981"
          />
          <StatCardWithChart
            title="Revenue"
            value="₹85,000"
            icon="💰"
            gradient="from-blue-500 to-cyan-500"
            chartData={revenueData.slice(0, 4)}
            chartType="line"
            color="#3B82F6"
          />
          <StatCardWithChart
            title="Occupied Seats"
            value="40/50"
            icon="🪑"
            gradient="from-purple-500 to-pink-500"
            chartData={[
              { name: 'Morning', value: 25 },
              { name: 'Afternoon', value: 35 },
              { name: 'Evening', value: 40 }
            ]}
            chartType="area"
            color="#8B5CF6"
          />
          <StatCardWithChart
            title="Growth Rate"
            value="+15%"
            icon="📈"
            gradient="from-orange-500 to-red-500"
            chartData={[
              { name: 'Q1', value: 5 },
              { name: 'Q2', value: 10 },
              { name: 'Q3', value: 12 },
              { name: 'Q4', value: 15 }
            ]}
            chartType="line"
            color="#F59E0B"
          />
        </div>

        {/* Pie and Donut Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PieChartComponent
            title="Student Distribution"
            data={studentData}
            colors={['#10B981', '#EF4444']}
            height={300}
          />
          <DonutChartComponent
            title="Seat Utilization"
            data={seatData}
            colors={['#8B5CF6', '#6B7280']}
            height={300}
          />
        </div>

        {/* Progress Rings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ProgressRing
            percentage={83}
            title="Student Activity"
            subtitle="Active Rate"
            color="#10B981"
            size={160}
          />
          <ProgressRing
            percentage={80}
            title="Seat Occupancy"
            subtitle="Utilization"
            color="#8B5CF6"
            size={160}
          />
          <ProgressRing
            percentage={15}
            title="Growth Rate"
            subtitle="vs Last Month"
            color="#F59E0B"
            size={160}
          />
        </div>

        {/* Line and Area Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LineChartComponent
            title="Weekly Attendance"
            data={weeklyData}
            xKey="name"
            yKey="value"
            color="#10B981"
            height={300}
          />
          <AreaChartComponent
            title="Revenue Trend"
            data={revenueData}
            xKey="name"
            yKey="value"
            color="#3B82F6"
            height={300}
          />
        </div>

        {/* Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BarChartComponent
            title="Weekly Activity"
            data={weeklyData}
            xKey="name"
            yKey="value"
            colors={['#3B82F6']}
            height={300}
          />
          <MultiLineChartComponent
            title="Students vs Revenue"
            data={multiLineData}
            xKey="name"
            lines={[
              { dataKey: 'students', name: 'Students', color: '#10B981' },
              { dataKey: 'revenue', name: 'Revenue (₹)', color: '#3B82F6' }
            ]}
            height={300}
          />
        </div>

        <div className="text-center text-white/70 mt-8">
          <p>All chart components are fully responsive and customizable</p>
        </div>
      </div>
    </div>
  );
};

export default ChartDemo;
