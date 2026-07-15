import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineDocumentText, HiOutlinePencil, HiOutlineEye, HiOutlinePlus } from 'react-icons/hi2';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Toggle from '../components/common/Toggle.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import Loader from '../components/common/Loader.jsx';

const DEFAULT_PAGES = [
  { slug: 'about-us', title: 'About Us', content: '' },
  { slug: 'privacy-policy', title: 'Privacy Policy', content: '' },
  { slug: 'terms-of-service', title: 'Terms of Service', content: '' },
  { slug: 'shipping-policy', title: 'Shipping Policy', content: '' },
  { slug: 'refund-policy', title: 'Refund & Returns Policy', content: '' },
  { slug: 'contact-us', title: 'Contact Us', content: '' },
];

const CMSPage = () => {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletePageId, setDeletePageId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const storedPages = localStorage.getItem('cms_pages');
      if (storedPages) {
        setPages(JSON.parse(storedPages));
      } else {
        setPages(DEFAULT_PAGES);
      }
    } catch (error) {
      toast.error('Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  };

  const savePages = async (updatedPages) => {
    localStorage.setItem('cms_pages', JSON.stringify(updatedPages));
    setPages(updatedPages);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setIsSaving(true);
    try {
      const updatedPages = pages.map(p => 
        p.slug === editingPage.slug ? editingPage : p
      );
      await savePages(updatedPages);
      toast.success('Page saved successfully');
      setEditingPage(null);
    } catch (error) {
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePage = async () => {
    if (!newPageSlug || !newPageTitle) {
      toast.error('Slug and title are required');
      return;
    }
    if (pages.some(p => p.slug === newPageSlug)) {
      toast.error('A page with this slug already exists');
      return;
    }
    const newPage = {
      slug: newPageSlug.toLowerCase().replace(/\s+/g, '-'),
      title: newPageTitle,
      content: '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const updatedPages = [...pages, newPage];
    await savePages(updatedPages);
    toast.success('Page created successfully');
    setNewPageSlug('');
    setNewPageTitle('');
    setIsCreating(false);
  };

  const handleDeletePage = async () => {
    if (!deletePageId) return;
    const updatedPages = pages.filter(p => p.slug !== deletePageId);
    await savePages(updatedPages);
    toast.success('Page deleted successfully');
    setIsDeleteConfirmOpen(false);
    setDeletePageId(null);
  };

  const handleToggleActive = async (slug) => {
    const updatedPages = pages.map(p =>
      p.slug === slug ? { ...p, isActive: !p.isActive } : p
    );
    await savePages(updatedPages);
    toast.success('Page visibility updated');
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
        <Button onClick={() => setIsCreating(true)}>
          <HiOutlinePlus size={16} className="mr-1.5" />
          Create New Page
        </Button>
      </div>

      {isCreating && (
        <div className="card space-y-4 p-6">
          <h3 className="text-base font-semibold text-ink">Create New Page</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Page Slug"
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              placeholder="my-new-page"
              helperText="URL-friendly identifier (e.g., my-new-page)"
            />
            <Input
              label="Page Title"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="My New Page"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCreatePage}>Create Page</Button>
            <Button variant="secondary" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

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
                    {!page.isActive && (
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink/60">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    /{page.slug} · {page.content?.length || 0} characters
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={page.isActive}
                    onChange={() => handleToggleActive(page.slug)}
                    label="Visible"
                  />
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
                  {!DEFAULT_PAGES.some(p => p.slug === page.slug) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        setDeletePageId(page.slug);
                        setIsDeleteConfirmOpen(true);
                      }}
                    >
                      <HiOutlineDocumentText size={16} />
                    </Button>
                  )}
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
                onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
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

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete this page?"
        description="This action cannot be undone. The page will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDeletePage}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setDeletePageId(null);
        }}
      />
    </div>
  );
};

export default CMSPage;
