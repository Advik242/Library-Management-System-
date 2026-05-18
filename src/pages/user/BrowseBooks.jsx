import { useState, useEffect } from 'react';
import api from '../../api/axios';
import BookCard from '../../components/books/BookCard';
import BookFilter from '../../components/books/BookFilter';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [availability, setAvailability] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  // Modal
  const [selectedBook, setSelectedBook] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [search, genre, availability, sortBy, page]);

  const fetchGenres = async () => {
    try {
      const { data } = await api.get('/books/genres');
      setGenres(data.data);
    } catch (error) {
      console.error('Failed to fetch genres');
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 12,
        sortBy,
        order: 'desc'
      });

      if (search) params.append('search', search);
      if (genre) params.append('genre', genre);
      if (availability) params.append('availability', availability);

      const { data } = await api.get(`/books?${params}`);
      setBooks(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = (book) => {
    setSelectedBook(book);
    setActionType('borrow');
  };

  const handleReserve = (book) => {
    setSelectedBook(book);
    setActionType('reserve');
  };

  const confirmAction = async () => {
    try {
      setProcessing(true);
      
      if (actionType === 'borrow') {
        await api.post('/loans/borrow', { bookId: selectedBook._id });
        toast.success('Book borrowed successfully!');
      } else {
        await api.post('/reservations', { bookId: selectedBook._id });
        toast.success('Book reserved! You will be notified when available.');
      }

      setSelectedBook(null);
      setActionType(null);
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Browse Our <span className="text-gradient">Collection</span></h1>
        <p className="page-subtitle">Discover thousands of books across all genres</p>
      </div>

      {/* Filters */}
      <BookFilter
        search={search}
        setSearch={setSearch}
        genre={genre}
        setGenre={setGenre}
        availability={availability}
        setAvailability={setAvailability}
        sortBy={sortBy}
        setSortBy={setSortBy}
        genres={genres}
      />

      {/* Books Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onBorrow={handleBorrow}
                onReserve={handleReserve}
              />
            ))}
          </div>

          {books.length === 0 && (
            <div className="text-center py-12">
              <p className="text-dark-400">No books found matching your criteria</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.total }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    p === pagination.current
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedBook}
        onClose={() => {
          setSelectedBook(null);
          setActionType(null);
        }}
        title={actionType === 'borrow' ? 'Borrow Book' : 'Reserve Book'}
      >
        {selectedBook && (
          <div>
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-28 bg-dark-800 rounded-lg overflow-hidden flex-shrink-0">
                {selectedBook.coverImage ? (
                  <img src={selectedBook.coverImage} alt={selectedBook.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dark-600">📚</div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-white">{selectedBook.title}</h4>
                <p className="text-sm text-dark-400">{selectedBook.author}</p>
                <p className="text-sm text-dark-500 mt-2">{selectedBook.genre}</p>
              </div>
            </div>

            <p className="text-dark-300 mb-6">
              {actionType === 'borrow'
                ? 'You will have 14 days to return this book. Late returns will incur a fine of ₹5/day.'
                : 'You will be notified when this book becomes available. Your position in queue will be shown.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedBook(null);
                  setActionType(null);
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={processing}
                className="btn btn-primary flex-1"
              >
                {processing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
