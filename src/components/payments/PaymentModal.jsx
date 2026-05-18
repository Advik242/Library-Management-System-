import { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, amount, type, loanId, subscriptionPlan, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create order
      const { data } = await api.post('/payments/create-order', {
        type,
        amount,
        loanId,
        subscriptionPlan
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'BookNest Library',
        description: type === 'fine' ? 'Fine Payment' : 'Subscription Payment',
        order_id: data.data.orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: data.data.paymentId
            });
            toast.success('Payment successful!');
            onSuccess?.();
            onClose();
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#7c3aed'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment">
      <div className="text-center py-6">
        <div className="text-4xl font-bold text-white mb-2">
          ₹{amount}
        </div>
        <p className="text-dark-400 mb-6">
          {type === 'fine' ? 'Fine Payment' : `${subscriptionPlan} Subscription`}
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="btn btn-primary btn-lg w-full"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        <p className="text-xs text-dark-500 mt-4">
          Secured by Razorpay
        </p>
      </div>
    </Modal>
  );
}
