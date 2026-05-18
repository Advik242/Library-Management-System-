import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoanCard from '../../components/loans/LoanCard';
import Modal from '../../components/common/Modal';
import PaymentModal from '../../components/payments/PaymentModal';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/loans/my-loans?status=${filter}`);
      setLoans(data.data);
    } catch (error) {
      toast.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = (loan) => {
    setSelectedLoan(loan);
    setActionType('return');
  };

  const handleRenew = async (loan) => {
    try {
      setProcessing(true);
      await api.post(`/loans/renew/${loan._id}`);
      toast.success('Loan renewed successfully!');
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to renew loan');
    } finally {
      setProcessing(false);
    }
  };

  const confirmReturn = async () => {
    try {
      setProcessing(true);
      const { data } = await api.post(`/loans/return/${selectedLoan._id}`, {
        condition: 'good'
      });

      if (data.data.fine?.amount > 0) {
        setShowPayment(true);
      } else {
        toast.success('Book returned successfully!');
        setSelectedLoan(null);
        setActionType(null);
        fetchLoans();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to return book');
    } finally {
      setProcessing(false);
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
        <h1 className="page-title">My <span className="text-gradient">Borrowed Books</span></h1>
        <p className="page-subtitle">Manage your book loans, track due dates, and renew books</p>
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

      {/* Loans List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {loans.length > 0 ? (
            loans.map((loan) => (
              <LoanCard
                key={loan._id}
                loan={loan}
                onReturn={handleReturn}
                onRenew={handleRenew}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-dark-400">No loans found</p>
            </div>
          )}
        </div>
      )}

      {/* Return Confirmation Modal */}
      <Modal
        isOpen={!!selectedLoan && actionType === 'return'}
        onClose={() => {
          setSelectedLoan(null);
          setActionType(null);
        }}
        title="Return Book"
      >
        {selectedLoan && (
          <div>
            <p className="text-dark-300 mb-6">
              Are you sure you want to return "{selectedLoan.book?.title}"?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedLoan(null);
                  setActionType(null);
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmReturn}
                disabled={processing}
                className="btn btn-primary flex-1"
              >
                {processing ? 'Processing...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      {showPayment && selectedLoan && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            setSelectedLoan(null);
            setActionType(null);
          }}
          amount={selectedLoan.fine?.amount || 0}
          type="fine"
          loanId={selectedLoan._id}
          onSuccess={() => {
            fetchLoans();
            setShowPayment(false);
            setSelectedLoan(null);
            setActionType(null);
          }}
        />
      )}
    </div>
  );
}
