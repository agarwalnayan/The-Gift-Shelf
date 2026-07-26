import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getBudgetCollectionsApi,
  upsertBudgetCollectionApi,
} from '../../api/marketingApi.js';
import BudgetCollectionFormModal from './BudgetCollectionFormModal.jsx';
import { TableSkeleton } from '../common/Skeleton.jsx';

const TIERS = [
  { key: 'under-499', label: 'Under ₹499', description: 'Budget-friendly gifts' },
  { key: '500-999', label: '₹500 - ₹999', description: 'Mid-range gifts' },
  { key: 'premium', label: 'Premium', description: 'Premium gifts above ₹999' },
];

const BudgetManagement = () => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await getBudgetCollectionsApi();
      setCollections(data.data.collections);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load budget collections');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const openEditModal = (tier) => {
    const existing = collections.find(c => c.tier === tier.key);
    setEditingItem(existing || { tier: tier.key });
    setIsModalOpen(true);
  };

  const handleSubmit = async (tier, formData) => {
    setIsSubmitting(true);
    try {
      await upsertBudgetCollectionApi(tier, formData);
      toast.success('Budget collection updated');
      setIsModalOpen(false);
      loadCollections();
    } catch (error) {
      const messages = error.response?.data?.errors;
      toast.error(messages?.[0] || error.response?.data?.message || 'Failed to save budget collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && collections.length === 0) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Budget Collections</h2>
        <p className="text-sm text-ink/60">Manage price range collections for the homepage</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const collection = collections.find(c => c.tier === tier.key);
          return (
            <div
              key={tier.key}
              className="card overflow-hidden cursor-pointer transition-all hover:shadow-lg"
              onClick={() => openEditModal(tier)}
            >
              {collection?.image?.url ? (
                <div className="aspect-video w-full overflow-hidden bg-surface">
                  <img
                    src={collection.image.url}
                    alt={tier.label}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-surface flex items-center justify-center">
                  <span className="text-ink/30 text-sm">No image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-ink">{tier.label}</h3>
                <p className="text-xs text-ink/60 mt-1">{tier.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ink/40">
                    {collection?.minPrice && collection?.maxPrice
                      ? `₹${collection.minPrice} - ₹${collection.maxPrice}`
                      : 'Not configured'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    collection?.isActive ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/60'
                  }`}>
                    {collection?.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BudgetCollectionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collection={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default BudgetManagement;