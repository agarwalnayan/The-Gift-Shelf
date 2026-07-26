import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getBannersApi,
  createBannerApi,
  updateBannerApi,
  updateBannerStatusApi,
  reorderBannersApi,
  deleteBannerApi,
} from '../../api/marketingApi.js';
import MarketingListTable from './MarketingListTable.jsx';
import BannerFormModal from './BannerFormModal.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import Button from '../common/Button.jsx';
import { TableSkeleton } from '../common/Skeleton.jsx';

const BannerManagement = ({ type }) => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });
  const [isConfirming, setIsConfirming] = useState(false);

  const loadBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await getBannersApi(type);
      setBanners(data.data.banners);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
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
      loadBanners();
    } catch (error) {
      const messages = error.response?.data?.errors;
      toast.error(messages?.[0] || error.response?.data?.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await updateBannerStatusApi(id, isActive);
      toast.success('Banner status updated');
      await loadBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleReorder = async (newOrder) => {
    try {
      await reorderBannersApi(newOrder);
      toast.success('Banners reordered');
      loadBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reorder');
    }
  };

  const handleDelete = async () => {
    setIsConfirming(true);
    try {
      await deleteBannerApi(confirmState.id);
      toast.success('Banner deleted');
      setConfirmState({ isOpen: false, id: null });
      loadBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setIsConfirming(false);
    }
  };

  const openDeleteConfirm = (id) => {
    setConfirmState({ isOpen: true, id });
  };

  if (isLoading && banners.length === 0) {
    return <TableSkeleton />;
  }

  const title = type === 'hero' ? 'Hero Banners' : 'Promotional Banners';
  const description = type === 'hero'
    ? 'Manage the main image carousel at the top of the homepage'
    : 'Manage promotional banners displayed below the hero section';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          <p className="text-sm text-ink/60">{description}</p>
        </div>
        <Button onClick={openAddModal}>Add Banner</Button>
      </div>

      {banners.length === 0 && !isLoading ? (
        <div className="card p-12 text-center">
          <p className="text-ink/60">No {type} banners yet</p>
          <Button onClick={openAddModal} className="mt-4">
            Create your first banner
          </Button>
        </div>
      ) : (
        <MarketingListTable
          items={banners}
          type={type}
          onEdit={openEditModal}
          onToggleActive={handleToggleStatus}
          onReorder={handleReorder}
          onDelete={openDeleteConfirm}
        />
      )}

      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banner={editingItem}
        bannerType={type}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ isOpen: false, id: null })}
        isConfirming={isConfirming}
      />
    </div>
  );
};

export default BannerManagement;