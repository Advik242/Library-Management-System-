import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['fine', 'subscription', 'deposit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  relatedLoan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan'
  },
  relatedSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);
