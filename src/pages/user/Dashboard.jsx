import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, Clock, AlertTriangle, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: loans } = useFetch('/loans/my-loans?status=active&limit=5');
  const { data: fines } = useFetch('/payments/fines');

  const stats = [
    {
      label: 'Books Borrowed',
      value: user?.currentBorrowCount || 0,
      max: user?.borrowLimit || 2,
      icon: BookOpen,
      color: 'text-blue-400'
    },
    {
      label: 'Active Loans',
      value: loans?.length || 0,
      icon: Clock,
      color: 'text-green-400'
    },
    {
      label: 'Pending Fines',
      value: `₹${user?.unpaidFines || 0}`,
      icon: AlertTriangle,
      color: user?.unpaidFines > 0 ? 'text-red-400' : 'text-dark-400'
    },
    {
      label: 'Subscription',
      value: user?.subscription?.plan || 'Free',
      icon: CreditCard,
      color: 'text-primary-400'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="page-subtitle">Here's what's happening with your library account</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
                {stat.max && (
                  <p className="text-xs text-dark-500 mt-1">
                    of {stat.max} allowed
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-dark-800 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Loans */}
        <div className="card">
          <div className="p-4 border-b border-dark-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">Books You're Currently Reading</h3>
            <Link to="/my-loans" className="text-sm text-primary-400 hover:text-primary-300">
              View All
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {loans?.length > 0 ? (
              loans.map((loan) => (
                <div key={loan._id} className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-dark-800 rounded overflow-hidden flex-shrink-0">
                    {loan.book?.coverImage ? (
                      <img src={loan.book.coverImage} alt={loan.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-600">📚</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{loan.book?.title}</h4>
                    <p className="text-sm text-dark-400">{loan.book?.author}</p>
                    <div className="flex items-center gap-1 text-xs text-dark-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(loan.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge ${loan.status === 'overdue' ? 'badge-danger' : 'badge-info'}`}>
                    {loan.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No active loans</p>
                <Link to="/books" className="btn btn-primary btn-sm mt-4">
                  Browse Books
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Pending Fines */}
        <div className="card">
          <div className="p-4 border-b border-dark-800">
            <h3 className="font-semibold text-white">Pending Fines</h3>
          </div>
          <div className="p-4">
            {fines?.length > 0 ? (
              <div className="space-y-4">
                {fines.map((fine) => (
                  <div key={fine._id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{fine.loan?.book?.title}</p>
                      <p className="text-sm text-dark-400">{fine.reason} - {fine.daysOverdue} days</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-400">₹{fine.amount}</p>
                      <button className="text-sm text-primary-400 hover:text-primary-300">
                        Pay Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-dark-400">No pending fines!</p>
                <p className="text-sm text-dark-500">Keep up the good work 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
