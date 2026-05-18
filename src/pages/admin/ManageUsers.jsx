import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Search, Shield, User, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Note: You'll need to add this endpoint to your backend
      const { data } = await api.get('/auth/users');
      setUsers(data.data || []);
    } catch (error) {
      // Mock data for demo
      setUsers([
        { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', subscription: { plan: 'gold' }, isActive: true, currentBorrowCount: 3 },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', subscription: { plan: 'silver' }, isActive: true, currentBorrowCount: 1 },
        { _id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', subscription: { plan: 'free' }, isActive: true, currentBorrowCount: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Manage <span className="text-gradient">Users</span></h1>
        <p className="page-subtitle">View and manage library members</p>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input pl-10"
          />
        </div>
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
                <th>Role</th>
                <th>Subscription</th>
                <th>Active Loans</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-dark-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                      {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.subscription?.plan === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                      user.subscription?.plan === 'silver' ? 'bg-gray-500/20 text-gray-400' :
                      'badge-info'
                    }`}>
                      {user.subscription?.plan || 'free'}
                    </span>
                  </td>
                  <td className="text-dark-300">{user.currentBorrowCount}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
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
