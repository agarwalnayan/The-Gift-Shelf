import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { createOrderRequestApi } from '../api/orderRequestApi.js';
import { getProductsApi } from '../api/productApi.js';
import Loader from '../components/common/Loader.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

const CreateSocialOrderPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [source, setSource] = useState('instagram');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [completionUrl, setCompletionUrl] = useState('');

  const searchProducts = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await getProductsApi({ search: query, limit: 10 });
      setSearchResults(data.data.products || []);
    } catch (error) {
      toast.error('Failed to search products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setQuantity(1);
    setCustomizations({});
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    const customizationArray = Object.entries(customizations).map(([key, value]) => {
      const option = selectedProduct.customizationOptions?.find(opt => opt.key === key);
      return {
        key,
        label: option?.label || key,
        type: option?.type || 'text',
        value,
        additionalPrice: option?.additionalPrice || 0,
      };
    });

    const item = {
      product: selectedProduct._id,
      name: selectedProduct.name,
      image: selectedProduct.images[0]?.url,
      variantSku: selectedVariant?.sku || null,
      quantity,
      price: selectedVariant?.price || selectedProduct.price,
      customizations: customizationArray,
      customizationPrice: customizationArray.reduce((sum, c) => sum + (c.additionalPrice || 0), 0),
    };

    setOrderItems([...orderItems, item]);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    setCustomizations({});
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      return sum + (item.price + item.customizationPrice) * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    if (!agreedPrice) {
      toast.error('Please enter the agreed price');
      return;
    }

    setIsCreating(true);
    try {
      const { data } = await createOrderRequestApi({
        source,
        items: orderItems,
        agreedPrice: parseFloat(agreedPrice),
        discount: discount ? parseFloat(discount) : 0,
        internalNotes,
      });

      setCreatedOrder(data.data.orderRequest);
      setCompletionUrl(data.data.completionUrl);
      toast.success('Order request created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order request');
    } finally {
      setIsCreating(false);
    }
  };

  const copyCompletionLink = () => {
    navigator.clipboard.writeText(completionUrl);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {createdOrder ? (
        <div className="space-y-6">
          <PageHeader
            title="Order Request Created"
            description="Social order request has been created successfully"
          />

          <div className="bg-white border border-ink/20 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-ink mb-2">Customer Completion Link</h3>
              <p className="text-sm text-ink/60 mb-4">
                Share this link with the customer to complete their order
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={completionUrl}
                readOnly
                className="flex-1 px-4 py-3 border border-ink/20 rounded-lg bg-ink/5 text-sm font-mono"
              />
              <button
                type="button"
                onClick={copyCompletionLink}
                className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Copy Link
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-ink/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-ink/50">Order ID:</span>
                  <p className="font-mono text-ink">{createdOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-ink/50">Source:</span>
                  <p className="text-ink capitalize">{createdOrder.source}</p>
                </div>
                <div>
                  <span className="text-ink/50">Items:</span>
                  <p className="text-ink">{createdOrder.items.length}</p>
                </div>
                <div>
                  <span className="text-ink/50">Amount:</span>
                  <p className="font-medium text-ink">₹{createdOrder.agreedPrice}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/social-orders')}
            >
              Back to Social Orders
            </Button>
            <Button
              type="button"
              onClick={() => {
                setCreatedOrder(null);
                setCompletionUrl('');
                setOrderItems([]);
                setAgreedPrice('');
                setDiscount('');
                setInternalNotes('');
              }}
            >
              Create Another Order
            </Button>
          </div>
        </div>
      ) : (
        <>
          <PageHeader
            title="Create Social Order"
            description="Create an order request for Instagram or WhatsApp customers"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Selection */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Source</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="instagram"
                checked={source === 'instagram'}
                onChange={(e) => setSource(e.target.value)}
                className="text-primary-600"
              />
              <span>Instagram</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="whatsapp"
                checked={source === 'whatsapp'}
                onChange={(e) => setSource(e.target.value)}
                className="text-primary-600"
              />
              <span>WhatsApp</span>
            </label>
          </div>
        </div>

        {/* Product Search */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Add Product</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<HiOutlineMagnifyingGlass size={18} />}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader size="small" />
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 border border-ink/20 rounded-lg bg-white max-h-60 overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handleProductSelect(product)}
                  className="w-full px-4 py-3 text-left hover:bg-ink/5 border-b border-ink/10 last:border-0"
                >
                  <div className="font-medium text-ink">{product.name}</div>
                  <div className="text-sm text-ink/60">₹{product.price}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Product Details */}
        {selectedProduct && (
          <div className="border border-ink/20 rounded-lg p-4 bg-white">
            <div className="flex items-start gap-4">
              <img
                src={selectedProduct.images[0]?.url}
                alt={selectedProduct.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-medium text-ink">{selectedProduct.name}</h3>
                <p className="text-sm text-ink/60">₹{selectedProduct.price}</p>

                {/* Variant Selection */}
                {selectedProduct.variants?.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-ink/70 mb-1">Variant</label>
                    <select
                      value={selectedVariant?.sku || ''}
                      onChange={(e) => {
                        const variant = selectedProduct.variants.find(v => v.sku === e.target.value);
                        setSelectedVariant(variant || null);
                      }}
                      className="w-full px-3 py-2 border border-ink/20 rounded-lg text-sm"
                    >
                      <option value="">Select variant</option>
                      {selectedProduct.variants
                        .filter(v => v.isActive)
                        .map((variant) => (
                          <option key={variant.sku} value={variant.sku}>
                            {variant.attributes.map(a => `${a.name}: ${a.value}`).join(' • ')} - ₹{variant.price || selectedProduct.price}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-ink/70 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-2 border border-ink/20 rounded-lg text-sm"
                  />
                </div>

                {/* Customizations */}
                {selectedProduct.customizationOptions?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedProduct.customizationOptions
                      .filter(opt => opt.isEnabled)
                      .map((option) => (
                        <div key={option.key}>
                          <label className="block text-xs font-medium text-ink/70 mb-1">
                            {option.label}
                            {option.isRequired && <span className="text-red-600">*</span>}
                          </label>
                          {option.type === 'dropdown' ? (
                            <select
                              value={customizations[option.key] || ''}
                              onChange={(e) => setCustomizations({ ...customizations, [option.key]: e.target.value })}
                              className="w-full px-3 py-2 border border-ink/20 rounded-lg text-sm"
                            >
                              <option value="">Select</option>
                              {option.choices?.map((choice) => (
                                <option key={choice} value={choice}>{choice}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder={option.placeholder || ''}
                              value={customizations[option.key] || ''}
                              onChange={(e) => setCustomizations({ ...customizations, [option.key]: e.target.value })}
                              className="w-full px-3 py-2 border border-ink/20 rounded-lg text-sm"
                            />
                          )}
                        </div>
                      ))}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-4"
                  size="sm"
                >
                  <HiOutlinePlus size={16} className="mr-1" />
                  Add to Order
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        {orderItems.length > 0 && (
          <div className="border border-ink/20 rounded-lg bg-white">
            <div className="px-4 py-3 border-b border-ink/10 bg-ink/5">
              <h3 className="font-medium text-ink">Order Items</h3>
            </div>
            <div className="divide-y divide-ink/10">
              {orderItems.map((item, index) => (
                <div key={index} className="px-4 py-3 flex items-start gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-ink">{item.name}</p>
                    {item.variantSku && (
                      <p className="text-sm text-ink/60">Variant: {item.variantSku}</p>
                    )}
                    <p className="text-sm text-ink/60">Qty: {item.quantity} × ₹{item.price}</p>
                    {item.customizations?.length > 0 && (
                      <p className="text-xs text-ink/50 mt-1">
                        {item.customizations.map(c => `${c.label}: ${c.value}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-ink/40 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-ink/10 bg-ink/5">
              <div className="flex justify-between font-medium">
                <span>Calculated Total:</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Price and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Agreed Price (₹)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(e.target.value)}
              placeholder="Enter agreed price"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Discount (₹)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Optional discount"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Internal Notes</label>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Optional internal notes..."
            rows={3}
            className="w-full px-4 py-2 border border-ink/20 rounded-lg text-sm"
            maxLength={1000}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/social-orders')}
          >
            <HiOutlineArrowLeft size={18} className="mr-2" />
            Back
          </Button>
          <Button
            type="submit"
            isLoading={isCreating}
            disabled={orderItems.length === 0 || !agreedPrice}
          >
            Create Order Request
          </Button>
        </div>
      </form>
        </>
      )}
    </div>
  );
};

export default CreateSocialOrderPage;
