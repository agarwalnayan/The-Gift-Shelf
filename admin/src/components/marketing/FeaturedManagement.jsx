import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getFeaturedItemsApi,
  updateFeaturedItemApi,
  updateFeaturedItemStatusApi,
  reorderFeaturedItemsApi,
} from '../../api/marketingApi.js';
import MarketingListTable from './MarketingListTable.jsx';
import Button from '../common/Button.jsx';
import { TableSkeleton } from '../common/Skeleton.jsx';

const FEATURED_MAX = 6;

const FeaturedManagement = ({ type }) => {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await getFeaturedItemsApi(type);
      setItems(data.data.items || []);
      setAllItems(data.data.allItems || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleToggleStatus = async (id, isActive) => {
    try {
      await updateFeaturedItemStatusApi(id, isActive);
      toast.success(isActive ? 'Item added to homepage' : 'Item removed from homepage');
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

  if (isLoading && items.length === 0) {
    return <TableSkeleton />;
  }

  const title = type === 'recipient' ? 'Featured Recipients' : 'Featured Occasions';
  const description = type === 'recipient'
    ? 'Select recipients to show on homepage. Create entries in Catalog Master first.'
    : 'Select occasions to show on homepage. Create entries in Catalog Master first.';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          <p className="text-sm text-ink/60">{description}</p>
          <p className="text-xs text-ink/40 mt-1">
            {items.length} / {FEATURED_MAX} featured • {allItems.length} total available
          </p>
        </div>
        <Button
          onClick={() => window.open('/catalog-masters', '_blank')}
          variant="secondary"
        >
          Manage in Catalog Master
        </Button>
      </div>

      {allItems.length === 0 && !isLoading ? (
        <div className="card p-12 text-center">
          <p className="text-ink/60">No {type} entries found in Catalog Master</p>
          <Button
            onClick={() => window.open('/catalog-masters', '_blank')}
            className="mt-4"
          >
            Create entries in Catalog Master
          </Button>
        </div>
      ) : items.length === 0 && !isLoading ? (
        <div className="card p-12 text-center">
          <p className="text-ink/60">No items featured on homepage</p>
          <p className="text-sm text-ink/40 mt-2">Toggle "Show on Homepage" on items below to feature them</p>
        </div>
      ) : (
        <MarketingListTable
          items={items}
          type={type}
          onToggleActive={handleToggleStatus}
          onReorder={handleReorder}
          emptyLabel={`No featured ${type}s yet`}
        />
      )}

      {allItems.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ink mb-4">All {type}s (toggle to feature)</h3>
          <div className="space-y-2">
            {allItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 rounded-lg border border-ink/10 hover:bg-ink/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.image?.url && (
                    <img
                      src={item.image.url}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-ink/40">{item.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleStatus(item._id, !item.showOnHomepage)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    item.showOnHomepage
                      ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                      : 'bg-ink/10 text-ink/60 hover:bg-ink/20'
                  }`}
                >
                  {item.showOnHomepage ? 'Featured' : 'Feature'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedManagement;