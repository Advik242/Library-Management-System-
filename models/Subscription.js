import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['silver', 'gold'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  features: {
    borrowLimit: Number,
    renewalLimit: Number,
    reservationLimit: Number,
    prioritySupport: Boolean
  }
}, {
  timestamps: true
});

// Static method to get plan details
subscriptionSchema.statics.getPlanDetails = function(plan) {
  const plans = {
    silver: {
      price: 499,
      duration: 30,
      borrowLimit: 5,
      renewalLimit: 3,
      reservationLimit: 3,
      prioritySupport: false
    },
    gold: {
      price: 999,
      duration: 30,
      borrowLimit: 10,
      renewalLimit: 5,
      reservationLimit: 5,
      prioritySupport: true
    }
  };
  return plans[plan];
};

export default mongoose.model('Subscription', subscriptionSchema);
