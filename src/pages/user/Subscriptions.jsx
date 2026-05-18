import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Check, Star, Zap } from 'lucide-react';
import PaymentModal from '../../components/payments/PaymentModal';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Subscriptions() {
  const { user, fetchUser } = useAuth();
  const [plans, setPlans] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/subscriptions/plans');
      setPlans(data.data);
    } catch (error) {
      toast.error('Failed to fetch plans');
    }
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const currentPlan = user?.subscription?.plan || 'free';

  return (
    <div>
      {/* Header */}
      <div className="page-header text-center">
        <h1 className="page-title">Upgrade Your <span className="text-gradient">Experience</span></h1>
        <p className="page-subtitle">Choose a plan that works for you</p>
      </div>

      {/* Current Plan */}
      {currentPlan !== 'free' && user?.subscription?.isActive && (
        <div className="card p-6 mb-8 border-primary-500/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Current Plan</p>
              <h3 className="text-xl font-bold text-white capitalize">{currentPlan} Plan</h3>
              <p className="text-sm text-dark-400">
                Valid until {new Date(user.subscription.endDate).toLocaleDateString()}
              </p>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Free Plan */}
        <div className={`card p-6 ${currentPlan === 'free' ? 'border-primary-500' : ''}`}>
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white">Free</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-white">₹0</span>
              <span className="text-dark-400">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            {['Borrow up to 2 books', '2 renewals per book', '1 active reservation', 'Basic support'].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-dark-300">
                <Check className="w-5 h-5 text-green-400" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            disabled={currentPlan === 'free'}
            className="btn btn-secondary w-full"
          >
            {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
          </button>
        </div>

        {/* Silver Plan */}
        {plans?.silver && (
          <div className={`card p-6 ${currentPlan === 'silver' ? 'border-primary-500' : ''}`}>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-gray-400" />
                <h3 className="text-xl font-bold text-white">Silver</h3>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">₹{plans.silver.price}</span>
                <span className="text-dark-400">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plans.silver.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-dark-300">
                  <Check className="w-5 h-5 text-green-400" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('silver')}
              disabled={currentPlan === 'silver'}
              className="btn btn-primary w-full"
            >
              {currentPlan === 'silver' ? 'Current Plan' : 'Subscribe'}
            </button>
          </div>
        )}

        {/* Gold Plan */}
        {plans?.gold && (
          <div className={`card p-6 relative ${currentPlan === 'gold' ? 'border-primary-500' : 'border-yellow-500/50'}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Gold</h3>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">₹{plans.gold.price}</span>
                <span className="text-dark-400">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plans.gold.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-dark-300">
                  <Check className="w-5 h-5 text-green-400" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('gold')}
              disabled={currentPlan === 'gold'}
              className="btn btn-primary w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
            >
              {currentPlan === 'gold' ? 'Current Plan' : 'Subscribe'}
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedPlan && plans?.[selectedPlan] && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            setSelectedPlan(null);
          }}
          amount={plans[selectedPlan].price}
          type="subscription"
          subscriptionPlan={selectedPlan}
          onSuccess={() => {
            fetchUser();
            setShowPayment(false);
            setSelectedPlan(null);
            toast.success('Subscription activated!');
          }}
        />
      )}
    </div>
  );
}
