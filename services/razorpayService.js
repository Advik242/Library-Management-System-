import Razorpay from "razorpay";
import crypto from "crypto";

let razorpay = null;

// Only initialize Razorpay if keys are present
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn("⚠️ Razorpay keys not found in .env. Payment features disabled.");
}

// Create a new order (only if Razorpay is initialized)
export const createOrder = async (amount, currency = "INR") => {
  if (!razorpay) {
    throw new Error("Razorpay not configured. Cannot create order.");
  }
  const options = {
    amount: amount * 100, // amount in paise
    currency,
    receipt: `receipt_${Date.now()}`,
  };
  return await razorpay.orders.create(options);
};

// Verify payment signature
export const verifyPayment = (orderId, paymentId, signature) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay not configured. Cannot verify payment.");
  }
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
};
