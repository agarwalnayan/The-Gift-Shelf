import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import {
  getBannersApi,
  createBannerApi,
  updateBannerApi,
  updateBannerStatusApi,
  reorderBannersApi,
  deleteBannerApi,
  getFeaturedItemsApi,
  createFeaturedItemApi,
  updateFeaturedItemApi,
  updateFeaturedItemStatusApi,
  reorderFeaturedItemsApi,
  deleteFeaturedItemApi,
  getBudgetCollectionsApi,
  upsertBudgetCollectionApi,
  getSiteSettingsApi,
} from '../api/marketingApi.js';
import MarketingListTable from '../components/marketing/MarketingListTable.jsx';
import BannerFormModal from '../components/marketing/BannerFormModal.jsx';
import FeaturedItemFormModal from '../components/marketing/FeaturedItemFormModal.jsx';
import BudgetCollectionFormModal from '../components/marketing/BudgetCollectionFormModal.jsx';
import SiteSettingsForm from '../components/marketing/SiteSettingsForm.jsx';
import StoreCheckoutSettingsForm from '../components/marketing/StoreCheckoutSettingsForm.jsx';
import CouponManager from '../components/marketing/CouponManager.jsx';
import HomepageBuilder from '../components/marketing/HomepageBuilder.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import Button from '../components/common/Button.jsx';
import { TableSkeleton } from '../components/common/Skeleton.jsx';

const TABS = [
  { key: 'hero', label: 'Hero Banners' },
  { key: 'promo', label: 'Promotional Banners' },
  { key: 'recipient', label: 'Featured Recipients' },
  { key: 'occasion', label: 'Featured Occasions' },
  { key: 'budget', label: 'Budget Collections' },
  { key: 'homepage', label: 'Homepage Builder' },
  { key: 'settings', label: 'Announcement & Popup' },
  { key: 'checkout', label: 'Checkout & Store' },
  { key: 'coupons', label: 'Coupons' },
];

const FEATURED_MAX = 6;

const MarketingPage = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [searchQuery, setSearchQuery] = useState('');

  // Shared list state per section (kept simple: refetch on tab switch)
  const [banners, setBanners] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [budgetCollections, setBudgetCollections] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });
  const [isConfirming, setIsConfirming] = useState(false);

  const isBannerTab = activeTab === 'hero' || activeTab === 'promo';
  const isFeaturedTab = activeTab === 'recipient' || activeTab === 'occasion';

  const loadTabData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'hero' || activeTab === 'promo') {
        const { data } = await getBannersApi(activeTab);
        setBanners(data.data.banners);
      } else if (activeTab === 'recipient' || activeTab === 'occasion') {
        const { data } = await getFeaturedItemsApi(activeTab);
        setFeaturedItems(data.data.items);
      } else if (activeTab === 'budget') {
        const { data } = await getBudgetCollectionsApi();
        setBudgetCollections(data.data.collections);
      } else if (activeTab === 'settings' || activeTab === 'checkout') {
        const { data } = await getSiteSettingsApi();
        setSettings(data.data.settings);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load marketing content');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleBannerSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateBannerApi(editingItem._id, formData);
        toast.success('Banner updated');
      } else {
        await createBannerApi(formData);
        toast.success('Banner created');
      }
      setIsModalOpen(false);
      loadTabData();
    } catch (error) {
      const messages = error.response?.data?.errors;
      toast.error(messages?.[0] || error.response?.data?.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeaturedItemSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateFeaturedItemApi(editingItem._id, formData);
        toast.success('Item updated');
      } else {
        await createFeaturedItemApi(formData);
        toast.success('Item created');
      }
      setIsModalOpen(false);
      loadTabData();
    } catch (error) {
      const messages = error.response?.data?.errors;
      toast.error(messages?.[0] || error.response?.data?.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBudgetSubmit = async (tier, formData) => {
    setIsSubmitting(true);
    try {
      await upsertBudgetCollectionApi(tier, formData);
      toast.success('Budget collection updated');
      setIsModalOpen(false);
      loadTabData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save budget collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id, value) => {
    try {
      if (isBannerTab) {
        await updateBannerStatusApi(id, value);
        setBanners((prev) => prev.map((b) => (b._id === id ? { ...b, isActive: value } : b)));
      } else if (isFeaturedTab) {
        await updateFeaturedItemStatusApi(id, value);
        setFeaturedItems((prev) => prev.map((i) => (i._id === id ? { ...i, isActive: value } : i)));
      }
      toast.success('Status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleReorder = async (items) => {
    try {
      if (isBannerTab) {
        const reordered = items.map((item) => banners.find((b) => b._id === item.id));
        setBanners(reordered);
        await reorderBannersApi(items);
      } else if (isFeaturedTab) {
        const reordered = items.map((item) => featuredItems.find((i) => i._id === item.id));
        setFeaturedItems(reordered);
        await reorderFeaturedItemsApi(items);
      }
      toast.success('Order updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reorder');
      loadTabData();
    }
  };

  const askDelete = (id) => setConfirmState({ isOpen: true, id });
  const closeConfirm = () => setConfirmState({ isOpen: false, id: null });

  const handleConfirmedDelete = async () => {
    setIsConfirming(true);
    try {
      if (isBannerTab) {
        await deleteBannerApi(confirmState.id);
      } else if (isFeaturedTab) {
        await deleteFeaturedItemApi(confirmState.id);
      }
      toast.success('Removed successfully');
      closeConfirm();
      loadTabData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setIsConfirming(false);
    }
  };

  const currentFeaturedCount = featuredItems.length;

  const getFilteredItems = () => {
    if (searchQuery.trim() === '') {
      if (isBannerTab) return banners;
      if (isFeaturedTab) return featuredItems;
      if (activeTab === 'budget') return budgetCollections;
      return [];
    }
    
    const query = searchQuery.toLowerCase();
    if (isBannerTab) {
      return banners.filter(b => b.title?.toLowerCase().includes(query));
    }
    if (isFeaturedTab) {
      return featuredItems.filter(f => f.title?.toLowerCase().includes(query));
    }
    if (activeTab === 'budget') {
      return budgetCollections.filter(c => c.label?.toLowerCase().includes(query));
    }
    return [];
  };

  const filteredItems = getFilteredItems();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Marketing &amp; Homepage</h1>
        <p className="mt-1 text-sm text-ink/60">
          Manage the storefront hero slider, popups, announcement bar, promo banners, and homepage sections.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-ink/10 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSearchQuery('');
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-primary-50 text-primary-700' : 'text-ink/60 hover:bg-ink/5'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(isBannerTab || isFeaturedTab || activeTab === 'budget') && (
        <div className="mb-4 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <HiOutlineMagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-ink/20 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          {(isBannerTab || isFeaturedTab) && (
            <>
              <p className="text-sm text-ink/50">
                {isFeaturedTab && `${currentFeaturedCount} / ${FEATURED_MAX} used`}
              </p>
              <Button
                onClick={openAddModal}
                disabled={isFeaturedTab && currentFeaturedCount >= FEATURED_MAX}
              >
                Add {activeTab === 'hero' ? 'Hero Banner' : activeTab === 'promo' ? 'Promo Banner' : 'Item'}
              </Button>
            </>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="card p-0">
          <TableSkeleton rows={4} columns={4} />
        </div>
      ) : isBannerTab ? (
        <MarketingListTable
          items={filteredItems}
          onReorder={handleReorder}
          onToggleActive={handleToggleActive}
          onEdit={openEditModal}
          onDelete={askDelete}
          emptyLabel={`No ${activeTab === 'hero' ? 'hero banners' : 'promotional banners'} yet.`}
        />
      ) : isFeaturedTab ? (
        <MarketingListTable
          items={filteredItems}
          onReorder={handleReorder}
          onToggleActive={handleToggleActive}
          onEdit={openEditModal}
          onDelete={askDelete}
          emptyLabel={`No featured ${activeTab === 'recipient' ? 'recipients' : 'occasions'} yet.`}
        />
      ) : activeTab === 'budget' ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {filteredItems.map((collection) => (
            <div key={collection._id} className="card space-y-3 p-5">
              <div className="h-24 w-full overflow-hidden rounded-lg bg-surface">
                {collection.image?.url && (
                  <img src={collection.image.url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <p className="font-semibold text-ink">{collection.label}</p>
              <p className="text-sm text-ink/60">
                ₹{collection.minPrice}
                {collection.maxPrice ? ` – ₹${collection.maxPrice}` : '+'}
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingItem(collection);
                  setIsModalOpen(true);
                }}
              >
                Edit
              </Button>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-3 card p-8 text-center text-ink/60">
              No budget collections found
            </div>
          )}
        </div>
      ) : activeTab === 'homepage' ? (
        <HomepageBuilder />
      ) : activeTab === 'checkout' ? (
        <StoreCheckoutSettingsForm settings={settings} onSaved={setSettings} />
      ) : activeTab === 'coupons' ? (
        <CouponManager />
      ) : (
        <SiteSettingsForm settings={settings} onSaved={setSettings} />
      )}

      {isBannerTab && (
        <BannerFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleBannerSubmit}
          banner={editingItem}
          bannerType={activeTab}
          isSubmitting={isSubmitting}
        />
      )}

      {isFeaturedTab && (
        <FeaturedItemFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFeaturedItemSubmit}
          item={editingItem}
          itemType={activeTab}
          isSubmitting={isSubmitting}
          currentCount={currentFeaturedCount}
          maxCount={FEATURED_MAX}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetCollectionFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleBudgetSubmit}
          collection={editingItem}
          isSubmitting={isSubmitting}
        />
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title="Remove this item?"
        description="It will be hidden from the storefront homepage."
        confirmLabel="Remove"
        isLoading={isConfirming}
        onConfirm={handleConfirmedDelete}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default MarketingPage;