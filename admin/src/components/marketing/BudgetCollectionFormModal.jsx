import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineXMark } from 'react-icons/hi2';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Toggle from '../common/Toggle.jsx';

const defaultValues = { label: '', description: '', minPrice: 0, maxPrice: '', displayOrder: 0, isActive: true };

// Edits one of the 3 fixed budget tiers (Under ₹499 / ₹500–₹999 / Premium).
// There is no "create" mode here — tiers are seeded server-side and admins
// only ever edit label/price bounds/image/order for an existing tier.
const BudgetCollectionFormModal = ({ isOpen, onClose, onSubmit, collection, isSubmitting }) => {
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (!isOpen || !collection) return;

    reset({
      label: collection.label || '',
      description: collection.description || '',
      minPrice: collection.minPrice ?? 0,
      maxPrice: collection.maxPrice ?? '',
      displayOrder: collection.displayOrder ?? 0,
      isActive: collection.isActive ?? true,
    });
    setImageFile(null);
  }, [isOpen, collection, reset]);

  if (!isOpen || !collection) return null;

  const submitHandler = (values) => {
    const formData = new FormData();
    formData.append('label', values.label);
    formData.append('description', values.description || '');
    formData.append('minPrice', values.minPrice || 0);
    formData.append('maxPrice', values.maxPrice === '' ? '' : values.maxPrice);
    formData.append('displayOrder', values.displayOrder || 0);
    formData.append('isActive', values.isActive);
    if (imageFile) formData.append('image', imageFile);

    onSubmit(collection.tier, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Edit Budget Collection</h2>
          <button onClick={onClose} className="text-ink/50 hover:text-ink">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-5 px-6 py-5">
          <Input
            label="Label"
            error={errors.label?.message}
            {...register('label', { required: 'Label is required', maxLength: 80 })}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Description</label>
            <textarea rows={2} className="input-field" {...register('description', { maxLength: 200 })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Price (₹)" type="number" min={0} {...register('minPrice', { min: 0 })} />
            <Input
              label="Max Price (₹, blank = no cap)"
              type="number"
              min={0}
              {...register('maxPrice')}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="input-field"
            />
            {collection.image?.url && !imageFile && (
              <img src={collection.image.url} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover" />
            )}
          </div>

          <Input label="Display Order" type="number" min={0} {...register('displayOrder', { min: 0 })} />

          <div className="rounded-xl bg-surface p-4">
            <Toggle label="Active" checked={watch('isActive')} onChange={(value) => setValue('isActive', value)} />
          </div>

          <div className="flex justify-end gap-3 border-t border-ink/10 pt-5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetCollectionFormModal;
