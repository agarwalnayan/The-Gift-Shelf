import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineShoppingBag, HiOutlineMapPin, HiOutlineUser, HiOutlinePencil } from 'react-icons/hi2';
import { getPublicOrderRequestApi, completeOrderRequestApi } from '../api/orderRequestApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import CustomizationEditModal from '../components/customization/CustomizationEditModal.jsx';

const SocialOrderCompletionPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderRequest, setOrderRequest] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    giftMessage: '',
    orderNotes: '',
    createAccount: false,
    password: '',
    confirmPassword: '',
  });

  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [updatedCustomizations, setUpdatedCustomizations] = useState([]);

  useEffect(() => {
    loadOrderRequest();
  }, [token]);

  const loadOrderRequest = async () => {
    setIsLoading(true);
    try {
      const { data } = await getPublicOrderRequestApi(token);
      setOrderRequest(data.orderRequest);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load order request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        updatedCustomizations,
      };
      
      // Remove password fields if not creating account
      if (!formData.createAccount) {
        delete submissionData.password;
        delete submissionData.confirmPassword;
      }
      
      const { data } = await completeOrderRequestApi(token, submissionData);
      toast.success('Order completed successfully!');
      
      // Navigate to order success page with account creation status
      const orderSuccessData = {
        orderId: data.data.order._id,
        accountCreated: data.data.accountCreated,
      };
      navigate(`/order-success/${data.data.order._id}`, { state: orderSuccessData });
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(error.response?.data?.message || 'This email already has a TGS account. Please log in to your account.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to complete order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSaveCustomizations = (customizations) => {
    setUpdatedCustomizations(customizations);
    // Update orderRequest items with new customizations for display
    setOrderRequest(prev => ({
      ...prev,
      items: prev.items.map(item => {
        const updatedCustomization = customizations.find(c => c.key === item.customizations?.[0]?.key);
        if (updatedCustomization) {
          return {
            ...item,
            customizations: [updatedCustomization],
          };
        }
        return item;
      }),
    }));
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (error || !orderRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <EmptyState
          title="Order Request Not Found"
          description={error || 'This order request link is invalid or has expired.'}
        />
      </div>
    );
  }

  const totalItems = orderRequest.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
          <p className="text-gray-600">Please provide your shipping details to complete this order</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiOutlineShoppingBag size={20} className="text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>
                {orderRequest.items.some(item => item.customizations?.length > 0) && (
                  <button
                    type="button"
                    onClick={() => setIsCustomizationModalOpen(true)}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <HiOutlinePencil size={16} />
                    Edit Customization
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {orderRequest.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.variantSku && (
                        <p className="text-sm text-gray-500">Variant: {item.variantSku}</p>
                      )}
                      {item.customizations?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {item.customizations.map(c => `${c.label}: ${c.value}`).join(', ')}
                        </p>
                      )}
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                  <span>₹{orderRequest.agreedPrice - (orderRequest.discount || 0)}</span>
                </div>
                {orderRequest.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{orderRequest.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 text-lg pt-2">
                  <span>Total</span>
                  <span>₹{orderRequest.agreedPrice}</span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <HiOutlineCheck size={20} />
                  <span className="font-medium">Payment Already Received</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Paid via Google Pay</p>
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HiOutlineUser size={20} className="text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Full Name *"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                  <Input
                    label="Phone Number *"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit phone number"
                    required
                  />
                  <Input
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />

                  {/* Account Creation Option */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="createAccount"
                        checked={formData.createAccount}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-900">Create a TGS account</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-8">Save your details for faster checkout next time</p>

                    {formData.createAccount && (
                      <div className="mt-4 space-y-3 ml-8">
                        <Input
                          label="Password *"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Min 8 characters"
                          required
                        />
                        <Input
                          label="Confirm Password *"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Re-enter password"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HiOutlineMapPin size={20} className="text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Address Line 1 *"
                    name="line1"
                    value={formData.line1}
                    onChange={handleInputChange}
                    placeholder="Street address, building, etc."
                    required
                  />
                  <Input
                    label="Address Line 2 (Optional)"
                    name="line2"
                    value={formData.line2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc."
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City *"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                    />
                    <Input
                      label="State *"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      required
                    />
                  </div>
                  <Input
                    label="PIN Code *"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="6-digit PIN code"
                    required
                  />
                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </div>

              {/* Optional Messages */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gift Message (Optional)
                    </label>
                    <textarea
                      name="giftMessage"
                      value={formData.giftMessage}
                      onChange={handleInputChange}
                      placeholder="Add a gift message..."
                      rows={2}
                      maxLength={300}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions..."
                      rows={2}
                      maxLength={300}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full max-w-md"
              size="lg"
            >
              Confirm My Order
            </Button>
          </div>
        </form>
      </div>

      {/* Customization Edit Modal */}
      {orderRequest && orderRequest.items.some(item => item.customizations?.length > 0) && (
        <CustomizationEditModal
          isOpen={isCustomizationModalOpen}
          onClose={() => setIsCustomizationModalOpen(false)}
          customizationOptions={orderRequest.items[0]?.product?.customizationOptions || []}
          currentCustomizations={orderRequest.items[0].customizations || []}
          onSave={handleSaveCustomizations}
        />
      )}
    </div>
  );
};

export default SocialOrderCompletionPage;
