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
  const [editingItemIndex, setEditingItemIndex] = useState(null);
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
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        setError('This order link is invalid or has expired. Please contact The Gift Shelf.');
      } else if (errorMessage.includes('completed')) {
        setError('This order has already been confirmed.');
      } else {
        setError('We couldn\'t load your order right now. Please try again or contact The Gift Shelf.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submission
    if (isSubmitting) {
      return;
    }
    
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
      
      // Redirect based on account creation
      if (data.data.accountCreated) {
        // Redirect to login with email pre-filled
        navigate('/login', { state: { email: formData.email, accountCreated: true } });
      } else {
        // Redirect to order success page for guest orders
        navigate(`/order-success/${data.data.order._id}`, { state: { accountCreated: false } });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      if (error.response?.status === 409) {
        toast.error('An account already exists with this email. Please log in or use another email.');
      } else if (errorMessage.includes('completed')) {
        toast.error('This order has already been confirmed.');
      } else if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        toast.error('This order link is invalid or has expired. Please contact The Gift Shelf.');
      } else if (errorMessage.includes('customization') || errorMessage.includes('validation')) {
        toast.error('Please check your customization details.');
      } else if (errorMessage.includes('stock') || errorMessage.includes('available')) {
        toast.error('This item is currently out of stock. Please contact The Gift Shelf.');
      } else {
        toast.error('We couldn\'t complete your order right now. Please try again.');
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
    // Store customizations with item index
    setUpdatedCustomizations(prev => {
      const newCustomizations = [...prev];
      // Remove any existing customization for this item
      const filtered = newCustomizations.filter(c => c.itemIndex !== editingItemIndex);
      // Add new customizations with item index
      customizations.forEach(c => {
        filtered.push({ ...c, itemIndex: editingItemIndex });
      });
      return filtered;
    });
    
    // Update orderRequest items with new customizations for display
    setOrderRequest(prev => ({
      ...prev,
      items: prev.items.map((item, index) => {
        if (index === editingItemIndex) {
          return {
            ...item,
            customizations: customizations,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">The Gift Shelf</h1>
            <p className="text-sm text-gray-500 mt-1">Personalized gifting, made easy.</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-blue-800">
              Your order has already been arranged with our team. Please confirm your details below.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:order-first">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiOutlineShoppingBag size={20} className="text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>
              </div>

              <div className="space-y-4">
                {orderRequest.items.map((item, index) => (
                  <div key={index} className="flex gap-3 sm:gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                          {item.customizations?.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItemIndex(index);
                                setIsCustomizationModalOpen(true);
                              }}
                              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                              <HiOutlinePencil size={14} />
                              Edit
                            </button>
                          )}
                        </div>
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
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="createAccount"
                        checked={formData.createAccount}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Create a TGS account</span>
                        <p className="text-xs text-gray-500 mt-1">Save your details and track your future orders with TGS</p>
                      </div>
                    </label>

                    {formData.createAccount && (
                      <div className="mt-4 space-y-3">
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
          <div className="flex justify-center sticky bottom-0 bg-white py-4 border-t border-gray-200 -mx-4 px-4 sm:static sm:bg-transparent sm:border-0 sm:py-0 sm:px-0 sm:mt-6">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full max-w-md"
              size="lg"
            >
              Confirm My Order
            </Button>
          </div>
        </form>
      </div>

      {/* Customization Edit Modal */}
      {orderRequest && editingItemIndex !== null && (
        <CustomizationEditModal
          isOpen={isCustomizationModalOpen}
          onClose={() => {
            setIsCustomizationModalOpen(false);
            setEditingItemIndex(null);
          }}
          customizationOptions={orderRequest.items[editingItemIndex]?.product?.customizationOptions || []}
          currentCustomizations={orderRequest.items[editingItemIndex].customizations || []}
          onSave={handleSaveCustomizations}
        />
      )}
    </div>
  );
};

export default SocialOrderCompletionPage;
