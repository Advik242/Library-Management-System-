import { useFetch } from '../../hooks/useFetch';
import { BookOpen, Users, Library, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import RevenueChart from '../../components/charts/RevenueChart';
import UserGrowthChart from '../../components/charts/UserGrowthChart';
import PopularBooksChart from '../../components/charts/PopularBooksChart';

export default function AdminDashboard() {
  const { data: stats } = useFetch('/analytics/dashboard');
  const { data: revenueData } = useFetch('/analytics/revenue?period=month');
  const { data: userGrowth } = useFetch('/analytics/user-growth');
  const { data: popularBooks } = useFetch('/analytics/popular-books');

  const statCards = [
    {
      label: 'Total Books',
      value: stats?.totalBooks || 0,
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    },
    {
      label: 'Active Loans',
      value: stats?.activeLoans || 0,
      icon: Library,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      label: 'Overdue Loans',
      value: stats?.overdueLoans || 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-400/10'
    },
    {
      label: 'Total Revenue',
      value: `₹${stats?.totalRevenue || 0}`,
      icon: DollarSign,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10'
    },
    {
      label: 'Growth',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Admin <span className="text-gradient">Dashboard</span></h1>
        <p className="page-subtitle">Overview of your library system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="stat-value text-2xl">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart data={revenueData} />
        <UserGrowthChart data={userGrowth} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PopularBooksChart data={popularBooks} />
        
        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New user registered', time: '2 minutes ago', type: 'user' },
              { action: 'Book borrowed: "The Art of Java"', time: '15 minutes ago', type: 'loan' },
              { action: 'Fine payment received: ₹50', time: '1 hour ago', type: 'payment' },
              { action: 'New book added: "Clean Code"', time: '3 hours ago', type: 'book' },
              { action: 'Subscription upgraded to Gold', time: '5 hours ago', type: 'subscription' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                <div className="flex-1">
                  <p className="text-sm text-dark-200">{activity.action}</p>
                  <p className="text-xs text-dark-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
