import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getFeaturedItemsApi,
  createFeaturedItemApi,
  updateFeaturedItemApi,
  updateFeaturedItemStatusApi,
  reorderFeaturedItemsApi,
  deleteFeaturedItemApi,
} from '../../api/marketingApi.js';
import MarketingListTable from './MarketingListTable.jsx';
import FeaturedItemFormModal from './FeaturedItemFormModal.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import Button from '../common/Button.jsx';
import { TableSkeleton } from '../common/Skeleton.jsx';

const FEATURED_MAX = 6;

const FeaturedManagement = ({ type }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });
  const [isConfirming, setIsConfirming] = useState(false);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await getFeaturedItemsApi(type);
      setItems(data.data.items);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openAddModal = () => {
    if (items.length >= FEATURED_MAX) {
      toast.error(`Maximum ${FEATURED_MAX} items allowed`);
      return;
    }
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
        await updateFeaturedItemApi(editingItem._id, formData);
        toast.success('Item updated');
      } else {
        if (items.length >= FEATURED_MAX) {
          toast.error(`Maximum ${FEATURED_MAX} items allowed`);
          return;
        }
        await createFeaturedItemApi(formData);
        toast.success('Item created');
      }
      setIsModalOpen(false);
      loadItems();
    } catch (error) {
      const messages = error.response?.data?.errors;
      toast.error(messages?.[0] || error.response?.data?.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await updateFeaturedItemStatusApi(id, isActive);
      toast.success('Item status updated');
      loadItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleReorder = async (newOrder) => {
    try {
      await reorderFeaturedItemsApi(newOrder);
      toast.success('Items reordered');
      loadItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reorder');
    }
  };

  const handleDelete = async () => {
    setIsConfirming(true);
    try {
      await deleteFeaturedItemApi(confirmState.id);
      toast.success('Item deleted');
      setConfirmState({ isOpen: false, id: null });
      loadItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setIsConfirming(false);
    }
  };

  const openDeleteConfirm = (id) => {
    setConfirmState({ isOpen: true, id });
  };

  if (isLoading && items.length === 0) {
    return <TableSkeleton />;
  }

  const title = type === 'recipient' ? 'Featured Recipients' : 'Featured Occasions';
  const description = type === 'recipient'
    ? 'Manage gift ideas organized by recipient type'
    : 'Manage gift ideas organized by occasion';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          <p className="text-sm text-ink/60">{description}</p>
          <p className="text-xs text-ink/40 mt-1">Maximum {FEATURED_MAX} items allowed</p>
        </div>
        <Button onClick={openAddModal} disabled={items.length >= FEATURED_MAX}>
          Add Item
        </Button>
      </div>

      {items.length === 0 && !isLoading ? (
        <div className="card p-12 text-center">
          <p className="text-ink/60">No {type} items yet</p>
          <Button onClick={openAddModal} className="mt-4">
            Create your first item
          </Button>
        </div>
      ) : (
        <MarketingListTable
          items={items}
          type={type}
          onEdit={openEditModal}
          onToggleActive={handleToggleStatus}
          onReorder={handleReorder}
          onDelete={openDeleteConfirm}
        />
      )}

      <FeaturedItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
        itemType={type}
        currentCount={items.length}
        maxCount={FEATURED_MAX}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ isOpen: false, id: null })}
        isConfirming={isConfirming}
      />
    </div>
  );
};

export default FeaturedManagement;