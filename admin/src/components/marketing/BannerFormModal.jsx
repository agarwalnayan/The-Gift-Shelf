import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineXMark } from 'react-icons/hi2';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Toggle from '../common/Toggle.jsx';

const defaultValues = {
  title: '',
  subtitle: '',
  description: '',
  ctaText: '',
  ctaLink: '',
  displayOrder: 0,
  isActive: true,
  startDate: '',
  endDate: '',
};

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

// Handles both the Hero Slider ("hero") and Promotional Banner ("promo")
// entities via the `bannerType` prop, avoiding two near-identical modals.
const BannerFormModal = ({ isOpen, onClose, onSubmit, banner, bannerType, isSubmitting }) => {
  const isEditMode = Boolean(banner);
  const [imageFile, setImageFile] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [removeMobileImage, setRemoveMobileImage] = useState(false);

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

    if (banner) {
      reset({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        ctaText: banner.ctaText || '',
        ctaLink: banner.ctaLink || '',
        displayOrder: banner.displayOrder ?? 0,
        isActive: banner.isActive ?? true,
        startDate: toDateInput(banner.startDate),
        endDate: toDateInput(banner.endDate),
      });
    } else {
      reset(defaultValues);
    }

    setImageFile(null);
    setMobileImageFile(null);
    setRemoveImage(false);
    setRemoveMobileImage(false);
  }, [isOpen, banner, reset]);

  if (!isOpen) return null;

  const label = bannerType === 'hero' ? 'Hero Banner' : 'Promotional Banner';

  const submitHandler = (values) => {
    const formData = new FormData();
    formData.append('type', bannerType);
    formData.append('title', values.title || '');
    formData.append('subtitle', values.subtitle || '');
    formData.append('description', values.description || '');
    formData.append('ctaText', values.ctaText || '');
    formData.append('ctaLink', values.ctaLink || '');
    formData.append('displayOrder', values.displayOrder || 0);
    formData.append('isActive', values.isActive);
    if (values.startDate) formData.append('startDate', values.startDate);
    if (values.endDate) formData.append('endDate', values.endDate);
    if (imageFile) formData.append('image', imageFile);
    if (mobileImageFile) formData.append('mobileImage', mobileImageFile);
    if (removeImage && !imageFile) formData.append('removeImage', true);
    if (removeMobileImage && !mobileImageFile) formData.append('removeMobileImage', true);

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">
            {isEditMode ? `Edit ${label}` : `Add ${label}`}
          </h2>
          <button onClick={onClose} className="text-ink/50 hover:text-ink">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-5 px-6 py-5">
          <Input label="Title" error={errors.title?.message} {...register('title', { maxLength: 150 })} />
          <Input label="Subtitle" {...register('subtitle', { maxLength: 200 })} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Description</label>
            <textarea rows={2} className="input-field" {...register('description', { maxLength: 400 })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA Text" placeholder="Shop Now" {...register('ctaText', { maxLength: 40 })} />
            <Input label="CTA Link" placeholder="/products?occasion=Birthday" {...register('ctaLink', { maxLength: 300 })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">Banner Image (desktop)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setImageFile(e.target.files[0]);
                  setRemoveImage(false);
                }}
                className="input-field"
              />
              {banner?.image?.url && !imageFile && !removeImage && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={banner.image.url} alt="" className="h-16 w-28 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setRemoveImage(true)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove image
                  </button>
                </div>
              )}
              {removeImage && !imageFile && <p className="mt-2 text-xs text-ink/50">Image will be removed on save.</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">Mobile Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setMobileImageFile(e.target.files[0]);
                  setRemoveMobileImage(false);
                }}
                className="input-field"
              />
              {banner?.mobileImage?.url && !mobileImageFile && !removeMobileImage && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={banner.mobileImage.url} alt="" className="h-16 w-28 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setRemoveMobileImage(true)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove image
                  </button>
                </div>
              )}
              {removeMobileImage && !mobileImageFile && (
                <p className="mt-2 text-xs text-ink/50">Image will be removed on save.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Display Order" type="number" min={0} {...register('displayOrder', { min: 0 })} />
            <Input label="Start Date (optional)" type="date" {...register('startDate')} />
            <Input label="End Date (optional)" type="date" {...register('endDate')} />
          </div>

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
      </div>
    </div>
  );
};

export default BannerFormModal;