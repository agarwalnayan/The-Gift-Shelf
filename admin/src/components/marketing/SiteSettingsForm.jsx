import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Toggle from '../common/Toggle.jsx';
import { updateAnnouncementBarApi, updateWelcomePopupApi } from '../../api/marketingApi.js';

const announcementDefaults = {
  enabled: false,
  message: '',
  linkText: '',
  linkUrl: '',
  backgroundColor: '#1c1c1c',
  textColor: '#fdfaf6',
  dismissible: true,
};

const popupDefaults = {
  enabled: false,
  title: '',
  description: '',
  ctaText: '',
  ctaLink: '',
  delaySeconds: 2,
  showOncePerSession: true,
};

// Both blocks are singleton config (there is only ever one current
// announcement bar / popup), so this is a plain save-in-place form rather
// than a list + modal like the other marketing sections.
const SiteSettingsForm = ({ settings, onSaved }) => {
  const [isSavingBar, setIsSavingBar] = useState(false);
  const [isSavingPopup, setIsSavingPopup] = useState(false);
  const [popupImageFile, setPopupImageFile] = useState(null);
  const [removePopupImage, setRemovePopupImage] = useState(false);

  const barForm = useForm({ defaultValues: announcementDefaults });
  const popupForm = useForm({ defaultValues: popupDefaults });

  useEffect(() => {
    if (settings?.announcementBar) barForm.reset(settings.announcementBar);
    if (settings?.welcomePopup) popupForm.reset(settings.welcomePopup);
    setRemovePopupImage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const submitBar = async (values) => {
    setIsSavingBar(true);
    try {
      const { data } = await updateAnnouncementBarApi(values);
      toast.success('Announcement bar updated');
      onSaved?.({ ...settings, announcementBar: data.data.announcementBar });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update announcement bar');
    } finally {
      setIsSavingBar(false);
    }
  };

  const submitPopup = async (values) => {
    setIsSavingPopup(true);
    try {
      const formData = new FormData();
      formData.append('enabled', values.enabled);
      formData.append('title', values.title || '');
      formData.append('description', values.description || '');
      formData.append('ctaText', values.ctaText || '');
      formData.append('ctaLink', values.ctaLink || '');
      formData.append('delaySeconds', values.delaySeconds || 0);
      formData.append('showOncePerSession', values.showOncePerSession);
      if (popupImageFile) formData.append('image', popupImageFile);
      if (removePopupImage && !popupImageFile) formData.append('removeImage', true);

      const { data } = await updateWelcomePopupApi(formData);
      toast.success('Welcome popup updated');
      onSaved?.({ ...settings, welcomePopup: data.data.welcomePopup });
      setPopupImageFile(null);
      setRemovePopupImage(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update welcome popup');
    } finally {
      setIsSavingPopup(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={barForm.handleSubmit(submitBar)} className="card space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Dynamic Announcement Bar</h3>
          <Toggle
            label="Enabled"
            checked={barForm.watch('enabled')}
            onChange={(value) => barForm.setValue('enabled', value)}
          />
        </div>

        <Input label="Message" maxLength={200} {...barForm.register('message', { maxLength: 200 })} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Link Text (optional)" {...barForm.register('linkText', { maxLength: 40 })} />
          <Input label="Link URL (optional)" {...barForm.register('linkUrl', { maxLength: 300 })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Background Color" type="color" {...barForm.register('backgroundColor')} />
          <Input label="Text Color" type="color" {...barForm.register('textColor')} />
        </div>

        <Toggle
          label="Customers can dismiss it"
          checked={barForm.watch('dismissible')}
          onChange={(value) => barForm.setValue('dismissible', value)}
        />

        <div className="flex justify-end border-t border-ink/10 pt-4">
          <Button type="submit" isLoading={isSavingBar}>
            Save Announcement Bar
          </Button>
        </div>
      </form>

      <form onSubmit={popupForm.handleSubmit(submitPopup)} className="card space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Launch Welcome Popup</h3>
          <Toggle
            label="Enabled"
            checked={popupForm.watch('enabled')}
            onChange={(value) => popupForm.setValue('enabled', value)}
          />
        </div>

        <Input label="Title" maxLength={120} {...popupForm.register('title', { maxLength: 120 })} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Description</label>
          <textarea rows={3} className="input-field" {...popupForm.register('description', { maxLength: 400 })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="CTA Text" {...popupForm.register('ctaText', { maxLength: 40 })} />
          <Input label="CTA Link" {...popupForm.register('ctaLink', { maxLength: 300 })} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Popup Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setPopupImageFile(e.target.files[0]);
              setRemovePopupImage(false);
            }}
            className="input-field"
          />
          {settings?.welcomePopup?.image?.url && !popupImageFile && !removePopupImage && (
            <div className="mt-2 flex items-center gap-3">
              <img src={settings.welcomePopup.image.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setRemovePopupImage(true)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Remove image
              </button>
            </div>
          )}
          {removePopupImage && !popupImageFile && (
            <p className="mt-2 text-xs text-ink/50">Image will be removed on save.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Delay before showing (seconds)"
            type="number"
            min={0}
            max={60}
            {...popupForm.register('delaySeconds', { min: 0, max: 60 })}
          />
          <div className="flex items-end pb-2">
            <Toggle
              label="Show only once per session"
              checked={popupForm.watch('showOncePerSession')}
              onChange={(value) => popupForm.setValue('showOncePerSession', value)}
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-ink/10 pt-4">
          <Button type="submit" isLoading={isSavingPopup}>
            Save Welcome Popup
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettingsForm;