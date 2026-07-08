import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
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

const ProductFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('basic');
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, reset, setValue, watch } = useForm({ defaultValues });

  useEffect(() => {
    getCategoriesApi().then(({ data }) => setCategories(data.data.categories));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    getProductByIdApi(id).then(({ data }) => {
      const p = data.data.product;
      setProduct(p);
      reset({
        name: p.name,
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
        publishStatus: p.publishStatus || 'draft',
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        tagsText: (p.tags || []).join(', '),
        occasionText: (p.occasion || []).join(', '),
        recipientText: (p.recipient || []).join(', '),
        weight: p.weight || { value: 0, unit: 'g' },
        dimensions: p.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
        metaTitle: p.seo?.metaTitle || '',
        metaDescription: p.seo?.metaDescription || '',
        keywordsText: (p.seo?.keywords || []).join(', '),
        variants: (p.variants || []).map((v) => ({ ...v, price: v.price ?? '' })),
        customizationOptions: (p.customizationOptions || []).map((option) => ({
          ...option,
          choicesText: (option.choices || []).join(', '),
          allowedFileTypesText: (option.validation?.allowedFileTypes || []).join(', '),
          validation: option.validation || {},
        })),
      });
      setIsLoading(false);
    });
  }, [id, isEditMode, reset]);

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

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-ink">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-ink/50 hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={activeTab === 'basic' ? 'card space-y-5' : 'hidden'}>
          <Input label="Product Name" {...register('name', { required: true })} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Short Description</label>
            <input className="input-field" maxLength={250} {...register('shortDescription')} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Long Description</label>
            <textarea rows={5} className="input-field" {...register('description', { required: true })} />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Input label="Base Price" type="number" min={0} {...register('price', { required: true, min: 0 })} />
            <Input label="Sale Price" type="number" min={0} {...register('discountPrice')} />
            <Input label="Cost Price" type="number" min={0} {...register('costPrice')} />
            <Input label="Low Stock Alert" type="number" min={0} {...register('lowStockThreshold')} />
          </div>

          <Input label="Stock (Inventory)" type="number" min={0} {...register('stock', { required: true, min: 0 })} />

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
