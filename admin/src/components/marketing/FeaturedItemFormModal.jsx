import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineXMark } from 'react-icons/hi2';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Toggle from '../common/Toggle.jsx';

const defaultValues = { name: '', value: '', displayOrder: 0, isActive: true };

// Handles both "Featured Recipient" and "Featured Occasion" tiles via the
// `itemType` prop. `value` must match an existing Product.recipient /
// Product.occasion string so the storefront tile links straight into the
// existing /products?recipient=... or /products?occasion=... filter.
const FeaturedItemFormModal = ({ isOpen, onClose, onSubmit, item, itemType, isSubmitting, currentCount, maxCount }) => {
  const isEditMode = Boolean(item);
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
    if (!isOpen) return;

    if (item) {
      reset({
        name: item.name || '',
        value: item.value || '',
        displayOrder: item.displayOrder ?? 0,
        isActive: item.isActive ?? true,
      });
    } else {
      reset(defaultValues);
    }

    setImageFile(null);
  }, [isOpen, item, reset]);

  if (!isOpen) return null;

  const label = itemType === 'recipient' ? 'Featured Recipient' : 'Featured Occasion';
  const atLimit = !isEditMode && currentCount >= maxCount;

  const submitHandler = (values) => {
    const formData = new FormData();

    // Only send type while creating
    if (!isEditMode) {
      formData.append('type', itemType);
    }

    formData.append('name', values.name);
    formData.append('value', values.value);
    formData.append('displayOrder', values.displayOrder || 0);
    formData.append('isActive', values.isActive);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">{isEditMode ? `Edit ${label}` : `Add ${label}`}</h2>
          <button onClick={onClose} className="text-ink/50 hover:text-ink">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {atLimit ? (
          <div className="px-6 py-8 text-center text-sm text-ink/60">
            You've reached the maximum of {maxCount} {itemType === 'recipient' ? 'recipients' : 'occasions'}. Remove
            one before adding another.
            <div className="mt-5">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(submitHandler)} className="space-y-5 px-6 py-5">
            <Input
              label="Display Name"
              placeholder="Mom"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', maxLength: 80 })}
            />
            <Input
              label={`Matching product ${itemType} value`}
              placeholder={itemType === 'recipient' ? 'Mom' : 'Birthday'}
              error={errors.value?.message}
              {...register('value', { required: 'Value is required', maxLength: 80 })}
            />
            <p className="-mt-3 text-xs text-ink/50">
              Must exactly match a value already used in products' {itemType} field, so the tile links to matching
              products.
            </p>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="input-field"
              />
              {item?.image?.url && !imageFile && (
                <img src={item.image.url} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover" />
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
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeaturedItemFormModal;
