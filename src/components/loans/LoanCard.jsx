import { Calendar, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function LoanCard({ loan, onReturn, onRenew }) {
  const getStatusIcon = () => {
    switch (loan.status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      case 'returned':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusClass = () => {
    switch (loan.status) {
      case 'active':
        return 'badge-info';
      case 'overdue':
        return 'badge-danger';
      case 'returned':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    const due = new Date(loan.dueDate);
    const now = new Date();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="card p-4">
      <div className="flex gap-4">
        {/* Book Cover */}
        <div className="w-20 h-28 bg-dark-800 rounded-lg overflow-hidden flex-shrink-0">
          {loan.book?.coverImage ? (
            <img
              src={loan.book.coverImage}
              alt={loan.book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-dark-600">
              📚
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-white line-clamp-1">{loan.book?.title}</h4>
              <p className="text-sm text-dark-400">{loan.book?.author}</p>
            </div>
            <span className={`badge ${getStatusClass()} flex items-center gap-1`}>
              {getStatusIcon()}
              {loan.status}
            </span>
          </div>

          {/* Dates */}
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-dark-400">Checkout Date</span>
              <p className="text-dark-200 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(loan.issueDate)}
              </p>
            </div>
            <div>
              <span className="text-dark-400">Due Date</span>
              <p className="text-dark-200 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(loan.dueDate)}
              </p>
            </div>
          </div>

          {/* Days remaining or fine */}
          {loan.status === 'active' && (
            <div className="mt-2">
              {getDaysRemaining() > 0 ? (
                <span className="text-sm text-green-400">
                  {getDaysRemaining()} days remaining
                </span>
              ) : (
                <span className="text-sm text-yellow-400">
                  Due today
                </span>
              )}
            </div>
          )}

          {loan.status === 'overdue' && loan.fine?.amount > 0 && (
            <div className="mt-2">
              <span className="text-sm text-red-400">
                Fine: ₹{loan.fine.amount}
              </span>
            </div>
          )}

          {/* Actions */}
          {loan.status === 'active' && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onReturn(loan)}
                className="btn btn-primary btn-sm"
              >
                Return Book
              </button>
              {loan.renewalCount < loan.maxRenewals && (
                <button
                  onClick={() => onRenew(loan)}
                  className="btn btn-secondary btn-sm flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renew ({loan.maxRenewals - loan.renewalCount} left)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
