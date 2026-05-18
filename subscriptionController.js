import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

// Get subscription plans
export const getPlans = async (req, res, next) => {
  try {
    const plans = {
      silver: {
        name: 'Silver',
        price: 499,
        duration: '30 days',
        features: [
          'Borrow up to 5 books',
          '3 renewals per book',
          '3 active reservations',
          'Email notifications'
        ]
      },
      gold: {
        name: 'Gold',
        price: 999,
        duration: '30 days',
        features: [
          'Borrow up to 10 books',
          '5 renewals per book',
          '5 active reservations',
          'Priority support',
          'Early access to new books',
          'No late fee for first 3 days'
        ]
      }
    };

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

// Get my subscription
export const getMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    }).sort('-createdAt');

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      {
        user: req.user._id,
        status: 'active'
      },
      { 
        status: 'cancelled',
        autoRenew: false 
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Note: Subscription remains active until endDate
    res.json({
      success: true,
      message: 'Subscription cancelled. It will remain active until the end of the billing period.',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// Toggle auto-renew
export const toggleAutoRenew = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    subscription.autoRenew = !subscription.autoRenew;
    await subscription.save();

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// Get subscription history
export const getSubscriptionHistory = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({
      user: req.user._id
    }).sort('-createdAt');

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
};
