import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import BookCard from '../../components/books/BookCard';
import Loader from '../../components/common/Loader';
import { Heart } from 'lucide-react';

export default function Wishlist() {
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch('/auth/me');

  const wishlistBooks = data?.wishlist || [];

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
        <h1 className="page-title">My <span className="text-gradient">Wishlist</span></h1>
        <p className="page-subtitle">Books you've saved for later</p>
      </div>

      {/* Books Grid */}
      {wishlistBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onBorrow={() => {}}
              onReserve={() => {}}
              onWishlistToggle={refetch}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Heart className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Your wishlist is empty</h3>
          <p className="text-dark-400">Start adding books you'd like to read later!</p>
        </div>
      )}
    </div>
  );
}
