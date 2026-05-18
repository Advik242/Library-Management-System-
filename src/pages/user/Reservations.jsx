import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Calendar, Clock, X, BookOpen } from 'lucide-react';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reservations/my-reservations');
      setReservations(data.data);
    } catch (error) {
      toast.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
      toast.success('Reservation cancelled');
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My <span className="text-gradient">Reservations</span></h1>
        <p className="page-subtitle">Track your book reservations and queue positions</p>
      </div>

      {/* Reservations List */}
      {reservations.length > 0 ? (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="card p-4">
              <div className="flex items-start gap-4">
                {/* Book Cover */}
                <div className="w-16 h-24 bg-dark-800 rounded-lg overflow-hidden flex-shrink-0">
                  {reservation.book?.coverImage ? (
                    <img
                      src={reservation.book.coverImage}
                      alt={reservation.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-dark-600" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{reservation.book?.title}</h4>
                      <p className="text-sm text-dark-400">{reservation.book?.author}</p>
                    </div>
                    <span className={`badge ${
                      reservation.status === 'ready' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {reservation.status === 'ready' ? 'Ready for pickup' : `Queue #${reservation.queuePosition}`}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1 text-dark-400">
                      <Calendar className="w-4 h-4" />
                      Reserved: {new Date(reservation.reservedAt).toLocaleDateString()}
                    </div>
                    {reservation.status === 'ready' && reservation.expiresAt && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Clock className="w-4 h-4" />
                        Expires: {new Date(reservation.expiresAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => cancelReservation(reservation._id)}
                  className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Cancel reservation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Reservations</h3>
          <p className="text-dark-400">You haven't reserved any books yet.</p>
        </div>
      )}
    </div>
  );
}
