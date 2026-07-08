import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import {
  getProductsApi,
  updateProductStatusApi,
  updateProductPublishStatusApi,
  updateProductFeatureApi,
  bulkProductActionApi,
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
import ProductFilters from '../components/product/ProductFilters.jsx';
import ProductBulkActionsBar from '../components/product/ProductBulkActionsBar.jsx';

const initialFilters = {
  search: '',
  category: '',
  isActive: '',
  isFeatured: '',
  publishStatus: '',
  sort: 'newest',
  includeDeleted: false,
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [confirmState, setConfirmState] = useState({ isOpen: false, action: null, productId: null });
  const [isConfirming, setIsConfirming] = useState(false);

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
    try {
      await bulkProductActionApi(selectedIds, action);
      toast.success('Bulk action applied');
      setSelectedIds([]);
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk action failed');
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Products</h1>
      </div>

      <div className="mb-6">
        <ProductFilters filters={filters} onFilterChange={handleFilterChange} categories={categories} />
      </div>

      <ProductBulkActionsBar count={selectedIds.length} onAction={handleBulkAction} onClear={() => setSelectedIds([])} />

      {isLoading ? (
        <div className="card p-0">
          <TableSkeleton rows={6} columns={8} />
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No products found" description="Try adjusting your filters, or add your first product." />
      ) : (
        <>
          <div className="card overflow-x-auto p-0">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Active</th>
                  <th>Published</th>
                  <th>Featured</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className={product.isDeleted ? 'opacity-50' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        disabled={product.isDeleted}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.primaryImage?.url || product.images?.[0]?.url}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <span className="font-medium">{product.name}</span>
                          <p className="text-xs text-ink/40">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td>{product.category?.name}</td>
                    <td>₹{product.discountPrice > 0 ? product.discountPrice : product.price}</td>
                    <td>
                      {product.stock}
                      {product.stockStatus === 'low_stock' && (
                        <span className="ml-1.5 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                          Low
                        </span>
                      )}
                      {product.stockStatus === 'out_of_stock' && (
                        <span className="ml-1.5 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                          Out
                        </span>
                      )}
                    </td>
                    <td>
                      <Toggle
                        checked={product.isActive}
                        disabled={product.isDeleted}
                        onChange={(v) => handleToggleActive(product._id, v)}
                      />
                    </td>
                    <td>
                      <Toggle
                        checked={product.publishStatus === 'published'}
                        disabled={product.isDeleted}
                        onChange={(v) => handleTogglePublish(product._id, v)}
                      />
                    </td>
                    <td>
                      <Toggle
                        checked={product.isFeatured}
                        disabled={product.isDeleted}
                        onChange={(v) => handleToggleFeatured(product._id, v)}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        {product.isDeleted ? (
                          <button onClick={() => handleRestore(product._id)} className="text-ink/50 hover:text-green-600" title="Restore">
                            <HiOutlineArrowUturnLeft size={18} />
                          </button>
                        ) : (
                          <Link to={`/products/${product._id}/edit`} className="text-ink/50 hover:text-primary-600" title="Edit">
                            <HiOutlinePencilSquare size={18} />
                          </Link>
                        )}

                        {product.isDeleted ? (
                          <button
                            onClick={() => askConfirm('permanent', product._id)}
                            className="text-ink/50 hover:text-red-600"
                            title="Delete permanently"
                          >
                            <HiOutlineXCircle size={18} />
                          </button>
                        ) : (
                          <button onClick={() => askConfirm('delete', product._id)} className="text-ink/50 hover:text-red-600" title="Delete">
                            <HiOutlineTrash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card mt-4 p-0">
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
    </div>
  );
};

export default ProductsPage;
