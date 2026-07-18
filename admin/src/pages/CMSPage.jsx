import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineDocumentText, HiOutlinePencil, HiOutlineEye } from 'react-icons/hi2';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import {
  getSiteSettings,
  updateSiteSettings,
} from '../api/siteSettingsApi';

const CMSPage = () => {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setIsLoading(true);

    try {
      const settings = await getSiteSettings();

      setPages([
        {
          slug: 'about-us',
          title: 'About Us',
          content: settings.policies?.aboutUs || '',
        },
        {
          slug: 'privacy-policy',
          title: 'Privacy Policy',
          content: settings.policies?.privacyPolicy || '',
        },
        {
          slug: 'shipping-policy',
          title: 'Shipping Policy',
          content: settings.policies?.shippingPolicy || '',
        },
        {
          slug: 'refund-policy',
          title: 'Return Policy',
          content: settings.policies?.returnPolicy || '',
        },
        {
          slug: 'terms-of-service',
          title: 'Terms & Conditions',
          content: settings.policies?.termsAndConditions || '',
        },
      ]);
    } catch (error) {
      toast.error('Failed to load site settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPage) return;

    setIsSaving(true);

    try {
      const settings = await getSiteSettings();

      const policies = {
        ...settings.policies,
      };

      switch (editingPage.slug) {
        case 'about-us':
          policies.aboutUs = editingPage.content;
          break;

        case 'privacy-policy':
          policies.privacyPolicy = editingPage.content;
          break;

        case 'shipping-policy':
          policies.shippingPolicy = editingPage.content;
          break;

        case 'refund-policy':
          policies.returnPolicy = editingPage.content;
          break;

        case 'terms-of-service':
          policies.termsAndConditions = editingPage.content;
          break;

        default:
          break;
      }

      await updateSiteSettings({
        policies,
      });

      toast.success('Saved');

      setEditingPage(null);

      loadPages();

    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Content Management</h1>
          <p className="mt-1 text-sm text-ink/60">
            Manage static pages like About Us, Privacy Policy, and more.
          </p>
        </div>
      </div>

      <div className="card space-y-4 p-0">
        {pages.length === 0 ? (
          <div className="p-8 text-center text-ink/60">
            <HiOutlineDocumentText size={48} className="mx-auto mb-3 text-ink/20" />
            <p>No pages created yet</p>
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {pages.map((page) => (
              <div key={page.slug} className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-ink">{page.title}</p>

                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    /{page.slug} · {page.content?.length || 0} characters
                  </p>
                </div>
                <div className="flex items-center gap-3">

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingPage(page);
                      setIsPreviewOpen(false);
                    }}
                  >
                    <HiOutlinePencil size={16} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingPage(page);
                      setIsPreviewOpen(true);
                    }}
                  >
                    <HiOutlineEye size={16} />
                  </Button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingPage && (
        <div className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">
              {isPreviewOpen ? 'Preview' : 'Edit'}: {editingPage.title}
            </h3>
            <Button variant="secondary" onClick={() => setEditingPage(null)}>
              Close
            </Button>
          </div>

          {isPreviewOpen ? (
            <div className="prose max-w-none rounded-lg bg-surface p-6">
              <h1>{editingPage.title}</h1>
              <div className="whitespace-pre-wrap">{editingPage.content || 'No content yet'}</div>
            </div>
          ) : (
            <>
              <Input
                label="Page Title"
                value={editingPage.title}
                disabled
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink/80">Content</label>
                <textarea
                  rows={15}
                  className="input-field"
                  value={editingPage.content}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  placeholder="Enter page content here. You can use plain text or basic HTML."
                />
                <p className="mt-1 text-xs text-ink/50">
                  Supports basic HTML tags like &lt;p&gt;, &lt;h1&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} isLoading={isSaving}>
                  Save Page
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  Preview
                </Button>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
};

export default CMSPage;
