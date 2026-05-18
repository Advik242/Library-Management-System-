// Backend/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './models/Book.js';

dotenv.config();

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing books if you want a fresh start
    await Book.deleteMany();

    // Insert sample books with correct "genre" values
    await Book.insertMany([
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Fiction',
        isbn: '9780743273565',
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        genre: 'Science',
        isbn: '9780735211292',
      },
      {
        title: 'Harry Potter and the Philosopher\'s Stone',
        author: 'J.K. Rowling',
        genre: 'Fantasy',
        isbn: '9780747532743',
      },
      {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        genre: 'Human Resources',   // ✅ corrected to match enum
        isbn: '9780061122415',
      }
    ]);

    console.log('✅ Books seeded successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error seeding books:', err);
    mongoose.connection.close();
  }
};

seedBooks();
