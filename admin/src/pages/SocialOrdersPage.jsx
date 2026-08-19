import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineClipboard } from 'react-icons/hi2';
import { getOrderRequestsApi, cancelOrderRequestApi } from '../api/orderRequestApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Input from '../components/common/Input.jsx';
import TableCard from '../components/common/TableCard.jsx';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

const statusStyles = {
  'pending': 'bg-yellow-100 text-yellow-700',
  'completed': 'bg-green-100 text-green-700',
  'cancelled': 'bg-red-100 text-red-700',
  'expired': 'bg-gray-100 text-gray-700',
};

const sourceStyles = {
  'instagram': 'bg-pink-100 text-pink-700',
  'whatsapp': 'bg-green-100 text-green-700',
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const groupOrdersByDate = (orders) => {
  const today = startOfDay(new Date());
  const yesterday = today - 24 * 60 * 60 * 1000;

  const groups = { Today: [], Yesterday: [], Older: [] };

  orders.forEach((order) => {
    const orderDay = startOfDay(order.createdAt);
    if (orderDay === today) groups.Today.push(order);
    else if (orderDay === yesterday) groups.Yesterday.push(order);
    else groups.Older.push(order);
  });

  return groups;
};

const SocialOrdersPage = () => {
  const [orderRequests, setOrderRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [requestPendingCancel, setRequestPendingCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadOrderRequests = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await getOrderRequestsApi(params);
      setOrderRequests(data.data.orderRequests);
      setFilteredRequests(data.data.orderRequests);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load order requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrderRequests();
  }, [statusFilter]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRequests(orderRequests);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRequests(
        orderRequests.filter(
          (request) =>
            request._id?.toLowerCase().includes(query) ||
            request.source?.toLowerCase().includes(query) ||
            request.status?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, orderRequests]);

  const handleCancel = async () => {
    if (!requestPendingCancel) return;
    setIsCancelling(true);
    try {
      await cancelOrderRequestApi(requestPendingCancel._id);
      toast.success('Order request cancelled');
      setRequestPendingCancel(null);
      loadOrderRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order request');
    } finally {
      setIsCancelling(false);
    }
  };

  const copyCompletionLink = (completionUrl) => {
    navigator.clipboard.writeText(completionUrl);
    toast.success('Link copied to clipboard');
  };

  const groupedRequests = useMemo(() => groupOrdersByDate(filteredRequests), [filteredRequests]);

  const requestColumns = [
    { header: 'ID', width: '100px' },
    { header: 'Source', width: '100px' },
    { header: 'Items', width: '64px' },
    { header: 'Amount', width: '96px' },
    { header: 'Status', width: '128px' },
    { header: '', width: '64px' },
  ];

  const renderRequestRow = (request) => [
    <td key="id" className="font-mono text-xs">
      {request._id.slice(-8).toUpperCase()}
    </td>,
    <td key="source">
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${sourceStyles[request.source] || 'bg-gray-100 text-gray-700'}`}>
        {request.source}
      </span>
    </td>,
    <td key="items">{request.items.length}</td>,
    <td key="amount">₹{request.agreedPrice}</td>,
    <td key="status">
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[request.status] || 'bg-gray-100 text-gray-700'}`}>
        {statusOptions.find(s => s.value === request.status)?.label || request.status}
      </span>
    </td>,
    <td key="actions">
      <div className="flex items-center gap-2">
        {request.status === 'pending' && (
          <>
            <button
              onClick={() => copyCompletionLink(`${window.location.origin}/social-order/${request.token}`)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-primary-50 hover:text-primary-600"
              aria-label="Copy completion link"
            >
              <HiOutlineClipboard size={16} />
            </button>
            <button
              onClick={() => setRequestPendingCancel(request)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Cancel request"
            >
              <HiOutlineTrash size={16} />
            </button>
          </>
        )}
        {request.completedOrder && (
          <Link
            to={`/orders/${request.completedOrder._id}`}
            className="text-xs font-medium text-primary-600 hover:underline"
          >
            View Order
          </Link>
        )}
      </div>
    </td>,
  ];

  const renderRequestCard = (request) => (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-semibold text-ink">{request._id.slice(-8).toUpperCase()}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${sourceStyles[request.source] || 'bg-gray-100 text-gray-700'}`}>
              {request.source}
            </span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[request.status] || 'bg-gray-100 text-gray-700'}`}>
              {statusOptions.find(s => s.value === request.status)?.label || request.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Items</span>
          <p className="text-sm text-ink mt-1">{request.items.length}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Amount</span>
          <p className="text-sm font-medium text-ink mt-1">₹{request.agreedPrice}</p>
        </div>
      </div>

      {request.status === 'pending' && (
        <div className="flex items-center gap-2 pt-2 border-t border-ink/10">
          <button
            onClick={() => copyCompletionLink(`${window.location.origin}/social-order/${request.token}`)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <HiOutlineClipboard size={16} />
            Copy Link
          </button>
          <button
            onClick={() => setRequestPendingCancel(request)}
            className="p-2 text-ink/40 hover:text-red-600 rounded hover:bg-red-50"
            aria-label="Cancel request"
          >
            <HiOutlineTrash size={18} />
          </button>
        </div>
      )}

      {request.completedOrder && (
        <div className="pt-2 border-t border-ink/10">
          <Link
            to={`/orders/${request.completedOrder._id}`}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            View Completed Order →
          </Link>
        </div>
      )}
    </div>
  );

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Orders"
        description="Manage Instagram and WhatsApp order requests"
        actions={
          <Link
            to="/social-orders/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <HiOutlinePlus size={18} />
            Create Social Order
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by ID, source, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<HiOutlineMagnifyingGlass size={18} />}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-ink/20 rounded-lg bg-white text-sm"
        >
          <option value="">All Status</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No order requests found"
          description={searchQuery || statusFilter ? 'No matching requests found' : 'Social order requests will appear here.'}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRequests).map(([groupLabel, groupRequests]) => {
            if (groupRequests.length === 0) return null;

            return (
              <div key={groupLabel}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
                  {groupLabel} <span className="text-ink/30">({groupRequests.length})</span>
                </h2>

                <TableCard
                  columns={requestColumns}
                  data={groupRequests}
                  renderRow={renderRequestRow}
                  renderCard={renderRequestCard}
                />
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!requestPendingCancel}
        title="Cancel this order request?"
        description={
          requestPendingCancel
            ? `Order request #${requestPendingCancel._id.slice(-8).toUpperCase()} will be cancelled. This cannot be undone.`
            : ''
        }
        confirmLabel="Cancel Request"
        isLoading={isCancelling}
        onConfirm={handleCancel}
        onCancel={() => setRequestPendingCancel(null)}
      />
    </div>
  );
};

export default SocialOrdersPage;
