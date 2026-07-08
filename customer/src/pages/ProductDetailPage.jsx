import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProductBySlugApi, uploadCustomizationImageApi } from '../api/productApi.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';

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

  useEffect(() => {
    setIsLoading(true);
    setCustomizationValues({});
    setValidationErrors({});
    setSelectedVariantSku('');
    getProductBySlugApi(slug)
      .then(({ data }) => {
        const productData = data.data.product;
        setProduct(productData);

        const firstActiveVariant = (productData.variants || []).find((variant) => variant.isActive !== false);
        setSelectedVariantSku(firstActiveVariant?.sku || '');
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

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

  return (
    <div className="container-tgs py-12">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-white">
            <img src={product.images[activeImage]?.url} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 flex gap-3">
            {product.images.map((img, index) => (
              <button
                key={img.publicId}
                onClick={() => setActiveImage(index)}
                className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                  activeImage === index ? 'border-primary-600' : 'border-transparent'
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary-600">{product.category?.name}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-charcoal">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold text-charcoal">₹{displayPrice}</span>
            {product.discountPrice > 0 && (
              <span className="text-lg text-charcoal/40 line-through">₹{product.price}</span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-charcoal/70">{product.description}</p>

          {variants.length > 0 && (
            <div className="mt-8 rounded-2xl border border-charcoal/10 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-charcoal/70">Select Variant</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {variants.map((variant) => {
                  const variantLabel = variant.attributes?.map((attribute) => `${attribute.name}: ${attribute.value}`).join(' • ');
                  return (
                    <button
                      key={variant.sku}
                      type="button"
                      onClick={() => setSelectedVariantSku(variant.sku)}
                      className={`rounded-full border px-4 py-2 text-sm ${
                        selectedVariantSku === variant.sku
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-charcoal/20 bg-white text-charcoal'
                      }`}
                    >
                      {variantLabel || variant.sku}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {customizationOptions.length > 0 && (
            <div className="mt-8 rounded-2xl border border-charcoal/10 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-charcoal/70">Personalize Your Gift</h3>
              <div className="mt-4 space-y-5">
                {customizationOptions.map((option) => {
                  const currentValue = customizationValues[option.key];
                  const error = validationErrors[option.key];

                  const renderField = () => {
                    if (option.type === 'image_upload' || option.type === 'multi_image_upload') {
                      return (
                        <div className="space-y-3">
                          <input
                            type="file"
                            accept="image/*"
                            multiple={option.type === 'multi_image_upload'}
                            onChange={(event) => handleImageUpload(option, event.target.files)}
                            className="w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm"
                          />
                          {uploadingOptions[option.key] && <p className="text-sm text-primary-600">Uploading image…</p>}
                          {option.type === 'multi_image_upload' && Array.isArray(currentValue) && currentValue.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {currentValue.map((url) => (
                                <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                              ))}
                            </div>
                          )}
                          {option.type === 'image_upload' && typeof currentValue === 'string' && currentValue && (
                            <img src={currentValue} alt="" className="h-16 w-16 rounded-lg object-cover" />
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
                                className="w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm"
                                placeholder={`Entry ${index + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nextValues = values.filter((_, itemIndex) => itemIndex !== index);
                                  updateCustomizationValue(option.key, nextValues);
                                }}
                                className="text-sm text-charcoal/60"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => updateCustomizationValue(option.key, [...values, ''])}
                            className="text-sm font-medium text-primary-600"
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
                          className="w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm"
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
                            className="h-10 w-16 rounded-lg border border-charcoal/15"
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
                          className="w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm"
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
                          className="w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm"
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
                        className="w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm"
                      />
                    );
                  };

                  return (
                    <div key={option.key}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-medium text-charcoal">
                          {option.label}
                          {option.isRequired ? ' *' : ''}
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

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-charcoal/20 px-4 py-2">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                -
              </button>
              <span className="w-6 text-center">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)}>
                +
              </button>
            </div>

            <Button onClick={handleAddToCart} isLoading={isAdding} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
