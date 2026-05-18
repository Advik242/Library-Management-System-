import { Heart, Star, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function BookCard({ book, onBorrow, onReserve, onWishlistToggle }) {
  const { user, updateUser } = useAuth();
  const isInWishlist = user?.wishlist?.some(b => b._id === book._id || b === book._id);

  const handleWishlist = async () => {
    try {
      const { data } = await api.post(`/auth/wishlist/${book._id}`);
      updateUser({ wishlist: data.data });
      toast.success(data.message);
      onWishlistToggle?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const getStatusBadge = () => {
    if (book.availableCopies > 0) {
      return <span className="badge badge-success">Available</span>;
    }
    return <span className="badge badge-danger">Checked Out</span>;
  };

  return (
    <div className="card card-hover group">
      {/* Cover Image */}
      <div className="relative h-48 bg-dark-800 overflow-hidden">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-dark-600" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-dark-900/80 hover:bg-dark-900 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-sm text-dark-400 mb-2">{book.author}</p>

        {/* Rating */}
        {book.rating?.average > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-dark-300">{book.rating.average.toFixed(1)}</span>
            <span className="text-xs text-dark-500">({book.rating.count})</span>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-dark-500 mb-4">
          <span>{book.genre}</span>
          <span>{book.availableCopies}/{book.totalCopies} copies</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {book.availableCopies > 0 ? (
            <button
              onClick={() => onBorrow(book)}
              className="btn btn-primary btn-sm flex-1"
            >
              Borrow
            </button>
          ) : (
            <button
              onClick={() => onReserve(book)}
              className="btn btn-secondary btn-sm flex-1"
            >
              Reserve
            </button>
          )}
          <button className="btn btn-ghost btn-sm">View</button>
        </div>
      </div>
    </div>
  );
}
