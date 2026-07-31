import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineXCircle,
  HiOutlineDocumentDuplicate,
  HiOutlinePlus,
} from 'react-icons/hi2';
import {
  getProductsApi,
  updateProductStatusApi,
  updateProductPublishStatusApi,
  updateProductFeatureApi,
  bulkProductActionApi,
  bulkUpdateProductsApi,
  softDeleteProductApi,
  restoreProductApi,
  permanentlyDeleteProductApi,
} from '../api/productApi.js';
import { getCategoriesApi } from '../api/categoryApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Toggle from '../components/common/Toggle.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { TableSkeleton } from '../components/common/Skeleton.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import TableCard from '../components/common/TableCard.jsx';
import ProductFilters from '../components/product/ProductFilters.jsx';
import ProductBulkActionsBar from '../components/product/ProductBulkActionsBar.jsx';
import BulkEditModal from '../components/product/BulkEditModal.jsx';

const baseFilters = {
  search: '',
  category: '',
  isActive: '',
  isFeatured: '',
  publishStatus: '',
  sort: 'newest',
  includeDeleted: false,
};

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Supports deep links like /products?publishStatus=draft (used by the
  // Dashboard's "Review drafts" banner) by seeding the initial filter state
  // from the URL on first load.
  const [filters, setFilters] = useState(() => ({
    ...baseFilters,
    publishStatus: searchParams.get('publishStatus') || '',
  }));
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [confirmState, setConfirmState] = useState({ isOpen: false, action: null, productId: null });
  const [isConfirming, setIsConfirming] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  useEffect(() => {
    getCategoriesApi().then(({ data }) => setCategories(data.data.categories));
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 12, sort: filters.sort };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.isActive) params.isActive = filters.isActive;
      if (filters.isFeatured) params.isFeatured = filters.isFeatured;
      if (filters.publishStatus) params.publishStatus = filters.publishStatus;
      if (filters.includeDeleted) params.includeDeleted = 'true';

      const { data } = await getProductsApi(params);
      setProducts(data.data.products);
      setTotalPages(data.data.totalPages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    const debounce = setTimeout(loadProducts, filters.search ? 350 : 0);
    return () => clearTimeout(debounce);
  }, [loadProducts]);

  const handleFilterChange = (patch) => {
    setPage(1);
    setSelectedIds([]);
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === products.length ? [] : products.map((p) => p._id)));
  };

  const handleToggleActive = async (id, value) => {
    try {
      await updateProductStatusApi(id, value);
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, isActive: value } : p)));
      toast.success('Status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleTogglePublish = async (id, value) => {
    try {
      await updateProductPublishStatusApi(id, value ? 'published' : 'draft');
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, publishStatus: value ? 'published' : 'draft' } : p)));
      toast.success('Publish status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update publish status');
    }
  };

  const handleToggleFeatured = async (id, value) => {
    try {
      await updateProductFeatureApi(id, value);
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, isFeatured: value } : p)));
      toast.success('Featured setting updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update featured setting');
    }
  };

  const handleBulkAction = async (action) => {
    if (action === 'bulkEdit') {
      setIsBulkEditModalOpen(true);
      return;
    }

    try {
      await bulkProductActionApi(selectedIds, action);
      toast.success('Bulk action applied');
      setSelectedIds([]);
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk action failed');
    }
  };

  const handleBulkEditSubmit = async (data) => {
    try {
      await bulkUpdateProductsApi({
        productIds: selectedIds,
        ...data,
      });
      toast.success(`${selectedIds.length} products updated successfully`);
      setSelectedIds([]);
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk edit failed');
      throw error;
    }
  };

  const askConfirm = (action, productId) => setConfirmState({ isOpen: true, action, productId });
  const closeConfirm = () => setConfirmState({ isOpen: false, action: null, productId: null });

  const handleConfirmedAction = async () => {
    const { action, productId } = confirmState;
    setIsConfirming(true);
    try {
      if (action === 'delete') {
        await softDeleteProductApi(productId);
        toast.success('Product moved to trash');
      } else if (action === 'permanent') {
        await permanentlyDeleteProductApi(productId);
        toast.success('Product permanently deleted');
      }
      closeConfirm();
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreProductApi(id);
      toast.success('Product restored');
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore product');
    }
  };

  const confirmCopy = {
    delete: {
      title: 'Move product to trash?',
      description: 'The product will be hidden from the storefront and can be restored later.',
      confirmLabel: 'Move to Trash',
    },
    permanent: {
      title: 'Permanently delete this product?',
      description: 'This cannot be undone. Its images will also be removed from storage.',
      confirmLabel: 'Delete Permanently',
    },
  };

  const productColumns = [
    { header: 'Product', width: '200px' },
    { header: 'Category', width: '120px' },
    { header: 'Price', width: '100px' },
    { header: 'Stock', width: '100px' },
    { header: 'Active', width: '80px' },
    { header: 'Published', width: '96px' },
    { header: 'Featured', width: '80px' },
    { header: '', width: '128px' },
  ];

  const renderProductRow = (product) => [
    <td key="product">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={
            product.primaryImage?.url ||
            product.images?.[0]?.url ||
            "/placeholder-product.png"
          } alt={product.name}
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <span className="font-medium block truncate">{product.name}</span>
          {product.isFeatured && (
            <span className="mt-1 inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-700">
              Featured
            </span>
          )}
        </div>
      </div>
    </td>,
    <td key="category" className="truncate">{product.category?.name}</td>,
    <td key="price">₹{product.discountPrice > 0 ? product.discountPrice : product.price}</td>,
    <td key="stock">
      {product.stock}
      {product.stockStatus === 'low_stock' && (
        <span className="ml-1.5 inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
          Low
        </span>
      )}
      {product.stockStatus === 'out_of_stock' && (
        <span className="ml-1.5 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
          Out
        </span>
      )}
    </td>,
    <td key="active">
      <Toggle
        checked={product.isActive}
        disabled={product.isDeleted}
        onChange={(v) => handleToggleActive(product._id, v)}
      />
    </td>,
    <td key="published">
      <Toggle
        checked={product.publishStatus === 'published'}
        disabled={product.isDeleted}
        onChange={(v) => handleTogglePublish(product._id, v)}
      />
    </td>,
    <td key="featured">
      <Toggle
        checked={product.isFeatured}
        disabled={product.isDeleted}
        onChange={(v) => handleToggleFeatured(product._id, v)}
      />
    </td>,
    <td key="actions">
      <div className="flex items-center gap-2">
        {product.isDeleted ? (
          <button onClick={() => handleRestore(product._id)} className="p-1.5 text-ink/50 hover:text-green-600 rounded hover:bg-green-50" title="Restore">
            <HiOutlineArrowUturnLeft size={18} />
          </button>
        ) : (
          <>
            <Link to={`/products/${product._id}/edit`} className="p-1.5 text-ink/50 hover:text-primary-600 rounded hover:bg-primary-50" title="Edit">
              <HiOutlinePencilSquare size={18} />
            </Link>
            <Link
              to={`/products/new?duplicateFrom=${product._id}`}
              className="p-1.5 text-ink/50 hover:text-primary-600 rounded hover:bg-primary-50"
              title="Duplicate"
            >
              <HiOutlineDocumentDuplicate size={18} />
            </Link>
          </>
        )}

        {product.isDeleted ? (
          <button
            onClick={() => askConfirm('permanent', product._id)}
            className="p-1.5 text-ink/50 hover:text-red-600 rounded hover:bg-red-50"
            title="Delete permanently"
          >
            <HiOutlineXCircle size={18} />
          </button>
        ) : (
          <button onClick={() => askConfirm('delete', product._id)} className="p-1.5 text-ink/50 hover:text-red-600 rounded hover:bg-red-50" title="Delete">
            <HiOutlineTrash size={18} />
          </button>
        )}
      </div>
    </td>,
  ];

  const renderProductCard = (product) => (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <img
          src={
            product.primaryImage?.url ||
            product.images?.[0]?.url ||
            "/placeholder-product.png"
          } alt={product.name}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink truncate">{product.name}</p>
          {product.isFeatured && (
            <span className="mt-1 inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-700">
              Featured
            </span>
          )}
          <p className="text-sm text-ink/60">{product.sku}</p>
          <p className="text-sm font-medium text-ink mt-1">₹{product.discountPrice > 0 ? product.discountPrice : product.price}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Stock</span>
          <p className="text-sm text-ink mt-1">
            {product.stock}
            {product.stockStatus === 'low_stock' && (
              <span className="ml-1.5 inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                Low
              </span>
            )}
            {product.stockStatus === 'out_of_stock' && (
              <span className="ml-1.5 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                Out
              </span>
            )}
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Category</span>
          <p className="text-sm text-ink mt-1">{product.category?.name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2 border-t border-ink/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink/50">Active</span>
            <Toggle
              checked={product.isActive}
              disabled={product.isDeleted}
              onChange={(v) => handleToggleActive(product._id, v)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink/50">Published</span>
            <Toggle
              checked={product.publishStatus === 'published'}
              disabled={product.isDeleted}
              onChange={(v) => handleTogglePublish(product._id, v)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {product.isDeleted ? (
            <button onClick={() => handleRestore(product._id)} className="p-2 text-ink/50 hover:text-green-600 rounded hover:bg-green-50" title="Restore">
              <HiOutlineArrowUturnLeft size={18} />
            </button>
          ) : (
            <>
              <Link to={`/products/${product._id}/edit`} className="p-2 text-ink/50 hover:text-primary-600 rounded hover:bg-primary-50" title="Edit">
                <HiOutlinePencilSquare size={18} />
              </Link>
              <Link
                to={`/products/new?duplicateFrom=${product._id}`}
                className="p-2 text-ink/50 hover:text-primary-600 rounded hover:bg-primary-50"
                title="Duplicate"
              >
                <HiOutlineDocumentDuplicate size={18} />
              </Link>
            </>
          )}
          {product.isDeleted ? (
            <button
              onClick={() => askConfirm('permanent', product._id)}
              className="p-2 text-ink/50 hover:text-red-600 rounded hover:bg-red-50"
              title="Delete permanently"
            >
              <HiOutlineXCircle size={18} />
            </button>
          ) : (
            <button onClick={() => askConfirm('delete', product._id)} className="p-2 text-ink/50 hover:text-red-600 rounded hover:bg-red-50" title="Delete">
              <HiOutlineTrash size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        actions={
          <Link to="/products/new">
            <Button>
              <HiOutlinePlus size={16} className="mr-1.5" />
              Add Product
            </Button>
          </Link>
        }
      />

      <ProductFilters filters={filters} onFilterChange={handleFilterChange} categories={categories} />

      <ProductBulkActionsBar count={selectedIds.length} onAction={handleBulkAction} onClear={() => setSelectedIds([])} />

      {isLoading ? (
        <div className="card p-0">
          <TableSkeleton rows={6} columns={8} />
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No products found" description="Try adjusting your filters, or add your first product." />
      ) : (
        <>
          <TableCard
            columns={productColumns}
            data={products}
            keyExtractor={(product) => product._id}
            renderRow={renderProductRow}
            renderCard={renderProductCard}
          />

          <div className="card mt-4 p-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.action ? confirmCopy[confirmState.action].title : ''}
        description={confirmState.action ? confirmCopy[confirmState.action].description : ''}
        confirmLabel={confirmState.action ? confirmCopy[confirmState.action].confirmLabel : 'Confirm'}
        isLoading={isConfirming}
        onConfirm={handleConfirmedAction}
        onCancel={closeConfirm}
      />

      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        productCount={selectedIds.length}
        onSubmit={handleBulkEditSubmit}
      />
    </div>
  );
};

export default ProductsPage;
