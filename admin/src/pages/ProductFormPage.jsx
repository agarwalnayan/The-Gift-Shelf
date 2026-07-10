import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProductApi, updateProductApi, getProductByIdApi } from '../api/productApi.js';
import { getCategoriesApi } from '../api/categoryApi.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Toggle from '../components/common/Toggle.jsx';
import Loader from '../components/common/Loader.jsx';
import ProductOrganizationSection from '../components/product/ProductOrganizationSection.jsx';
import ProductSeoSection from '../components/product/ProductSeoSection.jsx';
import ProductVariantsManager from '../components/product/ProductVariantsManager.jsx';
import ProductCustomizationManager from '../components/product/ProductCustomizationManager.jsx';
import ProductImagesManager, { NewProductImagesPicker } from '../components/product/ProductImagesManager.jsx';

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'organization', label: 'Organization' },
  { id: 'images', label: 'Images' },
  { id: 'variants', label: 'Variants' },
  { id: 'customization', label: 'Customization' },
  { id: 'seo', label: 'SEO' },
];

// Maps required backend fields (see backend/src/validations/productValidation.js)
// to the tab that contains them, so a validation failure can be surfaced with
// a badge on the right tab instead of failing silently.
const TAB_FIELD_MAP = {
  basic: ['name', 'description', 'price', 'stock'],
  organization: ['category'],
};

const defaultValues = {
  name: '',
  brand: '',
  description: '',
  shortDescription: '',
  category: '',
  subCategory: '',
  price: '',
  discountPrice: '',
  costPrice: '',
  stock: '',
  lowStockThreshold: 5,
  material: '',
  publishStatus: 'draft',
  isActive: true,
  isFeatured: false,
  tagsText: '',
  occasionText: '',
  recipientText: '',
  weight: { value: 0, unit: 'g' },
  dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
  metaTitle: '',
  metaDescription: '',
  keywordsText: '',
  variants: [],
  customizationOptions: [],
};

const toArrayFromText = (text) =>
  text
    ? text
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const buildProductFormData = (values) => {
  const formData = new FormData();

  const scalarFields = [
    'name',
    'brand',
    'description',
    'shortDescription',
    'category',
    'price',
    'discountPrice',
    'costPrice',
    'stock',
    'lowStockThreshold',
    'material',
    'publishStatus',
    'isActive',
    'isFeatured',
  ];
  scalarFields.forEach((field) => formData.append(field, values[field] ?? ''));
  formData.append('subCategory', values.subCategory || '');

  formData.append('tags', JSON.stringify(toArrayFromText(values.tagsText)));
  formData.append('occasion', JSON.stringify(toArrayFromText(values.occasionText)));
  formData.append('recipient', JSON.stringify(toArrayFromText(values.recipientText)));
  formData.append('weight', JSON.stringify(values.weight));
  formData.append('dimensions', JSON.stringify(values.dimensions));
  formData.append(
    'seo',
    JSON.stringify({
      metaTitle: values.metaTitle || '',
      metaDescription: values.metaDescription || '',
      keywords: toArrayFromText(values.keywordsText),
    })
  );

  const variants = (values.variants || [])
    .filter((variant) => variant.attributes?.some((attr) => attr.name && attr.value))
    .map((variant) => ({
      sku: variant.sku || undefined,
      attributes: variant.attributes.filter((attr) => attr.name && attr.value),
      price: variant.price === '' || variant.price === undefined ? null : Number(variant.price),
      stock: Number(variant.stock) || 0,
      isActive: variant.isActive ?? true,
    }));
  formData.append('variants', JSON.stringify(variants));

  const customizationOptions = (values.customizationOptions || [])
    .filter((option) => option.label)
    .map((option) => ({
      key: option.key,
      label: option.label,
      type: option.type,
      isEnabled: option.isEnabled ?? true,
      isRequired: option.isRequired ?? false,
      additionalPrice: Number(option.additionalPrice) || 0,
      displayOrder: Number(option.displayOrder) || 0,
      placeholder: option.placeholder || '',
      helpText: option.helpText || '',
      choices: toArrayFromText(option.choicesText),
      validation: {
        ...(option.validation?.minLength && { minLength: Number(option.validation.minLength) }),
        ...(option.validation?.maxLength && { maxLength: Number(option.validation.maxLength) }),
        ...(option.validation?.minSelections && { minSelections: Number(option.validation.minSelections) }),
        ...(option.validation?.maxSelections && { maxSelections: Number(option.validation.maxSelections) }),
        ...(option.validation?.maxFileSizeMB && { maxFileSizeMB: Number(option.validation.maxFileSizeMB) }),
        ...(option.validation?.minDate && { minDate: option.validation.minDate }),
        ...(option.validation?.maxDate && { maxDate: option.validation.maxDate }),
        ...(toArrayFromText(option.allowedFileTypesText).length && {
          allowedFileTypes: toArrayFromText(option.allowedFileTypesText),
        }),
      },
    }));
  formData.append('customizationOptions', JSON.stringify(customizationOptions));

  return formData;
};

const buildResetValuesFromProduct = (p, { isDuplicate = false } = {}) => ({
  name: isDuplicate ? `${p.name} (Copy)` : p.name,
  brand: p.brand || '',
  description: p.description,
  shortDescription: p.shortDescription || '',
  category: p.category?._id || '',
  subCategory: p.subCategory?._id || '',
  price: p.price,
  discountPrice: p.discountPrice || '',
  costPrice: p.costPrice || '',
  stock: p.stock,
  lowStockThreshold: p.lowStockThreshold ?? 5,
  material: p.material || '',
  publishStatus: isDuplicate ? 'draft' : p.publishStatus || 'draft',
  isActive: isDuplicate ? true : p.isActive,
  isFeatured: isDuplicate ? false : p.isFeatured,
  tagsText: (p.tags || []).join(', '),
  occasionText: (p.occasion || []).join(', '),
  recipientText: (p.recipient || []).join(', '),
  weight: p.weight || { value: 0, unit: 'g' },
  dimensions: p.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
  metaTitle: p.seo?.metaTitle || '',
  metaDescription: p.seo?.metaDescription || '',
  keywordsText: (p.seo?.keywords || []).join(', '),
  variants: (p.variants || []).map((v) => ({
    ...v,
    // Clear variant SKUs when duplicating: `variants.sku` is uniquely
    // indexed on the backend, so carrying the source SKUs over would fail
    // on save. Leaving it blank lets the existing generateVariantSku logic
    // (backend/src/utils/generateSku.js) mint a fresh one, same as a new product.
    sku: isDuplicate ? '' : v.sku,
    price: v.price ?? '',
  })),
  customizationOptions: (p.customizationOptions || []).map((option) => ({
    ...option,
    choicesText: (option.choices || []).join(', '),
    allowedFileTypesText: (option.validation?.allowedFileTypes || []).join(', '),
    validation: option.validation || {},
  })),
});

const ProductFormPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const duplicateFromId = searchParams.get('duplicateFrom');
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('basic');
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode || Boolean(duplicateFromId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDuplicateSource, setIsDuplicateSource] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    getCategoriesApi().then(({ data }) => setCategories(data.data.categories));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    getProductByIdApi(id).then(({ data }) => {
      const p = data.data.product;
      setProduct(p);
      reset(buildResetValuesFromProduct(p));
      setIsLoading(false);
    });
  }, [id, isEditMode, reset]);

  // Duplicate Product: pre-fills the standard "Add Product" form with an
  // existing product's data via the already-existing GET /products/:id
  // endpoint. Images are intentionally left empty — the backend requires an
  // actual file upload on create, so images can't be cloned without a new
  // upload capability, and this sprint does not add one.
  useEffect(() => {
    if (isEditMode || !duplicateFromId) return;

    getProductByIdApi(duplicateFromId)
      .then(({ data }) => {
        reset(buildResetValuesFromProduct(data.data.product, { isDuplicate: true }));
        setIsDuplicateSource(true);
      })
      .catch(() => {
        toast.error('Could not load the product to duplicate');
      })
      .finally(() => setIsLoading(false));
  }, [duplicateFromId, isEditMode, reset]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = buildProductFormData(values);

      if (isEditMode) {
        await updateProductApi(id, formData);
        toast.success('Product updated successfully');
      } else {
        newImageFiles.forEach((file) => formData.append('images', file));
        await createProductApi(formData);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      const messages = error.response?.data?.errors;
      toast.error(messages?.[0] || error.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Previously required fields (name, description, category, price, stock)
  // had no error display wired up at all - the form would submit silently
  // and the admin only found out via a generic toast after a failed request.
  // This surfaces field-level messages, jumps to the first tab with an
  // error, and badges any tab containing one.
  const onInvalid = (formErrors) => {
    const firstTabWithError = TABS.map((tab) => tab.id).find((tabId) =>
      (TAB_FIELD_MAP[tabId] || []).some((field) => formErrors[field])
    );
    if (firstTabWithError) setActiveTab(firstTabWithError);
    toast.error('Please fix the highlighted fields before saving');
  };

  const tabHasError = (tabId) => (TAB_FIELD_MAP[tabId] || []).some((field) => errors[field]);

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-semibold text-ink">
        {isEditMode ? 'Edit Product' : isDuplicateSource ? 'Duplicate Product' : 'Add Product'}
      </h1>

      {isDuplicateSource && (
        <p className="mb-4 text-sm text-primary-700">
          Duplicating an existing product. Review the details, then add new images before saving — images aren't copied
          automatically.
        </p>
      )}

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-ink/50 hover:text-ink'
            }`}
          >
            {tab.label}
            {tabHasError(tab.id) && <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-label="Has errors" />}
          </button>
        ))}
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Please fix the following before saving:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {Object.entries(errors).map(([field, err]) => (
              <li key={field}>{err.message || `${field} is invalid`}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className={activeTab === 'basic' ? 'card space-y-5' : 'hidden'}>
          <Input
            label="Product Name *"
            error={errors.name?.message}
            {...register('name', { required: 'Product name is required' })}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Short Description</label>
            <input className="input-field" maxLength={250} {...register('shortDescription')} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Long Description *</label>
            <textarea
              rows={5}
              className="input-field"
              {...register('description', { required: 'Product description is required' })}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Input
              label="Base Price *"
              type="number"
              min={0}
              error={errors.price?.message}
              {...register('price', { required: 'Base price is required', min: { value: 0, message: 'Must be 0 or more' } })}
            />
            <Input label="Sale Price" type="number" min={0} {...register('discountPrice')} />
            <Input label="Cost Price" type="number" min={0} {...register('costPrice')} />
            <Input label="Low Stock Alert" type="number" min={0} {...register('lowStockThreshold')} />
          </div>

          <Input
            label="Stock (Inventory) *"
            type="number"
            min={0}
            error={errors.stock?.message}
            {...register('stock', { required: 'Stock quantity is required', min: { value: 0, message: 'Cannot be negative' } })}
          />

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-surface p-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">Publish Status</label>
              <select className="input-field" {...register('publishStatus')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-end gap-6">
              <Toggle label="Active" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} />
              <Toggle label="Featured" checked={watch('isFeatured')} onChange={(v) => setValue('isFeatured', v)} />
            </div>
          </div>
        </div>

        <div className={activeTab === 'organization' ? 'card' : 'hidden'}>
          <ProductOrganizationSection register={register} categories={categories} />
        </div>

        <div className={activeTab === 'images' ? 'card' : 'hidden'}>
          {isEditMode ? (
            <ProductImagesManager
              productId={id}
              images={product?.images || []}
              onUpdated={(updatedProduct) => setProduct(updatedProduct)}
            />
          ) : (
            <NewProductImagesPicker files={newImageFiles} onFilesChange={setNewImageFiles} />
          )}
        </div>

        <div className={activeTab === 'variants' ? 'card' : 'hidden'}>
          <ProductVariantsManager control={control} register={register} />
        </div>

        <div className={activeTab === 'customization' ? 'card' : 'hidden'}>
          <ProductCustomizationManager control={control} register={register} setValue={setValue} />
        </div>

        <div className={activeTab === 'seo' ? 'card' : 'hidden'}>
          <ProductSeoSection register={register} />
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Create Product'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
