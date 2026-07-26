import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import {
  getPromotionByIdApi,
  createPromotionApi,
  updatePromotionApi,
} from '../api/promotionApi.js';
import { getCategoriesApi } from '../api/categoryApi.js';
import { getProductsApi } from '../api/productApi.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import Toggle from '../components/common/Toggle.jsx';
import TierBuilder from '../components/promotion/TierBuilder.jsx';

const PROMOTION_TYPES = {
  buy_more_save_more: 'Buy More Save More',
  flat_discount: 'Flat Discount',
  percentage_discount: 'Percentage Discount',
  buy_x_get_y: 'Buy X Get Y',
  free_shipping: 'Free Shipping',
  free_gift: 'Free Gift',
  bundle_pricing: 'Bundle Pricing',
  category_discount: 'Category Discount',
  collection_discount: 'Collection Discount',
  first_order_offer: 'First Order Offer',
  festival_offer: 'Festival Offer',
  custom_rule: 'Custom Rule',
};

const PRICING_METHODS = {
  fixed_bundle_price: 'Fixed Bundle Price',
  flat_discount: 'Flat Discount',
  percentage_discount: 'Percentage Discount',
  tier_pricing: 'Tier Pricing',
};

const QUANTITY_RULES = {
  mixed_products: 'Mixed Products',
  same_product_only: 'Same Product Only',
};

const SCOPES = {
  entire_cart: 'Entire Cart',
  categories: 'Categories',
  collections: 'Collections',
  products: 'Products',
};

const USER_TYPES = {
  everyone: 'Everyone',
  guests: 'Guests Only',
  logged_in: 'Logged In Users',
  new_customers: 'New Customers',
  returning_customers: 'Returning Customers',
};

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const PromotionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [removeBannerImage, setRemoveBannerImage] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [collectionTags, setCollectionTags] = useState('');
  const [userTypes, setUserTypes] = useState(['everyone']);

  const [tiers, setTiers] = useState([]);
  const [bundleProducts, setBundleProducts] = useState([{ productId: '', quantity: 1 }]);
  const [getProductIds, setGetProductIds] = useState([]);
  const [getCategoryIds, setGetCategoryIds] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const promotionType = watch('type');
  const targetScope = watch('targetScope');
  const pricingMethod = watch('pricingMethod');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          getCategoriesApi({ isActive: true }),
          getProductsApi({ isActive: true, publishStatus: 'published', limit: 100 }),
        ]);
        setCategories(catsRes.data.data.categories);
        setProducts(prodsRes.data.data.products);

        if (isEditMode) {
          const { data } = await getPromotionByIdApi(id);
          const promo = data.data.promotion;
          
          reset({
            name: promo.name || '',
            description: promo.description || '',
            type: promo.type || '',
            status: promo.status || 'draft',
            badgeText: promo.badgeText || '',
            showOnProductPage: promo.showOnProductPage ?? true,
            showInCart: promo.showInCart ?? true,
            priority: promo.priority ?? 0,
            maxUses: promo.maxUses || '',
            maxUsesPerUser: promo.maxUsesPerUser || '',
            startDate: toDateInput(promo.startDate),
            endDate: toDateInput(promo.endDate),
            targetScope: promo.target?.scope || 'entire_cart',
            minOrderValue: promo.eligibility?.minOrderValue || 0,
            maxOrderValue: promo.eligibility?.maxOrderValue || '',
            pricingMethod: promo.buyMoreSaveMoreConfig?.pricingMethod || '',
            quantityRule: promo.buyMoreSaveMoreConfig?.quantityRule || 'mixed_products',
            discountType: promo.discountConfig?.discountType || '',
            discountValue: promo.discountConfig?.discountValue || '',
            maxDiscount: promo.discountConfig?.maxDiscount || '',
            buyQuantity: promo.buyXGetYConfig?.buyQuantity || '',
            getQuantity: promo.buyXGetYConfig?.getQuantity || '',
            getProductsFree: promo.buyXGetYConfig?.getProductsFree ?? true,
            minOrderValueFreeShipping: promo.freeShippingConfig?.minOrderValue || '',
            giftProductId: promo.freeGiftConfig?.giftProductId?._id || '',
            minOrderValueFreeGift: promo.freeGiftConfig?.minOrderValue || 0,
            maxGiftsPerOrder: promo.freeGiftConfig?.maxGiftsPerOrder || 1,
            bundlePrice: promo.bundlePricingConfig?.bundlePrice || '',
            categoryDiscountType: promo.categoryDiscountConfig?.discountType || '',
            categoryDiscountValue: promo.categoryDiscountConfig?.discountValue || '',
            categoryMaxDiscount: promo.categoryDiscountConfig?.maxDiscount || '',
            firstOrderDiscountType: promo.firstOrderConfig?.discountType || '',
            firstOrderDiscountValue: promo.firstOrderConfig?.discountValue || '',
            firstOrderMaxDiscount: promo.firstOrderConfig?.maxDiscount || '',
            festivalName: promo.festivalConfig?.festivalName || '',
            festivalDiscountType: promo.festivalConfig?.discountType || '',
            festivalDiscountValue: promo.festivalConfig?.discountValue || '',
            festivalMaxDiscount: promo.festivalConfig?.maxDiscount || '',
            customRuleName: promo.customRuleConfig?.ruleName || '',
          });

          setSelectedCategories(promo.target?.categoryIds?.map(c => c._id) || []);
          setSelectedProducts(promo.target?.productIds?.map(p => p._id) || []);
          setCollectionTags(promo.target?.collectionTags?.join(', ') || '');
          setUserTypes(promo.eligibility?.userTypes || ['everyone']);
          setTiers(promo.buyMoreSaveMoreConfig?.tiers || []);
          
          if (promo.bundlePricingConfig?.bundleProducts) {
            setBundleProducts(
              promo.bundlePricingConfig.bundleProducts.map(bp => ({
                productId: bp.productId._id,
                quantity: bp.quantity,
              }))
            );
          }

          setGetProductIds(promo.buyXGetYConfig?.getProductIds?.map(p => p._id) || []);
          setGetCategoryIds(promo.buyXGetYConfig?.getCategoryIds?.map(c => c._id) || []);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load data');
        navigate('/promotions');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode, navigate, reset]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('type', values.type);
      formData.append('status', values.status);
      formData.append('badgeText', values.badgeText || '');
      formData.append('showOnProductPage', values.showOnProductPage);
      formData.append('showInCart', values.showInCart);
      formData.append('priority', values.priority || 0);
      if (values.maxUses) formData.append('maxUses', values.maxUses);
      if (values.maxUsesPerUser) formData.append('maxUsesPerUser', values.maxUsesPerUser);
      if (values.startDate) formData.append('startDate', values.startDate);
      if (values.endDate) formData.append('endDate', values.endDate);
      if (bannerImageFile) formData.append('bannerImage', bannerImageFile);
      if (removeBannerImage) formData.append('removeBannerImage', true);

      // Target configuration
      const targetConfig = {
        scope: values.targetScope,
        categoryIds: selectedCategories,
        productIds: selectedProducts,
        collectionTags: collectionTags.split(',').map(t => t.trim()).filter(Boolean),
      };
      formData.append('target', JSON.stringify(targetConfig));

      // Eligibility configuration
      const eligibilityConfig = {
        userTypes,
        minOrderValue: values.minOrderValue || 0,
        maxOrderValue: values.maxOrderValue || null,
      };
      formData.append('eligibility', JSON.stringify(eligibilityConfig));

      // Type-specific configurations
      if (values.type === 'buy_more_save_more') {
        const bmsmConfig = {
          pricingMethod: values.pricingMethod,
          quantityRule: values.quantityRule || 'mixed_products',
          tiers,
        };
        formData.append('buyMoreSaveMoreConfig', JSON.stringify(bmsmConfig));
      } else if (values.type === 'flat_discount' || values.type === 'percentage_discount') {
        const discountConfig = {
          discountType: values.discountType,
          discountValue: values.discountValue,
          maxDiscount: values.maxDiscount || null,
        };
        formData.append('discountConfig', JSON.stringify(discountConfig));
      } else if (values.type === 'buy_x_get_y') {
        const bxyConfig = {
          buyQuantity: values.buyQuantity,
          getQuantity: values.getQuantity,
          getProductsFree: values.getProductsFree,
          getProductIds,
          getCategoryIds,
        };
        formData.append('buyXGetYConfig', JSON.stringify(bxyConfig));
      } else if (values.type === 'free_shipping') {
        const freeShippingConfig = {
          minOrderValue: values.minOrderValueFreeShipping,
        };
        formData.append('freeShippingConfig', JSON.stringify(freeShippingConfig));
      } else if (values.type === 'free_gift') {
        const freeGiftConfig = {
          giftProductId: values.giftProductId,
          minOrderValue: values.minOrderValueFreeGift || 0,
          maxGiftsPerOrder: values.maxGiftsPerOrder || 1,
        };
        formData.append('freeGiftConfig', JSON.stringify(freeGiftConfig));
      } else if (values.type === 'bundle_pricing') {
        const bundleConfig = {
          bundleProducts: bundleProducts.filter(bp => bp.productId),
          bundlePrice: values.bundlePrice,
        };
        formData.append('bundlePricingConfig', JSON.stringify(bundleConfig));
      } else if (values.type === 'category_discount' || values.type === 'collection_discount') {
        const catDiscountConfig = {
          discountType: values.categoryDiscountType,
          discountValue: values.categoryDiscountValue,
          maxDiscount: values.categoryMaxDiscount || null,
        };
        formData.append('categoryDiscountConfig', JSON.stringify(catDiscountConfig));
      } else if (values.type === 'first_order_offer') {
        const firstOrderConfig = {
          discountType: values.firstOrderDiscountType,
          discountValue: values.firstOrderDiscountValue,
          maxDiscount: values.firstOrderMaxDiscount || null,
        };
        formData.append('firstOrderConfig', JSON.stringify(firstOrderConfig));
      } else if (values.type === 'festival_offer') {
        const festivalConfig = {
          festivalName: values.festivalName,
          discountType: values.festivalDiscountType,
          discountValue: values.festivalDiscountValue,
          maxDiscount: values.festivalMaxDiscount || null,
        };
        formData.append('festivalConfig', JSON.stringify(festivalConfig));
      } else if (values.type === 'custom_rule') {
        const customRuleConfig = {
          ruleName: values.customRuleName,
          config: {},
        };
        formData.append('customRuleConfig', JSON.stringify(customRuleConfig));
      }

      if (isEditMode) {
        await updatePromotionApi(id, formData);
        toast.success('Promotion updated successfully');
      } else {
        await createPromotionApi(formData);
        toast.success('Promotion created successfully');
      }

      navigate('/promotions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/promotions')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <HiOutlineArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Promotion' : 'New Promotion'}
          </h1>
          <p className="text-sm text-gray-600">
            {isEditMode ? 'Update promotion details' : 'Create a new promotion'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Summer Sale 2024"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe this promotion..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Type *</label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                {Object.entries(PROMOTION_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
            <input
              {...register('badgeText')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="SALE"
              maxLength={50}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <input
                type="number"
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Higher priority promotions are applied first</p>
            </div>
            <div></div>
          </div>
        </div>

        {/* Target Configuration */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Target Configuration</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scope *</label>
            <select
              {...register('targetScope')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(SCOPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {targetScope === 'categories' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, cat._id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== cat._id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {targetScope === 'products' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Products</label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                {products.map((prod) => (
                  <label key={prod._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(prod._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, prod._id]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== prod._id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{prod.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {targetScope === 'collections' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Tags</label>
              <input
                value={collectionTags}
                onChange={(e) => setCollectionTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="summer, sale, festival"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated tags</p>
            </div>
          )}
        </div>

        {/* Eligibility Configuration */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Eligibility</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Types</label>
            <div className="space-y-2">
              {Object.entries(USER_TYPES).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userTypes.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setUserTypes([...userTypes, key]);
                      } else {
                        setUserTypes(userTypes.filter(t => t !== key));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (₹)</label>
              <input
                type="number"
                min="0"
                {...register('minOrderValue')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Order Value (₹)</label>
              <input
                type="number"
                min="0"
                {...register('maxOrderValue')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>
          </div>
        </div>

        {/* Type-specific configurations */}
        {promotionType === 'buy_more_save_more' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Buy More Save More Configuration</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Method *</label>
                <select
                  {...register('pricingMethod', { required: 'Pricing method is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(PRICING_METHODS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Rule</label>
                <select
                  {...register('quantityRule')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(QUANTITY_RULES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiers</label>
              <TierBuilder tiers={tiers} onChange={setTiers} />
            </div>
          </div>
        )}

        {(promotionType === 'flat_discount' || promotionType === 'percentage_discount') && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Discount Configuration</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                <select
                  {...register('discountType', { required: 'Discount type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('discountValue', { required: 'Discount value is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
              <input
                type="number"
                min="0"
                {...register('maxDiscount')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>
          </div>
        )}

        {promotionType === 'buy_x_get_y' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Buy X Get Y Configuration</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buy Quantity *</label>
                <input
                  type="number"
                  min="1"
                  {...register('buyQuantity', { required: 'Buy quantity is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Get Quantity *</label>
                <input
                  type="number"
                  min="1"
                  {...register('getQuantity', { required: 'Get quantity is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('getProductsFree')}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Get products free</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Get Products (optional)</label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                {products.map((prod) => (
                  <label key={prod._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={getProductIds.includes(prod._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGetProductIds([...getProductIds, prod._id]);
                        } else {
                          setGetProductIds(getProductIds.filter(id => id !== prod._id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{prod.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {promotionType === 'free_shipping' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Free Shipping Configuration</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (₹) *</label>
              <input
                type="number"
                min="0"
                {...register('minOrderValueFreeShipping', { required: 'Min order value is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {promotionType === 'free_gift' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Free Gift Configuration</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gift Product *</label>
              <select
                {...register('giftProductId', { required: 'Gift product is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select product</option>
                {products.map((prod) => (
                  <option key={prod._id} value={prod._id}>{prod.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  {...register('minOrderValueFreeGift')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Gifts Per Order</label>
                <input
                  type="number"
                  min="1"
                  {...register('maxGiftsPerOrder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {promotionType === 'bundle_pricing' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Bundle Pricing Configuration</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bundle Products</label>
              <div className="space-y-2">
                {bundleProducts.map((bp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={bp.productId}
                      onChange={(e) => {
                        const updated = [...bundleProducts];
                        updated[index].productId = e.target.value;
                        setBundleProducts(updated);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select product</option>
                      {products.map((prod) => (
                        <option key={prod._id} value={prod._id}>{prod.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={bp.quantity}
                      onChange={(e) => {
                        const updated = [...bundleProducts];
                        updated[index].quantity = parseInt(e.target.value) || 1;
                        setBundleProducts(updated);
                      }}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setBundleProducts(bundleProducts.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setBundleProducts([...bundleProducts, { productId: '', quantity: 1 }])}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  + Add Product
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('bundlePrice', { required: 'Bundle price is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {(promotionType === 'category_discount' || promotionType === 'collection_discount') && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Category/Collection Discount Configuration</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                <select
                  {...register('categoryDiscountType', { required: 'Discount type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('categoryDiscountValue', { required: 'Discount value is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
              <input
                type="number"
                min="0"
                {...register('categoryMaxDiscount')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>
          </div>
        )}

        {promotionType === 'first_order_offer' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">First Order Offer Configuration</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                <select
                  {...register('firstOrderDiscountType', { required: 'Discount type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('firstOrderDiscountValue', { required: 'Discount value is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
              <input
                type="number"
                min="0"
                {...register('firstOrderMaxDiscount')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>
          </div>
        )}

        {promotionType === 'festival_offer' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Festival Offer Configuration</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Festival Name *</label>
              <input
                {...register('festivalName', { required: 'Festival name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Diwali"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                <select
                  {...register('festivalDiscountType', { required: 'Discount type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('festivalDiscountValue', { required: 'Discount value is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
              <input
                type="number"
                min="0"
                {...register('festivalMaxDiscount')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>
          </div>
        )}

        {promotionType === 'custom_rule' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Custom Rule Configuration</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
              <input
                {...register('customRuleName', { required: 'Rule name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Custom Rule"
              />
            </div>
            <p className="text-sm text-gray-500">Custom rules require additional backend implementation</p>
          </div>
        )}

        {/* Display Settings */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Display Settings</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('showOnProductPage')} className="rounded" />
              <span className="text-sm font-medium text-gray-700">Show on Product Page</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('showInCart')} className="rounded" />
              <span className="text-sm font-medium text-gray-700">Show in Cart</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setBannerImageFile(e.target.files[0]);
                setRemoveBannerImage(false);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Usage Limits */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Usage Limits</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
              <input
                type="number"
                min="0"
                {...register('maxUses')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses Per User</label>
              <input
                type="number"
                min="0"
                {...register('maxUsesPerUser')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/promotions')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? 'Update Promotion' : 'Create Promotion'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromotionFormPage;
