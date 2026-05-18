import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import Dashboard from './pages/user/Dashboard';
import BrowseBooks from './pages/user/BrowseBooks';
import MyLoans from './pages/user/MyLoans';
import Reservations from './pages/user/Reservations';
import Subscriptions from './pages/user/Subscriptions';
import Wishlist from './pages/user/Wishlist';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ManageUsers from './pages/admin/ManageUsers';
import ManageLoans from './pages/admin/ManageLoans';
import Analytics from './pages/admin/Analytics';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/common/MainLayout';
import OAuthCallback from './pages/auth/OAuthCallback';
import Chatbot from './components/chatbot/Chatbot';   // ✅ Import Chatbot

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Routes>
        
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<BrowseBooks />} />
          <Route path="/my-loans" element={<MyLoans />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        
        <Route element={<ProtectedRoute requiredRole="admin"><MainLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<ManageBooks />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/loans" element={<ManageLoans />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Route>

        
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      
      {user && <Chatbot />}
    </div>
  );
}

export default App;
