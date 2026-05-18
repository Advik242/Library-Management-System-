import Payment from '../models/Payment.js';
import Fine from '../models/Fine.js';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import { createOrder, verifyPayment } from '../services/razorpayService.js';

// Create payment order
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { type, amount, loanId, subscriptionPlan } = req.body;

    const order = await createOrder(amount);

    const payment = await Payment.create({
      user: req.user._id,
      type,
      amount,
      razorpayOrderId: order.id,
      relatedLoan: loanId,
      metadata: { subscriptionPlan }
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment
export const verifyPaymentHandler = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    const isValid = verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (!isValid) {
      payment.status = 'failed';
      payment.failureReason = 'Signature verification failed';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    payment.status = 'success';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    // Handle based on payment type
    if (payment.type === 'fine') {
      await handleFinePayment(payment);
    } else if (payment.type === 'subscription') {
      await handleSubscriptionPayment(payment);
    }

    res.json({
      success: true,
      message: 'Payment successful'
    });
  } catch (error) {
    next(error);
  }
};

// Handle fine payment
async function handleFinePayment(payment) {
  // Update loan fine status
  if (payment.relatedLoan) {
    await Loan.findByIdAndUpdate(payment.relatedLoan, {
      'fine.paid': true,
      'fine.paidDate': new Date()
    });

    // Update fine record
    await Fine.findOneAndUpdate(
      { loan: payment.relatedLoan },
      { status: 'paid', payment: payment._id, paidAt: new Date() }
    );
  }

  // Update user unpaid fines
  await User.findByIdAndUpdate(payment.user, {
    $inc: { unpaidFines: -payment.amount }
  });
}

// Handle subscription payment
async function handleSubscriptionPayment(payment) {
  const Subscription = (await import('../models/Subscription.js')).default;
  const planDetails = Subscription.getPlanDetails(payment.metadata.subscriptionPlan);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + planDetails.duration);

  const subscription = await Subscription.create({
    user: payment.user,
    plan: payment.metadata.subscriptionPlan,
    price: payment.amount,
    endDate,
    paymentId: payment._id,
    features: planDetails
  });

  await User.findByIdAndUpdate(payment.user, {
    'subscription.plan': payment.metadata.subscriptionPlan,
    'subscription.startDate': new Date(),
    'subscription.endDate': endDate,
    'subscription.isActive': true,
    borrowLimit: planDetails.borrowLimit
  });

  payment.relatedSubscription = subscription._id;
  await payment.save();
}

// Get payment history
export const getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = req.user.role === 'admin' ? {} : { user: req.user._id };

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: payments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user fines
export const getUserFines = async (req, res, next) => {
  try {
    const fines = await Fine.find({
      user: req.user._id,
      status: 'pending'
    }).populate({
      path: 'loan',
      populate: { path: 'book', select: 'title author' }
    });

    res.json({
      success: true,
      data: fines
    });
  } catch (error) {
    next(error);
  }
};
