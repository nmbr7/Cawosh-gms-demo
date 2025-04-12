"use client";

import { Clock, CalendarClock, CheckCircle, PoundSterling, BookOpen, ShieldCheck, TrendingDown, TrendingUp, BarChart, Calendar } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  // Mock data for service counts
  const serviceCounts = {
    ongoing: 12,
    upcoming: 8,
    completed: 45
  };

  // Mock data for metrics
  const metrics = {
    income: {
      amount: "8,245.00",
      change: -0.5,
      period: "from last week"
    },
    bookings: {
      count: 156,
      change: 12.3,
      period: "from last month"
    },
    resolved: {
      count: 28,
      change: 5.7,
      period: "from yesterday"
    }
  };

  // Mock data for transactions
  const transactionData = [
    { name: '24 Jan', amount: 2400 },
    { name: '25 Jan', amount: 1398 },
    { name: '26 Jan', amount: 3200 },
    { name: '27 Jan', amount: 2800 },
    { name: '28 Jan', amount: 1908 },
    { name: '29 Jan', amount: 2400 },
  ];

  return (
    <div className="container mx-auto">
      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Ongoing Services Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <p className="ml-4 text-base font-normal text-gray-900">Ongoing Services</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{serviceCounts.ongoing}</h3>
          </div>
        </div>

        {/* Upcoming Services Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <CalendarClock className="h-6 w-6 text-amber-600" />
              </div>
              <p className="ml-4 text-base font-normal text-gray-900">Upcoming Services</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{serviceCounts.upcoming}</h3>
          </div>
        </div>

        {/* Completed Services Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="ml-4 text-base font-normal text-gray-900">Completed Services</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{serviceCounts.completed}</h3>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* New Net Income Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <PoundSterling className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="ml-4 text-sm font-medium text-gray-600">New Net Income</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-gray-900">£{metrics.income.amount}</h3>
              <div className="flex items-center space-x-1">
                {metrics.income.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm ${metrics.income.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.income.change >= 0 ? '+' : ''}{metrics.income.change}% {metrics.income.period}
                </span>
              </div>
            </div>
            <div className="w-24 h-16">
              <BarChart className="w-full h-full text-gray-300" />
            </div>
          </div>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <p className="ml-4 text-sm font-medium text-gray-600">Total Bookings</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-gray-900">{metrics.bookings.count}</h3>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  +{metrics.bookings.change}% {metrics.bookings.period}
                </span>
              </div>
            </div>
            <div className="w-24 h-16">
              <BarChart className="w-full h-full text-gray-300" />
            </div>
          </div>
        </div>

        {/* Resolved Issues Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <p className="ml-4 text-sm font-medium text-gray-600">Resolved Issues</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-gray-900">{metrics.resolved.count}</h3>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  +{metrics.resolved.change}% {metrics.resolved.period}
                </span>
              </div>
            </div>
            <div className="w-24 h-16">
              <BarChart className="w-full h-full text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Transaction Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Weekly Transaction Summary</h2>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1">
              <span className="text-xs text-gray-600">Last 7 month</span>
              <Calendar className="h-4 w-4 text-[#93C54B]" />
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={transactionData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
                barSize={12}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip />
                <Bar 
                  dataKey="amount" 
                  fill="#93C54B"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
