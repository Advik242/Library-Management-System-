import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'ready', 'fulfilled', 'cancelled', 'expired'],
    default: 'waiting'
  },
  queuePosition: {
    type: Number,
    required: true
  },
  reservedAt: {
    type: Date,
    default: Date.now
  },
  readyAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for unique active reservation per user per book
reservationSchema.index(
  { user: 1, book: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: { $in: ['waiting', 'ready'] } }
  }
);

export default mongoose.model('Reservation', reservationSchema);
