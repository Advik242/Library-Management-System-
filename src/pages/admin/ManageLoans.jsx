import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Search, Check, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/loans/all?status=${filter}`);
      setLoans(data.data);
    } catch (error) {
      toast.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'returned', label: 'Returned' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Manage <span className="text-gradient">Loans</span></h1>
        <p className="page-subtitle">Track and manage all book loans</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan._id}>
                  <td>
                    <p className="font-medium text-white">{loan.user?.name}</p>
                    <p className="text-sm text-dark-400">{loan.user?.email}</p>
                  </td>
                  <td>
                    <p className="font-medium text-white">{loan.book?.title}</p>
                    <p className="text-sm text-dark-400">ISBN: {loan.book?.isbn}</p>
                  </td>
                  <td className="text-dark-300">
                    {new Date(loan.issueDate).toLocaleDateString()}
                  </td>
                  <td className="text-dark-300">
                    {new Date(loan.dueDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${
                      loan.status === 'active' ? 'badge-info' :
                      loan.status === 'overdue' ? 'badge-danger' :
                      loan.status === 'returned' ? 'badge-success' :
                      'badge-warning'
                    }`}>
                      {loan.status === 'overdue' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {loan.status === 'returned' && <Check className="w-3 h-3 mr-1" />}
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    {loan.fine?.amount > 0 ? (
                      <span className={`font-medium ${loan.fine.paid ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{loan.fine.amount} {loan.fine.paid ? '(Paid)' : ''}
                      </span>
                    ) : (
                      <span className="text-dark-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
