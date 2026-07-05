import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getCategoriesApi,
  getCategoryTreeApi,
  createCategoryApi,
  updateCategoryApi,
  updateCategoryStatusApi,
  updateCategoryFeatureApi,
  reorderCategoriesApi,
  softDeleteCategoryApi,
  restoreCategoryApi,
  permanentlyDeleteCategoryApi,
} from '../api/categoryApi.js';
import CategoryFilters from '../components/category/CategoryFilters.jsx';
import CategoryTable from '../components/category/CategoryTable.jsx';
import CategoryGridCard from '../components/category/CategoryGridCard.jsx';
import CategoryFormModal from '../components/category/CategoryFormModal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import Pagination from '../components/common/Pagination.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { TableSkeleton, GridSkeleton } from '../components/common/Skeleton.jsx';

const initialFilters = {
  search: '',
  isActive: '',
  isFeatured: '',
  sort: 'displayOrder',
  includeDeleted: false,
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [treeCategories, setTreeCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [view, setView] = useState('table');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmState, setConfirmState] = useState({ isOpen: false, action: null, categoryId: null });
  const [isConfirming, setIsConfirming] = useState(false);

  const loadTree = useCallback(async () => {
    try {
      const { data } = await getCategoryTreeApi();
      setTreeCategories(data.data.tree);
    } catch (error) {
      // parent selector will just show top-level only if this fails
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: filters.sort,
      };
      if (filters.search) params.search = filters.search;
      if (filters.isActive) params.isActive = filters.isActive;
      if (filters.isFeatured) params.isFeatured = filters.isFeatured;
      if (filters.includeDeleted) params.includeDeleted = 'true';

      const { data } = await getCategoriesApi(params);
      setCategories(data.data.categories);
      setTotalPages(data.data.totalPages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  useEffect(() => {
    const debounce = setTimeout(loadCategories, filters.search ? 350 : 0);
    return () => clearTimeout(debounce);
  }, [loadCategories]);

  const handleFilterChange = (patch) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const refreshAll = () => {
    loadCategories();
    loadTree();
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategoryApi(editingCategory._id, formData);
        toast.success('Category updated successfully');
      } else {
        await createCategoryApi(formData);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      refreshAll();
    } catch (error) {
      const messages = error.response?.data?.errors;
      toast.error(messages?.[0] || error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id, value) => {
    try {
      await updateCategoryStatusApi(id, value);
      setCategories((prev) => prev.map((cat) => (cat._id === id ? { ...cat, isActive: value } : cat)));
      toast.success('Status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleToggleFeatured = async (id, value) => {
    try {
      await updateCategoryFeatureApi(id, { isFeatured: value });
      setCategories((prev) => prev.map((cat) => (cat._id === id ? { ...cat, isFeatured: value } : cat)));
      toast.success('Featured setting updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update featured setting');
    }
  };

  const handleReorder = async (items) => {
    const previous = categories;
    const reordered = items.map((item) => categories.find((cat) => cat._id === item.id));
    setCategories(reordered);

    try {
      await reorderCategoriesApi(items);
      toast.success('Order updated');
    } catch (error) {
      setCategories(previous);
      toast.error(error.response?.data?.message || 'Failed to reorder categories');
    }
  };

  const askConfirm = (action, categoryId) => setConfirmState({ isOpen: true, action, categoryId });
  const closeConfirm = () => setConfirmState({ isOpen: false, action: null, categoryId: null });

  const handleConfirmedAction = async () => {
    const { action, categoryId } = confirmState;
    setIsConfirming(true);
    try {
      if (action === 'delete') {
        await softDeleteCategoryApi(categoryId);
        toast.success('Category moved to trash');
      } else if (action === 'permanent') {
        await permanentlyDeleteCategoryApi(categoryId);
        toast.success('Category permanently deleted');
      }
      closeConfirm();
      refreshAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreCategoryApi(id);
      toast.success('Category restored');
      refreshAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore category');
    }
  };

  const canReorder = filters.sort === 'displayOrder' && !filters.search;

  const confirmCopy = {
    delete: {
      title: 'Move category to trash?',
      description: 'The category will be hidden from the storefront and can be restored later.',
      confirmLabel: 'Move to Trash',
    },
    permanent: {
      title: 'Permanently delete this category?',
      description: 'This cannot be undone. Its images will also be removed from storage.',
      confirmLabel: 'Delete Permanently',
    },
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Categories</h1>
      </div>

      <div className="mb-6">
        <CategoryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          view={view}
          onViewChange={setView}
          onAddClick={openAddModal}
        />
      </div>

      {isLoading ? (
        view === 'table' ? (
          <div className="card p-0">
            <TableSkeleton rows={6} columns={7} />
          </div>
        ) : (
          <GridSkeleton items={8} />
        )
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Try adjusting your filters, or add your first category to get started."
        />
      ) : view === 'table' ? (
        <>
          <CategoryTable
            categories={categories}
            canReorder={canReorder}
            onReorder={handleReorder}
            onToggleActive={handleToggleActive}
            onToggleFeatured={handleToggleFeatured}
            onEdit={openEditModal}
            onDelete={(id) => askConfirm('delete', id)}
            onRestore={handleRestore}
            onPermanentDelete={(id) => askConfirm('permanent', id)}
          />
          <div className="card mt-4 p-0">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryGridCard
                key={category._id}
                category={category}
                onToggleActive={handleToggleActive}
                onToggleFeatured={handleToggleFeatured}
                onEdit={openEditModal}
                onDelete={(id) => askConfirm('delete', id)}
                onRestore={handleRestore}
                onPermanentDelete={(id) => askConfirm('permanent', id)}
              />
            ))}
          </div>
          <div className="card mt-4 p-0">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        treeCategories={treeCategories}
        isSubmitting={isSubmitting}
      />

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

export default CategoriesPage;
