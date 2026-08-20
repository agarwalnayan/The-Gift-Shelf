import { useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineCheck, HiOutlineShoppingBag, HiOutlineArrowRight } from 'react-icons/hi2';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, accountCreated } = location.state || {};

  const orderNumber = orderId ? orderId.toString().slice(-8).toUpperCase() : 'Unknown';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <HiOutlineCheck size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your order</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono font-semibold text-gray-900">#{orderNumber}</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-gray-600">Payment Status</span>
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <HiOutlineCheck size={18} />
                Paid via Google Pay
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order Status</span>
              <span className="text-blue-600 font-medium">Confirmed</span>
            </div>
          </div>
        </div>

        {/* Account Creation Message */}
        {accountCreated && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <HiOutlineCheck size={24} className="text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">TGS Account Created</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Your account has been created successfully. You can now log in to track your orders and manage your account.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Login to Your Account
                  <HiOutlineArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <HiOutlineCheck size={20} className="text-green-600 mt-0.5" />
              <span>You'll receive an order confirmation email shortly</span>
            </li>
            <li className="flex items-start gap-3">
              <HiOutlineCheck size={20} className="text-green-600 mt-0.5" />
              <span>We'll prepare your order and ship it as soon as possible</span>
            </li>
            <li className="flex items-start gap-3">
              <HiOutlineCheck size={20} className="text-green-600 mt-0.5" />
              <span>You'll receive tracking information once your order ships</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <HiOutlineShoppingBag size={20} />
            Continue Shopping
          </button>
          {!accountCreated && (
            <button
              onClick={() => navigate('/login')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Login to Your Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
