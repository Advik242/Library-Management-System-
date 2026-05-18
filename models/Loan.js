import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'lost', 'damaged'],
    default: 'active',
    index: true
  },
  renewalCount: {
    type: Number,
    default: 0
  },
  maxRenewals: {
    type: Number,
    default: 2
  },
  fine: {
    amount: { type: Number, default: 0 },
    paid: { type: Boolean, default: false },
    paidDate: Date
  },
  notes: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate fine
loanSchema.methods.calculateFine = function() {
  if (this.status !== 'overdue' && this.status !== 'returned') {
    return 0;
  }
  
  const endDate = this.returnDate || new Date();
  const dueDate = new Date(this.dueDate);
  
  if (endDate <= dueDate) {
    return 0;
  }
  
  const daysOverdue = Math.ceil((endDate - dueDate) / (1000 * 60 * 60 * 24));
  const finePerDay = parseInt(process.env.FINE_PER_DAY) || 5;
  
  return daysOverdue * finePerDay;
};

// Check if can renew
loanSchema.methods.canRenew = function() {
  return this.status === 'active' && 
         this.renewalCount < this.maxRenewals &&
         new Date() <= this.dueDate;
};

export default mongoose.model('Loan', loanSchema);
