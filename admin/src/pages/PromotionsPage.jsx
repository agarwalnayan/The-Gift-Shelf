import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import {
  getPromotionsApi,
  updatePromotionStatusApi,
  deletePromotionApi,
} from '../api/promotionApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { TableSkeleton } from '../components/common/Skeleton.jsx';
import Button from '../components/common/Button.jsx';

const PROMOTION_TYPES = {
  buy_more_save_more: 'Buy More Save More',
  flat_discount: 'Flat Discount',
  percentage_discount: 'Percentage Discount',
  buy_x_get_y: 'Buy X Get Y',
  free_shipping: 'Free Shipping',
  free_gift: 'Free Gift',
  bundle_pricing: 'Bundle Pricing',
  category_discount: 'Category Discount',
  collection_discount: 'Collection Discount',
  first_order_offer: 'First Order Offer',
  festival_offer: 'Festival Offer',
  custom_rule: 'Custom Rule',
};

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
};

const PromotionsPage = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [confirmState, setConfirmState] = useState({ isOpen: false, promotionId: null, action: null });
  const [isConfirming, setIsConfirming] = useState(false);

  const loadPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const { data } = await getPromotionsApi(params);
      setPromotions(data.data.promotions);
      setTotalPages(data.data.totalPages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load promotions');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    const debounce = setTimeout(loadPromotions, searchQuery ? 350 : 0);
    return () => clearTimeout(debounce);
  }, [loadPromotions]);

  const handleStatusChange = async (promotionId, newStatus) => {
    try {
      await updatePromotionStatusApi(promotionId, newStatus);
      toast.success('Promotion status updated');
      loadPromotions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!confirmState.promotionId) return;

    setIsConfirming(true);
    try {
      await deletePromotionApi(confirmState.promotionId);
      toast.success('Promotion deleted successfully');
      setConfirmState({ isOpen: false, promotionId: null, action: null });
      loadPromotions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete promotion');
    } finally {
      setIsConfirming(false);
    }
  };

  const openDeleteConfirm = (promotionId) => {
    setConfirmState({ isOpen: true, promotionId, action: 'delete' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading && promotions.length === 0) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Promotions</h1>
          <p className="mt-1 text-sm text-gray-600">Manage marketing promotions and discounts</p>
        </div>
        <Button onClick={() => navigate('/promotions/new')} icon={<HiOutlinePlus />}>
          New Promotion
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search promotions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          {Object.entries(PROMOTION_TYPES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Promotions Table */}
      {promotions.length === 0 ? (
        <EmptyState
          title="No promotions found"
          description={searchQuery || statusFilter || typeFilter ? 'Try adjusting your filters' : 'Create your first promotion to get started'}
          actionLabel="New Promotion"
          onAction={() => navigate('/promotions/new')}
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promotions.map((promotion) => (
                  <tr key={promotion._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                      {promotion.badgeText && (
                        <div className="text-xs text-gray-500 mt-1">Badge: {promotion.badgeText}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {PROMOTION_TYPES[promotion.type] || promotion.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[promotion.status] || STATUS_COLORS.draft}`}
                      >
                        {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promotion.priority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/promotions/${promotion._id}`)}
                          className="text-primary-600 hover:text-primary-900 p-1"
                          title="Edit"
                        >
                          <HiOutlinePencilSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(promotion._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, promotionId: null, action: null })}
        onConfirm={handleDelete}
        isConfirming={isConfirming}
        title="Delete Promotion"
        message="Are you sure you want to delete this promotion? This action cannot be undone."
      />
    </div>
  );
};

export default PromotionsPage;
