import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineXMark } from 'react-icons/hi2';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Toggle from '../common/Toggle.jsx';
import { flattenCategoryTree } from '../../utils/flattenCategoryTree.js';

const defaultValues = {
  name: '',
  description: '',
  shortDescription: '',
  parentCategory: '',
  displayOrder: 0,
  isActive: true,
  isFeatured: false,
  showOnHomepage: false,
  metaTitle: '',
  metaDescription: '',
  keywords: '',
};

const CategoryFormModal = ({ isOpen, onClose, onSubmit, category, treeCategories, isSubmitting }) => {
  const isEditMode = Boolean(category);
  const [imageFile, setImageFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (!isOpen) return;

    if (category) {
      reset({
        name: category.name || '',
        description: category.description || '',
        shortDescription: category.shortDescription || '',
        parentCategory: category.parentCategory?._id || category.parentCategory || '',
        displayOrder: category.displayOrder ?? 0,
        isActive: category.isActive ?? true,
        isFeatured: category.isFeatured ?? false,
        showOnHomepage: category.showOnHomepage ?? false,
        metaTitle: category.seo?.metaTitle || '',
        metaDescription: category.seo?.metaDescription || '',
        keywords: category.seo?.keywords?.join(', ') || '',
      });
    } else {
      reset(defaultValues);
    }

    setImageFile(null);
    setBannerFile(null);
  }, [isOpen, category, reset]);

  if (!isOpen) return null;

  const parentOptions = flattenCategoryTree(treeCategories, category?._id);

  const submitHandler = (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description || '');
    formData.append('shortDescription', values.shortDescription || '');
    formData.append('parentCategory', values.parentCategory || '');
    formData.append('displayOrder', values.displayOrder || 0);
    formData.append('isActive', values.isActive);
    formData.append('isFeatured', values.isFeatured);
    formData.append('showOnHomepage', values.showOnHomepage);

    const keywords = values.keywords
      ? values.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
      : [];

    formData.append(
      'seo',
      JSON.stringify({
        metaTitle: values.metaTitle || '',
        metaDescription: values.metaDescription || '',
        keywords,
      })
    );

    if (imageFile) formData.append('image', imageFile);
    if (bannerFile) formData.append('banner', bannerFile);

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">{isEditMode ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="text-ink/50 hover:text-ink">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-5 px-6 py-5">
          <Input
            label="Category Name"
            error={errors.name?.message}
            {...register('name', {
              required: 'Category name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              maxLength: { value: 150, message: 'Name cannot exceed 150 characters' },
            })}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Short Description</label>
            <input
              className="input-field"
              maxLength={300}
              {...register('shortDescription', { maxLength: 300 })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Description</label>
            <textarea rows={3} className="input-field" {...register('description', { maxLength: 2000 })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">Parent Category</label>
              <select className="input-field" {...register('parentCategory')}>
                <option value="">None (Top Level)</option>
                {parentOptions.map((option) => (
                  <option key={option._id} value={option._id}>
                    {'— '.repeat(option.depth)}
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Display Order"
              type="number"
              min={0}
              error={errors.displayOrder?.message}
              {...register('displayOrder', { min: { value: 0, message: 'Must be 0 or greater' } })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">Category Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="input-field"
              />
              {category?.image?.url && !imageFile && (
                <img src={category.image.url} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover" />
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])}
                className="input-field"
              />
              {category?.banner?.url && !bannerFile && (
                <img src={category.banner.url} alt="" className="mt-2 h-16 w-28 rounded-lg object-cover" />
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 rounded-xl bg-surface p-4">
            <Toggle
              label="Active"
              checked={watch('isActive')}
              onChange={(value) => setValue('isActive', value)}
            />
            <Toggle
              label="Featured"
              checked={watch('isFeatured')}
              onChange={(value) => setValue('isFeatured', value)}
            />
            <Toggle
              label="Show on Homepage"
              checked={watch('showOnHomepage')}
              onChange={(value) => setValue('showOnHomepage', value)}
            />
          </div>

          <div className="rounded-xl border border-ink/10 p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">SEO</h3>
            <div className="space-y-4">
              <Input
                label="Meta Title"
                maxLength={70}
                error={errors.metaTitle?.message}
                {...register('metaTitle', { maxLength: { value: 70, message: 'Max 70 characters' } })}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink/80">Meta Description</label>
                <textarea
                  rows={2}
                  maxLength={160}
                  className="input-field"
                  {...register('metaDescription', { maxLength: 160 })}
                />
              </div>
              <Input label="Keywords (comma separated)" {...register('keywords')} />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-ink/10 pt-5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditMode ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
