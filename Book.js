import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    index: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  genre: {
    type: String,
    required: true,
    enum: [
      'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
      'Thriller', 'Romance', 'Horror', 'Biography', 'History',
      'Science', 'Technology', 'Business', 'Self-Help', 'Health',
      'Travel', 'Cooking', 'Art', 'Music', 'Sports',
      'Management', 'Finance', 'Accounting', 'Marketing', 'Operations',
      'Human Resources', 'Corporate Finance', 'Investment', 'Other'
    ],
    index: true
  },
  publisher: {
    type: String,
    default: ''
  },
  publishedYear: {
    type: Number
  },
  language: {
    type: String,
    default: 'English'
  },
  pages: {
    type: Number
  },
  coverImage: {
    type: String,
    default: ''
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  location: {
    shelf: String,
    row: String
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Text index for search
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

// Virtual for availability status
bookSchema.virtual('status').get(function() {
  if (!this.isActive) return 'Inactive';
  if (this.availableCopies === 0) return 'Checked Out';
  return 'Available';
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

export default mongoose.model('Book', bookSchema);
