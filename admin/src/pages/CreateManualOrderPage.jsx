import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import FormGrid from '../components/common/FormGrid.jsx';
import OrderSummary from '../components/manual-order/OrderSummary.jsx';
import ProductSearch from '../components/manual-order/ProductSearch.jsx';
import CouponSelector from '../components/manual-order/CouponSelector.jsx';
import PincodeInput from '../components/common/PincodeInput.jsx';
import { searchUsersApi } from '../api/userApi.js';
import { getProductsApi } from '../api/productApi.js';
import { createManualOrderApi } from '../api/orderApi.js';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';

const CreateManualOrderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Customer Selection State
  const [customerMode, setCustomerMode] = useState('existing'); // 'existing' | 'new'
  const [customers, setCustomers] = useState([]);
  const [searchCustomerQuery, setSearchCustomerQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // New Customer State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    createAccount: false,
    password: '',
  });

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Products State
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  // Pricing & Payment
  const [manualSellingPrice, setManualSellingPrice] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('gpay');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [orderNotes, setOrderNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchCustomerQuery || searchCustomerQuery.trim().length < 2) {
        setCustomers([]);
        setHasSearched(false);
        return;
      }
      // Don't search if we already selected this exact name
      if (selectedUser && selectedUser.name === searchCustomerQuery) {
        return;
      }
      setSearchingCustomers(true);
      setHasSearched(true);
      try {
        const { data } = await searchUsersApi(searchCustomerQuery);
        setCustomers(data.data.users || []);
      } catch (error) {
        toast.error('Failed to search customers');
      } finally {
        setSearchingCustomers(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchCustomerQuery, selectedUser]);

  const fetchProducts = async () => {
    try {
      const { data } = await getProductsApi({ limit: 100 });
      setProducts(data.data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  // Calculate catalogue value from order items
  const catalogueValue = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      const product = item._productDetails;
      if (!product) return sum;
      
      let itemPrice = product.price;
      if (item.variantSku && product.variants) {
        const variant = product.variants.find(v => v.sku === item.variantSku);
        if (variant && variant.price !== null && variant.price !== undefined) {
          itemPrice = variant.price;
        }
      }
      
      // Add customization price
      const customizationPrice = item.customizations?.reduce((acc, curr) => acc + (curr.additionalPrice || 0), 0) || 0;
      
      return sum + (itemPrice + customizationPrice) * item.quantity;
    }, 0);
  }, [orderItems]);

  // Calculate final agreed price
  const agreedPrice = useMemo(() => {
    const couponDiscount = selectedCoupon ? selectedCoupon.discount : 0;
    return manualSellingPrice - couponDiscount + shippingPrice;
  }, [manualSellingPrice, selectedCoupon, shippingPrice]);

  // Auto-set manual selling price to catalogue value initially
  useEffect(() => {
    if (manualSellingPrice === 0 && catalogueValue > 0) {
      setManualSellingPrice(catalogueValue);
    }
  }, [catalogueValue, manualSellingPrice]);

  const handleSelectExistingCustomer = (user) => {
    setSelectedUser(user);
    setSearchCustomerQuery(user.name);
    setCustomers([]); // clear dropdown
    setShippingAddress({
      fullName: user.name,
      email: user.email,
      phone: user.phone || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    });
  };

  const handleSearchChange = (e) => {
    setSearchCustomerQuery(e.target.value);
    if (selectedUser) {
      setSelectedUser(null);
    }
  };

  const handleAddProduct = (product) => {
    setOrderItems([...orderItems, {
      product: product._id,
      name: product.name,
      variantSku: '',
      quantity: 1,
      customizations: [],
      // For UI reference:
      _productDetails: product
    }]);
  };

  const handleRemoveProduct = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleCustomizationChange = (itemIndex, customKey, type, additionalPrice, value) => {
    const newItems = [...orderItems];
    const existingCustomization = newItems[itemIndex].customizations.find(c => c.key === customKey);
    
    if (existingCustomization) {
      existingCustomization.value = value;
    } else {
      const optionDef = newItems[itemIndex]._productDetails.customizationOptions.find(o => o.key === customKey);
      newItems[itemIndex].customizations.push({
        key: customKey,
        label: optionDef.label,
        type,
        additionalPrice: additionalPrice || 0,
        value
      });
    }
    setOrderItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    if (customerMode === 'existing' && !selectedUser) {
      toast.error('Please select an existing customer');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: customerMode === 'existing' && selectedUser ? selectedUser._id : undefined,
        newCustomer: customerMode === 'new' && newCustomer.createAccount ? {
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          password: newCustomer.password,
        } : undefined,
        shippingAddress: customerMode === 'new' ? {
          ...shippingAddress,
          fullName: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
        } : shippingAddress,
        paymentMethod,
        paymentStatus,
        orderItems: orderItems.map(item => ({
          product: item.product,
          variantSku: item.variantSku || null,
          quantity: item.quantity,
          customizations: item.customizations,
        })),
        agreedPrice: Number(manualSellingPrice), // Send manual selling price, backend will calculate final
        shippingPrice: Number(shippingPrice),
        couponCode: selectedCoupon ? selectedCoupon.code : null,
        orderNotes,
        internalNotes,
        sendEmail,
      };

      const { data } = await createManualOrderApi(payload);
      if (data.data?.emailSent === false && sendEmail) {
        toast.error('Order created, but the confirmation email could not be sent');
      } else {
        toast.success('Order created successfully');
      }
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader title="Create Manual Order" description="Create an order manually on behalf of a customer" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Section */}
        <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-4">1. Customer Information</h2>
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setCustomerMode('existing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${customerMode === 'existing' ? 'bg-primary-600 text-white' : 'bg-ink/5 text-ink/70 hover:bg-ink/10'}`}
            >
              Existing Customer
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode('new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${customerMode === 'new' ? 'bg-primary-600 text-white' : 'bg-ink/5 text-ink/70 hover:bg-ink/10'}`}
            >
              New / Guest Customer
            </button>
          </div>

          {customerMode === 'existing' ? (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-ink/70 mb-1">Search Customer</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchCustomerQuery}
                  onChange={handleSearchChange}
                  className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                
                {!selectedUser && searchCustomerQuery.trim().length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-ink/10 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {searchingCustomers ? (
                      <div className="p-4 text-center text-sm text-ink/50">Searching...</div>
                    ) : customers.length > 0 ? (
                      <ul>
                        {customers.map(c => (
                          <li
                            key={c._id}
                            className="px-4 py-3 hover:bg-ink/5 cursor-pointer border-b border-ink/5 last:border-0"
                            onClick={() => handleSelectExistingCustomer(c)}
                          >
                            <div className="font-medium text-ink flex justify-between">
                              <span>{c.name}</span>
                              <span className="text-primary-600 text-xs">Select</span>
                            </div>
                            <div className="text-ink/60 text-xs mt-0.5">{c.email} | {c.phone}</div>
                          </li>
                        ))}
                      </ul>
                    ) : hasSearched ? (
                      <div className="p-4 text-center text-sm text-ink/50">No TGS customers found.</div>
                    ) : null}
                  </div>
                )}
                {selectedUser && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Customer Selected: {selectedUser.name}</p>
                    <p className="text-xs text-green-700">{selectedUser.email} | {selectedUser.phone}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <FormGrid>
              <Input label="Full Name" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} required />
              <Input label="Email Address" type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} required />
              <Input label="Phone Number" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} required />
              <div className="col-span-full mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newCustomer.createAccount} onChange={(e) => setNewCustomer({ ...newCustomer, createAccount: e.target.checked })} className="rounded border-ink/20 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm font-medium text-ink/70">Create a TGS Account for this customer</span>
                </label>
              </div>
              {newCustomer.createAccount && (
                <Input label="Account Password" type="password" value={newCustomer.password} onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })} required />
              )}
            </FormGrid>
          )}

          <div className="mt-6 pt-6 border-t border-ink/10">
            <h3 className="text-md font-medium text-ink mb-4">Delivery Address</h3>
            <FormGrid>
              {customerMode === 'existing' && (
                <>
                  <Input label="Receiver Full Name" value={shippingAddress.fullName} onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })} required />
                  <Input label="Receiver Phone" value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} required />
                  <Input label="Receiver Email" value={shippingAddress.email} onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })} required />
                </>
              )}
              <Input label="Address Line 1" value={shippingAddress.line1} onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })} required />
              <Input label="Address Line 2 (Optional)" value={shippingAddress.line2} onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })} />
              <Input label="City" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} required />
              <Input label="State" value={shippingAddress.state} onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} required />
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Postal Code</label>
                <PincodeInput
                  value={shippingAddress.postalCode}
                  onChange={(value) => setShippingAddress({ ...shippingAddress, postalCode: value })}
                  onCityStateFound={(locationData) => {
                    if (locationData) {
                      setShippingAddress(prev => ({
                        ...prev,
                        city: locationData.city || prev.city,
                        state: locationData.state || prev.state
                      }));
                    }
                  }}
                />
              </div>
              <Input label="Country" value={shippingAddress.country} onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })} required />
            </FormGrid>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-ink">2. Products</h2>
            <ProductSearch 
              products={products} 
              onProductSelect={handleAddProduct}
              isLoading={false}
            />
          </div>

          <div className="space-y-4">
            {orderItems.map((item, index) => {
              const product = item._productDetails;
              const currentPrice = item.variantSku && product.variants 
                ? (product.variants.find(v => v.sku === item.variantSku)?.price ?? product.price)
                : product.price;
              
              return (
                <div key={index} className="p-4 border border-ink/10 rounded-xl relative bg-ink/5">
                  <button type="button" onClick={() => handleRemoveProduct(index)} className="absolute top-4 right-4 text-ink/40 hover:text-red-500">
                    <HiOutlineTrash size={18} />
                  </button>
                  
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-ink/10 shrink-0 overflow-hidden">
                      {product.images?.[0] && (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-ink mb-1 pr-8">{item.name}</h3>
                      <div className="text-sm text-ink/60">
                        SKU: {product.sku} • Price: ₹{currentPrice}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Variant Selector */}
                    {product.variants && product.variants.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-ink/70 mb-1">Variant</label>
                        <select
                          value={item.variantSku}
                          onChange={(e) => handleItemChange(index, 'variantSku', e.target.value)}
                          className="w-full rounded-xl border border-ink/20 px-4 py-2 outline-none text-sm focus:border-primary-500"
                        >
                          <option value="">-- Select Variant --</option>
                          {product.variants.filter(v => v.isActive).map(v => {
                            const variantName = v.attributes && v.attributes.length > 0
                              ? v.attributes.map(attr => attr.value).join(' / ')
                              : v.sku;
                            const variantPrice = v.price !== null && v.price !== undefined ? v.price : product.price;
                            return (
                              <option key={v.sku} value={v.sku}>
                                {variantName} — ₹{variantPrice} — Stock: {v.stock}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                    
                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-ink/70 mb-1">Quantity</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleItemChange(index, 'quantity', Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-lg border border-ink/20 flex items-center justify-center hover:bg-ink/5 text-ink"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-16 rounded-lg border border-ink/20 px-2 py-2 text-center text-sm focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleItemChange(index, 'quantity', item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-ink/20 flex items-center justify-center hover:bg-ink/5 text-ink"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item Price Display */}
                  <div className="mt-3 pt-3 border-t border-ink/10 flex justify-between items-center">
                    <span className="text-sm text-ink/70">Item Price:</span>
                    <span className="font-semibold text-ink">₹{(currentPrice * item.quantity).toFixed(2)}</span>
                  </div>

                  {/* Customizations */}
                  {product.customizationOptions && product.customizationOptions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-ink/10">
                      <h4 className="text-sm font-medium text-ink mb-3">Customizations</h4>
                      <div className="space-y-3">
                        {product.customizationOptions.filter(o => o.isEnabled).map(option => (
                          <div key={option.key}>
                            <label className="block text-sm font-medium text-ink/70 mb-1">
                              {option.label}
                              {option.isRequired && <span className="text-red-500 ml-1">*</span>}
                              {option.additionalPrice > 0 && <span className="text-ink/50 ml-1">(+₹{option.additionalPrice})</span>}
                              {option.helpText && <span className="block text-xs text-ink/40 font-normal mt-0.5">{option.helpText}</span>}
                            </label>
                            {/* CHOICE-BASED: dropdown, font_selection, greeting_card, gift_wrapping, text_color */}
                            {['dropdown', 'font_selection', 'greeting_card', 'gift_wrapping', 'text_color'].includes(option.type) && option.choices?.length > 0 ? (
                              <select
                                required={option.isRequired}
                                defaultValue=""
                                className="w-full rounded-xl border border-ink/20 px-4 py-2 outline-none text-sm focus:border-primary-500"
                                onChange={(e) => handleCustomizationChange(index, option.key, option.type, option.additionalPrice, e.target.value)}
                              >
                                <option value="" disabled>Select {option.label}...</option>
                                {option.choices.map(choice => (
                                  <option key={choice} value={choice}>{choice}</option>
                                ))}
                              </select>
                            ) : option.type === 'date_input' ? (
                              /* DATE INPUT */
                              <input
                                type="date"
                                required={option.isRequired}
                                min={option.validation?.minDate ? new Date(option.validation.minDate).toISOString().split('T')[0] : undefined}
                                max={option.validation?.maxDate ? new Date(option.validation.maxDate).toISOString().split('T')[0] : undefined}
                                className="w-full rounded-xl border border-ink/20 px-4 py-2 outline-none text-sm focus:border-primary-500"
                                onChange={(e) => handleCustomizationChange(index, option.key, option.type, option.additionalPrice, e.target.value)}
                              />
                            ) : ['image_upload', 'multi_image_upload'].includes(option.type) ? (
                              /* IMAGE UPLOAD — not supported in manual order, display notice */
                              <div className="text-xs text-ink/50 italic bg-ink/5 rounded-lg px-3 py-2">
                                Image upload not supported in manual orders. Leave blank or handle offline.
                              </div>
                            ) : (
                              /* TEXT-BASED: text_input, multi_text_input, gift_message, special_instructions */
                              <textarea
                                required={option.isRequired}
                                placeholder={option.placeholder || `Enter ${option.label}...`}
                                maxLength={option.validation?.maxLength || undefined}
                                rows={['multi_text_input', 'gift_message', 'special_instructions'].includes(option.type) ? 3 : 1}
                                className="w-full rounded-xl border border-ink/20 px-4 py-2 outline-none text-sm focus:border-primary-500 resize-none"
                                onChange={(e) => handleCustomizationChange(index, option.key, option.type, option.additionalPrice, e.target.value)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {orderItems.length === 0 && (
              <div className="text-center py-8 text-ink/50 text-sm bg-ink/5 rounded-xl border border-dashed border-ink/20">
                No products added yet. Click "Add Product" to start.
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Commercials */}
        <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-4">3. Commercials & Payment</h2>
          
          <div className="space-y-6">
            {/* Commercial Breakdown */}
            <div className="bg-ink/5 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-ink/70 font-medium">Catalogue / MRP Value</span>
                <span className="text-ink font-semibold">₹{catalogueValue.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-ink/70 font-medium">Manual Selling Price</span>
                <div className="flex items-center gap-2">
                  <span className="text-ink font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={manualSellingPrice}
                    onChange={(e) => setManualSellingPrice(Number(e.target.value))}
                    className="w-32 rounded-lg border border-ink/20 px-3 py-1.5 text-right font-semibold text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              {catalogueValue - manualSellingPrice > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-ink/10">
                  <span className="text-green-600 font-medium">Customer Saves</span>
                  <span className="text-green-600 font-bold">₹{(catalogueValue - manualSellingPrice).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Coupon & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Coupon / Promotion</label>
                <CouponSelector
                  selectedCoupon={selectedCoupon}
                  onCouponSelect={setSelectedCoupon}
                  onCouponRemove={() => setSelectedCoupon(null)}
                  catalogueValue={catalogueValue}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Shipping Price</label>
                <input
                  type="number"
                  min="0"
                  value={shippingPrice}
                  onChange={(e) => setShippingPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Payment Method & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none focus:border-primary-500"
                >
                  <option value="razorpay">Razorpay Link (Future)</option>
                  <option value="whatsapp">WhatsApp / Manual</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="gpay">Google Pay</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none focus:border-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Final Amount Display */}
            <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
              <div className="flex justify-between items-center">
                <span className="text-ink/70 font-medium">Final Amount</span>
                <span className="text-xl font-bold text-primary-600">₹{agreedPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Notification */}
        <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-4">4. Final Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1">Internal Notes (Hidden from customer)</label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none focus:border-primary-500"
                rows="3"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1">Order Notes (Customer Facing)</label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none focus:border-primary-500"
                rows="2"
              ></textarea>
            </div>
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="rounded border-ink/20 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium text-ink/70">Send confirmation email to customer</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={() => navigate('/orders')} type="button">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={loading}>Create Manual Order</Button>
        </div>
      </form>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <OrderSummary 
            orderItems={orderItems}
            catalogueValue={catalogueValue}
            manualSellingPrice={manualSellingPrice}
            couponDiscount={selectedCoupon ? selectedCoupon.discount : 0}
            shippingPrice={shippingPrice}
            agreedPrice={agreedPrice}
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default CreateManualOrderPage;
