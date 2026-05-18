import cron from 'node-cron';
import Loan from '../models/Loan.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import Fine from '../models/Fine.js';
import { sendDueDateReminder, sendOverdueNotice } from './emailService.js';

export const startScheduler = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily scheduler...');
    
    await markOverdueLoans();
    await sendReminders();
    await expireReservations();
    await expireSubscriptions();
  });

  console.log('Scheduler started');
};

// Mark overdue loans
async function markOverdueLoans() {
  try {
    const overdueLoans = await Loan.find({
      status: 'active',
      dueDate: { $lt: new Date() }
    }).populate('user book');

    for (const loan of overdueLoans) {
      loan.status = 'overdue';
      const fineAmount = loan.calculateFine();
      loan.fine.amount = fineAmount;
      await loan.save();

      // Create fine record
      await Fine.create({
        user: loan.user._id,
        loan: loan._id,
        amount: fineAmount,
        reason: 'overdue',
        daysOverdue: Math.ceil((new Date() - loan.dueDate) / (1000 * 60 * 60 * 24))
      });

      // Update user unpaid fines
      await User.findByIdAndUpdate(loan.user._id, {
        $inc: { unpaidFines: fineAmount }
      });

      // Send notification
      await sendOverdueNotice(loan, fineAmount);
    }

    console.log(`Marked ${overdueLoans.length} loans as overdue`);
  } catch (error) {
    console.error('Error marking overdue loans:', error);
  }
}

// Send due date reminders
async function sendReminders() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingDue = await Loan.find({
      status: 'active',
      dueDate: { $gte: today, $lte: tomorrow }
    }).populate('user book');

    for (const loan of upcomingDue) {
      await sendDueDateReminder(loan);
    }

    console.log(`Sent ${upcomingDue.length} due date reminders`);
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
}

// Expire ready reservations
async function expireReservations() {
  try {
    const expired = await Reservation.updateMany(
      {
        status: 'ready',
        expiresAt: { $lt: new Date() }
      },
      { status: 'expired' }
    );

    console.log(`Expired ${expired.modifiedCount} reservations`);
  } catch (error) {
    console.error('Error expiring reservations:', error);
  }
}

// Expire subscriptions
async function expireSubscriptions() {
  try {
    const Subscription = (await import('../models/Subscription.js')).default;

    const expired = await Subscription.find({
      status: 'active',
      endDate: { $lt: new Date() }
    });

    for (const sub of expired) {
      sub.status = 'expired';
      await sub.save();

      // Reset user subscription
      await User.findByIdAndUpdate(sub.user, {
        'subscription.plan': 'free',
        'subscription.isActive': false,
        borrowLimit: 2
      });
    }

    console.log(`Expired ${expired.length} subscriptions`);
  } catch (error) {
    console.error('Error expiring subscriptions:', error);
  }
}
