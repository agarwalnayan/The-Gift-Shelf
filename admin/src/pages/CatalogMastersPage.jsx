import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlinePlus,
} from "react-icons/hi2";

import {
    getCatalogMastersApi,
    updateCatalogMasterStatusApi,
    deleteCatalogMasterApi,
} from "../api/catalogMasterApi";

import Toggle from "../components/common/Toggle";
import Pagination from "../components/common/Pagination";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import { TableSkeleton } from "../components/common/Skeleton";

const baseFilters = {
    search: "",
    type: "",
    isActive: "",
};

const CatalogMastersPage = () => {
    const [masters, setMasters] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [filters, setFilters] = useState(baseFilters);

    const [isLoading, setIsLoading] = useState(true);

    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        id: null,
    });

    const [isConfirming, setIsConfirming] = useState(false);

    const loadMasters = useCallback(async () => {
        setIsLoading(true);

        try {
            const params = {
                page,
                limit: 20,
            };

            if (filters.search) params.search = filters.search;
            if (filters.type) params.type = filters.type;
            if (filters.isActive !== "") params.isActive = filters.isActive;

            const { data } = await getCatalogMastersApi(params);

            setMasters(data.data.masters);
            setTotalPages(data.data.totalPages || 1);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load catalog masters"
            );
        } finally {
            setIsLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        const debounce = setTimeout(
            loadMasters,
            filters.search ? 350 : 0
        );

        return () => clearTimeout(debounce);
    }, [loadMasters]);

    const handleFilterChange = (patch) => {
        setPage(1);
        setFilters((prev) => ({
            ...prev,
            ...patch,
        }));
    };

    const handleToggleStatus = async (id, value) => {
        try {
            await updateCatalogMasterStatusApi(id, value);

            setMasters((prev) =>
                prev.map((item) =>
                    item._id === id
                        ? {
                            ...item,
                            isActive: value,
                        }
                        : item
                )
            );

            toast.success("Status updated");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to update status"
            );
        }
    };

    const askDelete = (id) =>
        setConfirmState({
            isOpen: true,
            id,
        });

    const closeConfirm = () =>
        setConfirmState({
            isOpen: false,
            id: null,
        });

    const handleDelete = async () => {
        setIsConfirming(true);

        try {
            await deleteCatalogMasterApi(confirmState.id);

            toast.success("Catalog master deleted");

            closeConfirm();

            loadMasters();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Delete failed"
            );
        } finally {
            setIsConfirming(false);
        }
    };
    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-ink">
                    Catalog Masters
                </h1>

                <Link
                    to="/catalog-masters/new"
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <HiOutlinePlus size={18} />
                    Add Catalog Master
                </Link>
            </div>

            <div className="card mb-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink/80">
                            Search
                        </label>

                        <input
                            className="input-field"
                            placeholder="Search..."
                            value={filters.search}
                            onChange={(e) =>
                                handleFilterChange({
                                    search: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink/80">
                            Type
                        </label>

                        <select
                            className="input-field"
                            value={filters.type}
                            onChange={(e) =>
                                handleFilterChange({
                                    type: e.target.value,
                                })
                            }
                        >
                            <option value="">All</option>
                            <option value="tag">Tags</option>
                            <option value="occasion">Occasions</option>
                            <option value="recipient">Recipients</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink/80">
                            Status
                        </label>

                        <select
                            className="input-field"
                            value={filters.isActive}
                            onChange={(e) =>
                                handleFilterChange({
                                    isActive: e.target.value,
                                })
                            }
                        >
                            <option value="">All</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="card p-0">
                    <TableSkeleton rows={8} columns={6} />
                </div>
            ) : masters.length === 0 ? (
                <EmptyState
                    title="No catalog masters found"
                    description="Create your first catalog master."
                />
            ) : (
                <>
                    <div className="card overflow-x-auto p-0">
                        <table className="table-base">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Slug</th>
                                    <th>Display Order</th>
                                    <th>Active</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {masters.map((master) => (
                                    <tr key={master._id}>
                                        <td>
                                            <div>
                                                <p className="font-medium">
                                                    {master.name}
                                                </p>

                                                {master.description && (
                                                    <p className="text-xs text-ink/50">
                                                        {master.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <span className="capitalize">
                                                {master.type}
                                            </span>
                                        </td>

                                        <td>{master.slug}</td>

                                        <td>{master.displayOrder}</td>

                                        <td>
                                            <Toggle
                                                checked={master.isActive}
                                                onChange={(value) =>
                                                    handleToggleStatus(
                                                        master._id,
                                                        value
                                                    )
                                                }
                                            />
                                        </td>

                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    to={`/catalog-masters/${master._id}/edit`}
                                                    className="text-ink/50 hover:text-primary-600"
                                                >
                                                    <HiOutlinePencilSquare
                                                        size={18}
                                                    />
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        askDelete(master._id)
                                                    }
                                                    className="text-ink/50 hover:text-red-600"
                                                >
                                                    <HiOutlineTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="card mt-4 p-0">
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </>
            )}

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                title="Delete Catalog Master?"
                description="This action cannot be undone."
                confirmLabel="Delete"
                isLoading={isConfirming}
                onConfirm={handleDelete}
                onCancel={closeConfirm}
            />
        </div>
    );
};

export default CatalogMastersPage;