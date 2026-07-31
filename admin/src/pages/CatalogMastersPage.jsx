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
import PageHeader from "../components/common/PageHeader.jsx";
import Button from "../components/common/Button.jsx";
import FormGrid from "../components/common/FormGrid.jsx";
import Input from "../components/common/Input.jsx";
import TableCard from "../components/common/TableCard.jsx";

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

    const masterColumns = [
        { header: "Image", width: "72px" },
        { header: "Name", width: "180px" },
        { header: "Type", width: "96px" },
        { header: "Homepage", width: "110px" },
        { header: "Homepage Order", width: "110px" },
        { header: "Display Order", width: "96px" },
        { header: "Active", width: "80px" },
        { header: "", width: "96px" },
    ];

    const renderMasterRow = (master) => [
        <td key="image">
            {master.image?.url ? (
                <img
                    src={master.image.url}
                    alt={master.name}
                    className="h-12 w-12 rounded-lg border object-cover"
                />
            ) : (
                <div className="h-12 w-12 rounded-lg border bg-gray-100" />
            )}
        </td>,

        <td key="name">
            <div className="min-w-0">
                <p className="font-medium truncate">
                    {master.name}
                </p>

                {master.description && (
                    <p className="text-xs text-ink/50 truncate">
                        {master.description}
                    </p>
                )}
            </div>
        </td>,

        <td key="type">
            <span className="capitalize">
                {master.type}
            </span>
        </td>,

        <td key="homepage">
            {master.showOnHomepage ? (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Yes
                </span>
            ) : (
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    No
                </span>
            )}
        </td>,

        <td key="homepageOrder">
            {master.showOnHomepage
                ? master.homepageDisplayOrder
                : "-"}
        </td>,

        <td key="displayOrder">
            {master.displayOrder}
        </td>,

        <td key="active">
            <Toggle
                checked={master.isActive}
                onChange={(value) =>
                    handleToggleStatus(
                        master._id,
                        value
                    )
                }
            />
        </td>,

        <td key="actions">
            <div className="flex items-center gap-2">
                <Link
                    to={`/catalog-masters/${master._id}/edit`}
                    className="p-1.5 text-ink/50 hover:text-primary-600 rounded hover:bg-primary-50"
                >
                    <HiOutlinePencilSquare size={18} />
                </Link>

                <button
                    onClick={() =>
                        askDelete(master._id)
                    }
                    className="p-1.5 text-ink/50 hover:text-red-600 rounded hover:bg-red-50"
                >
                    <HiOutlineTrash size={18} />
                </button>
            </div>
        </td>,
    ];

    const renderMasterCard = (master) => (
        <div className="space-y-4">

            {master.image?.url && (
                <img
                    src={master.image.url}
                    alt={master.name}
                    className="h-24 w-24 rounded-lg border object-cover"
                />
            )}

            <div>
                <p className="font-semibold text-ink">
                    {master.name}
                </p>

                {master.description && (
                    <p className="text-sm text-ink/60 mt-1">
                        {master.description}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">

                <div>
                    <span className="text-xs text-ink/50 uppercase">
                        Type
                    </span>

                    <p className="mt-1 capitalize">
                        {master.type}
                    </p>
                </div>

                <div>
                    <span className="text-xs text-ink/50 uppercase">
                        Homepage
                    </span>

                    <p className="mt-1">
                        {master.showOnHomepage
                            ? "Yes"
                            : "No"}
                    </p>
                </div>

                <div>
                    <span className="text-xs text-ink/50 uppercase">
                        Homepage Order
                    </span>

                    <p className="mt-1">
                        {master.showOnHomepage
                            ? master.homepageDisplayOrder
                            : "-"}
                    </p>
                </div>

                <div>
                    <span className="text-xs text-ink/50 uppercase">
                        Display Order
                    </span>

                    <p className="mt-1">
                        {master.displayOrder}
                    </p>
                </div>

            </div>

            <div className="flex items-center justify-between border-t pt-3">

                <Toggle
                    checked={master.isActive}
                    onChange={(value) =>
                        handleToggleStatus(
                            master._id,
                            value
                        )
                    }
                />

                <div className="flex gap-2">
                    <Link
                        to={`/catalog-masters/${master._id}/edit`}
                        className="p-2 text-ink/50 hover:text-primary-600 rounded hover:bg-primary-50"
                    >
                        <HiOutlinePencilSquare size={18} />
                    </Link>

                    <button
                        onClick={() =>
                            askDelete(master._id)
                        }
                        className="p-2 text-ink/50 hover:text-red-600 rounded hover:bg-red-50"
                    >
                        <HiOutlineTrash size={18} />
                    </button>
                </div>

            </div>

        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Catalog Masters"
                description="Manage tags, occasions, and recipients"
                actions={
                    <Link to="/catalog-masters/new">
                        <Button>
                            <HiOutlinePlus size={18} className="mr-1.5" />
                            Add Catalog Master
                        </Button>
                    </Link>
                }
            />

            <div className="card">
                <FormGrid columns={3}>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink/80">
                            Search
                        </label>
                        <Input
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
                </FormGrid>
            </div>

            {isLoading ? (
                <div className="card p-0">
                    <TableSkeleton rows={8} columns={8} />  
                </div>
            ) : masters.length === 0 ? (
                <EmptyState
                    title="No catalog masters found"
                    description="Create your first catalog master."
                />
            ) : (
                <>
                    <TableCard
                        columns={masterColumns}
                        data={masters}
                        keyExtractor={(master) => master._id}
                        renderRow={renderMasterRow}
                        renderCard={renderMasterCard}
                    />

                    <div className="card mt-4 p-4">
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