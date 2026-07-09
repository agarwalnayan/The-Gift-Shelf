import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiChevronRight, HiOutlineMinus, HiOutlinePlus, HiOutlineCloudArrowUp, HiOutlineShieldCheck, HiOutlineGiftTop, HiOutlineSparkles, HiOutlineTruck, HiOutlineCheckBadge } from 'react-icons/hi2';
import { getProductBySlugApi, uploadCustomizationImageApi, getProductsApi } from '../api/productApi.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import Accordion from '../components/common/Accordion.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';

const hasValue = (value) => {
  if (value === undefined || value === null) return false;
  if (value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantSku, setSelectedVariantSku] = useState('');
  const [customizationValues, setCustomizationValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadingOptions, setUploadingOptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    setCustomizationValues({});
    setValidationErrors({});
    setSelectedVariantSku('');
    setActiveImage(0);
    setQuantity(1);
    getProductBySlugApi(slug)
      .then(({ data }) => {
        const productData = data.data.product;
        setProduct(productData);

        const firstActiveVariant = (productData.variants || []).find((variant) => variant.isActive !== false);
        setSelectedVariantSku(firstActiveVariant?.sku || '');
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product?.category?._id) {
      setRecommended([]);
      return;
    }
    getProductsApi({ category: product.category._id, limit: 8 })
      .then(({ data }) => {
        setRecommended((data.data.products || []).filter((item) => item._id !== product._id));
      })
      .catch(() => setRecommended([]));
  }, [product]);

  const variants = useMemo(() => (product?.variants || []).filter((variant) => variant.isActive !== false), [product]);
  const customizationOptions = useMemo(() => {
    return (product?.customizationOptions || [])
      .filter((option) => option.isEnabled)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [product]);

  const activeVariant = useMemo(() => {
    return variants.find((variant) => variant.sku === selectedVariantSku) || null;
  }, [selectedVariantSku, variants]);

  const basePrice = product?.discountPrice > 0 ? product?.discountPrice : product?.price;
  const displayPrice = activeVariant?.price ?? basePrice;
  const hasDiscount = product?.discountPrice > 0 && product?.discountPrice < product?.price && !activeVariant?.price;

  const customizationSurcharge = useMemo(() => {
    return customizationOptions.reduce((sum, option) => {
      const value = customizationValues[option.key];
      if (!hasValue(value)) return sum;
      return sum + (option.additionalPrice || 0);
    }, 0);
  }, [customizationOptions, customizationValues]);

  const estimatedUnitPrice = (displayPrice || 0) + customizationSurcharge;

  const updateCustomizationValue = (optionKey, value) => {
    setCustomizationValues((prev) => ({ ...prev, [optionKey]: value }));
    setValidationErrors((prev) => ({ ...prev, [optionKey]: undefined }));
  };

  const validateCustomizations = () => {
    const errors = {};

    customizationOptions.forEach((option) => {
      const value = customizationValues[option.key];
      const hasSelection = hasValue(value);

      if (option.isRequired && !hasSelection) {
        errors[option.key] = `${option.label} is required`;
        return;
      }

      if (!hasSelection) return;

      const validationRules = option.validation || {};

      if (['text_input', 'multi_text_input', 'gift_message', 'special_instructions'].includes(option.type)) {
        const values = Array.isArray(value) ? value : [value];
        values.forEach((text) => {
          if (typeof text !== 'string') return;
          if (validationRules.minLength && text.trim().length < validationRules.minLength) {
            errors[option.key] = `${option.label} must be at least ${validationRules.minLength} characters`;
          }
          if (validationRules.maxLength && text.trim().length > validationRules.maxLength) {
            errors[option.key] = `${option.label} cannot exceed ${validationRules.maxLength} characters`;
          }
        });

        if (option.type === 'multi_text_input') {
          const items = Array.isArray(value) ? value : [];
          if (validationRules.minSelections && items.length < validationRules.minSelections) {
            errors[option.key] = `${option.label} requires at least ${validationRules.minSelections} entries`;
          }
          if (validationRules.maxSelections && items.length > validationRules.maxSelections) {
            errors[option.key] = `${option.label} allows at most ${validationRules.maxSelections} entries`;
          }
        }
      }

      if (option.type === 'date_input' && value) {
        const parsedDate = new Date(value);
        if (Number.isNaN(parsedDate.getTime())) {
          errors[option.key] = `${option.label} must be a valid date`;
        }
      }

      if (option.type === 'multi_image_upload' && Array.isArray(value) && validationRules.minSelections) {
        if (value.length < validationRules.minSelections) {
          errors[option.key] = `${option.label} requires at least ${validationRules.minSelections} images`;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      return;
    }

    const isValid = validateCustomizations();
    if (!isValid) {
      toast.error('Please complete the required customization fields');
      return;
    }

    setIsAdding(true);
    try {
      const customizations = customizationOptions
        .map((option) => {
          const value = customizationValues[option.key];
          if (!hasValue(value)) return null;
          return {
            key: option.key,
            label: option.label,
            type: option.type,
            value,
            additionalPrice: option.additionalPrice || 0,
          };
        })
        .filter(Boolean);

      await addItem(product._id, quantity, {
        variantSku: selectedVariantSku || null,
        customizations,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleImageUpload = async (option, files) => {
    if (!files?.length) return;

    setUploadingOptions((prev) => ({ ...prev, [option.key]: true }));
    try {
      const uploadedUrls = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await uploadCustomizationImageApi(product._id, formData);
        uploadedUrls.push(data.data.url);
      }

      if (option.type === 'multi_image_upload') {
        updateCustomizationValue(option.key, uploadedUrls);
      } else {
        updateCustomizationValue(option.key, uploadedUrls[0] || '');
      }

      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingOptions((prev) => ({ ...prev, [option.key]: false }));
    }
  };

  if (isLoading) return <Loader fullScreen />;
  if (!product) return null;

  // Structured description sections built only from data already present on the product.
  const specRows = [
    product.category?.name && { label: 'Category', value: product.category.name },
    activeVariant?.sku && { label: 'SKU', value: activeVariant.sku },
    !activeVariant?.sku && product.sku && { label: 'SKU', value: product.sku },
    { label: 'Availability', value: product.stock > 0 ? 'In stock' : 'Out of stock' },
    variants.length > 0 && { label: 'Variants available', value: `${variants.length}` },
  ].filter(Boolean);

  const variantAttributeRows = (activeVariant?.attributes || []).map((attribute) => ({
    label: attribute.name,
    value: attribute.value,
  }));

  const accordionItems = [
    {
      key: 'about',
      title: 'About this Gift',
      content: <p className="whitespace-pre-line">{product.description}</p>,
    },
    customizationOptions.length > 0 && {
      key: 'features',
      title: 'Features',
      content: (
        <ul className="list-disc space-y-1.5 pl-4">
          {product.category?.name && <li>Part of our {product.category.name} collection</li>}
          <li>{customizationOptions.length} personalization option{customizationOptions.length > 1 ? 's' : ''} available</li>
          {variants.length > 0 && <li>{variants.length} variant{variants.length > 1 ? 's' : ''} to choose from</li>}
          <li>Carefully packaged and quality checked before dispatch</li>
        </ul>
      ),
    },
    (specRows.length > 0 || variantAttributeRows.length > 0) && {
      key: 'specifications',
      title: 'Specifications',
      content: (
        <dl className="divide-y divide-charcoal/10">
          {[...specRows, ...variantAttributeRows].map((row) => (
            <div key={row.label} className="flex justify-between gap-4 py-2 first:pt-0">
              <dt className="text-charcoal/50">{row.label}</dt>
              <dd className="text-right font-medium text-charcoal">{row.value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    {
      key: 'delivery',
      title: 'Delivery Information',
      content: (
        <div className="space-y-2">
          <p>Standard delivery typically takes 4–7 business days across India.</p>
          {customizationOptions.length > 0 && (
            <p>Personalized items are handcrafted to order, so please allow extra time for production before dispatch.</p>
          )}
          <p>You'll receive tracking details by email as soon as your order ships.</p>
        </div>
      ),
    },
    {
      key: 'returns',
      title: 'Return Policy',
      content: (
        <div className="space-y-2">
          <p>We want you to love your gift. Unpersonalized items in original condition can be returned within 7 days of delivery.</p>
          {customizationOptions.length > 0 && (
            <p>Because personalized items are made specifically for you, they can only be returned if they arrive damaged or defective.</p>
          )}
          <p>Reach out to our support team to start a return or exchange.</p>
        </div>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="container-tgs py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-charcoal/50 sm:text-sm">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <HiChevronRight size={14} />
        <Link to="/products" className="hover:text-primary-600">Shop</Link>
        {product.category?.name && (
          <>
            <HiChevronRight size={14} />
            <Link to={`/products?category=${product.category._id}`} className="hover:text-primary-600">
              {product.category.name}
            </Link>
          </>
        )}
        <HiChevronRight size={14} />
        <span className="truncate text-charcoal/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="aspect-square overflow-hidden rounded-3xl bg-white shadow-sm">
            <img
              src={product.images[activeImage]?.url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, index) => (
                <button
                  key={img.publicId}
                  onClick={() => setActiveImage(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImage === index ? 'border-primary-600' : 'border-transparent hover:border-charcoal/15'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category?.name && (
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 sm:text-sm">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-2xl font-semibold leading-tight text-charcoal sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold text-charcoal sm:text-3xl">
              ₹{estimatedUnitPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-base text-charcoal/40 line-through sm:text-lg">₹{product.price}</span>
            )}
            {customizationSurcharge > 0 && (
              <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
                incl. ₹{customizationSurcharge} personalization
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-charcoal/50">Inclusive of all taxes</p>

          {product.stock === 0 ? (
            <span className="mt-4 inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
              Out of stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="mt-4 inline-flex w-fit items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Only {product.stock} left in stock
            </span>
          ) : null}

          {/* Variant selector */}
          {variants.length > 0 && (
            <div className="mt-8 rounded-2xl border border-charcoal/10 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-charcoal/70">Select Variant</h3>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {variants.map((variant) => {
                  const variantLabel = variant.attributes?.map((attribute) => `${attribute.name}: ${attribute.value}`).join(' • ');
                  const isSelected = selectedVariantSku === variant.sku;
                  return (
                    <button
                      key={variant.sku}
                      type="button"
                      onClick={() => setSelectedVariantSku(variant.sku)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        isSelected
                          ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                          : 'border-charcoal/20 bg-white text-charcoal hover:border-charcoal/40'
                      }`}
                    >
                      {variantLabel || variant.sku}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personalization */}
          {customizationOptions.length > 0 && (
            <div className="mt-8 rounded-2xl border border-charcoal/10 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-charcoal/70">Personalize Your Gift</h3>
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
                  {customizationOptions.length} option{customizationOptions.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-5 space-y-5">
                {customizationOptions.map((option) => {
                  const currentValue = customizationValues[option.key];
                  const error = validationErrors[option.key];

                  const renderField = () => {
                    if (option.type === 'image_upload' || option.type === 'multi_image_upload') {
                      return (
                        <div className="space-y-3">
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-charcoal/20 px-4 py-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/40">
                            <HiOutlineCloudArrowUp size={24} className="text-charcoal/40" />
                            <span className="text-sm text-charcoal/60">
                              {uploadingOptions[option.key] ? 'Uploading…' : 'Click to upload or drag an image here'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple={option.type === 'multi_image_upload'}
                              onChange={(event) => handleImageUpload(option, event.target.files)}
                              className="hidden"
                            />
                          </label>
                          {option.type === 'multi_image_upload' && Array.isArray(currentValue) && currentValue.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {currentValue.map((url) => (
                                <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg border border-charcoal/10 object-cover" />
                              ))}
                            </div>
                          )}
                          {option.type === 'image_upload' && typeof currentValue === 'string' && currentValue && (
                            <img src={currentValue} alt="" className="h-16 w-16 rounded-lg border border-charcoal/10 object-cover" />
                          )}
                        </div>
                      );
                    }

                    if (option.type === 'multi_text_input') {
                      const values = Array.isArray(currentValue) ? currentValue : [];
                      return (
                        <div className="space-y-2">
                          {values.map((text, index) => (
                            <div key={`${option.key}-${index}`} className="flex items-center gap-2">
                              <input
                                value={text}
                                onChange={(event) => {
                                  const nextValues = [...values];
                                  nextValues[index] = event.target.value;
                                  updateCustomizationValue(option.key, nextValues);
                                }}
                                className="input-field"
                                placeholder={`Entry ${index + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nextValues = values.filter((_, itemIndex) => itemIndex !== index);
                                  updateCustomizationValue(option.key, nextValues);
                                }}
                                className="text-sm text-charcoal/60 hover:text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => updateCustomizationValue(option.key, [...values, ''])}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            + Add another
                          </button>
                        </div>
                      );
                    }

                    if (option.type === 'date_input') {
                      return (
                        <input
                          type="date"
                          value={currentValue || ''}
                          onChange={(event) => updateCustomizationValue(option.key, event.target.value)}
                          className="input-field"
                        />
                      );
                    }

                    if (option.type === 'text_color') {
                      return (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={currentValue || '#000000'}
                            onChange={(event) => updateCustomizationValue(option.key, event.target.value)}
                            className="h-10 w-16 cursor-pointer rounded-lg border border-charcoal/15"
                          />
                          <span className="text-sm text-charcoal/60">{currentValue || '#000000'}</span>
                        </div>
                      );
                    }

                    if (['dropdown', 'font_selection', 'greeting_card', 'gift_wrapping'].includes(option.type)) {
                      return (
                        <select
                          value={currentValue || ''}
                          onChange={(event) => updateCustomizationValue(option.key, event.target.value)}
                          className="input-field"
                        >
                          <option value="">Select an option</option>
                          {option.choices?.map((choice) => (
                            <option key={choice} value={choice}>
                              {choice}
                            </option>
                          ))}
                        </select>
                      );
                    }

                    if (option.type === 'gift_message' || option.type === 'special_instructions') {
                      return (
                        <textarea
                          value={currentValue || ''}
                          onChange={(event) => updateCustomizationValue(option.key, event.target.value)}
                          rows={3}
                          maxLength={option.validation?.maxLength || 500}
                          placeholder={option.placeholder || ''}
                          className="input-field resize-none"
                        />
                      );
                    }

                    return (
                      <input
                        type="text"
                        value={currentValue || ''}
                        onChange={(event) => updateCustomizationValue(option.key, event.target.value)}
                        maxLength={option.validation?.maxLength || 100}
                        placeholder={option.placeholder || ''}
                        className="input-field"
                      />
                    );
                  };

                  return (
                    <div key={option.key} className={error ? 'rounded-xl ring-1 ring-red-200' : ''}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-medium text-charcoal">
                          {option.label}
                          {option.isRequired ? <span className="text-primary-600"> *</span> : null}
                        </label>
                        {option.additionalPrice > 0 && (
                          <span className="text-xs font-medium text-primary-600">+ ₹{option.additionalPrice}</span>
                        )}
                      </div>
                      {option.helpText && <p className="mt-1 text-xs text-charcoal/60">{option.helpText}</p>}
                      <div className="mt-2">{renderField()}</div>
                      {option.validation?.maxLength && (
                        <p className="mt-1 text-xs text-charcoal/50">Max {option.validation.maxLength} characters</p>
                      )}
                      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="sticky bottom-16 z-10 -mx-4 mt-8 flex items-center gap-4 border-t border-charcoal/10 bg-cream/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none md:bottom-0">
            <div className="flex items-center gap-3 rounded-full border border-charcoal/20 bg-white px-2 py-1.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal/70 hover:bg-charcoal/5"
              >
                <HiOutlineMinus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal/70 hover:bg-charcoal/5"
              >
                <HiOutlinePlus size={14} />
              </button>
            </div>

            <Button onClick={handleAddToCart} isLoading={isAdding} disabled={product.stock === 0} className="flex-1 sm:flex-none">
              {product.stock === 0 ? 'Out of Stock' : `Add to Cart · ₹${(estimatedUnitPrice * quantity).toFixed(2)}`}
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-6">
            {[
              { icon: HiOutlineShieldCheck, label: 'Secure Payments' },
              { icon: HiOutlineGiftTop, label: 'Premium Packaging' },
              { icon: HiOutlineSparkles, label: 'Personalization Included' },
              { icon: HiOutlineTruck, label: 'Fast Delivery' },
              { icon: HiOutlineCheckBadge, label: 'Quality Checked' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-charcoal/60">
                <item.icon size={16} className="shrink-0 text-primary-600" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structured description */}
      <div className="mt-14 max-w-3xl sm:mt-20">
        <h2 className="mb-4 font-display text-xl font-semibold text-charcoal sm:text-2xl">Product Details</h2>
        <Accordion items={accordionItems} />
      </div>

      {recommended.length > 0 && (
        <div className="mt-14 sm:mt-20">
          <h2 className="mb-6 font-display text-xl font-semibold text-charcoal sm:text-2xl">You May Also Like</h2>
          <ProductGrid products={recommended.slice(0, 4)} />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
