import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlinePlus,
} from "react-icons/hi2";

import {
  getBadgesApi,
  updateBadgeStatusApi,
  deleteBadgeApi,
} from "../api/badgeApi";

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
  active: "",
};

const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState(baseFilters);

  const [isLoading, setIsLoading] = useState(true);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    id: null,
  });

  const [isConfirming, setIsConfirming] = useState(false);

  const loadBadges = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = {
        page,
        limit: 20,
      };

      if (filters.search) params.search = filters.search;
      if (filters.active !== "") params.active = filters.active;

      const { data } = await getBadgesApi(params);

      setBadges(data.data.badges || []);
      setTotalPages(Math.ceil((data.data.badges?.length || 0) / 20) || 1);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to load badges"
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    const debounce = setTimeout(
      loadBadges,
      filters.search ? 350 : 0
    );

    return () => clearTimeout(debounce);
  }, [loadBadges]);

  const handleFilterChange = (patch) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const handleToggleStatus = async (id, value) => {
    try {
      await updateBadgeStatusApi(id, { active: value });

      setBadges((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                active: value,
              }
            : item
        )
      );

      toast.success("Badge status updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to update badge status"
      );
    }
  };

  const handleDelete = async () => {
    setIsConfirming(true);

    try {
      await deleteBadgeApi(confirmState.id);

      setBadges((prev) =>
        prev.filter((item) => item._id !== confirmState.id)
      );

      toast.success("Badge deleted successfully");
      setConfirmState({ isOpen: false, id: null });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to delete badge"
      );
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Badges"
        description="Manage visual merchandising labels for products"
        action={
          <Button to="/badges/create" variant="primary">
            <HiOutlinePlus className="mr-2 h-5 w-5" />
            Add Badge
          </Button>
        }
      />

      <TableCard>
        <FormGrid columns={3}>
          <Input
            placeholder="Search badges..."
            value={filters.search}
            onChange={(e) =>
              handleFilterChange({ search: e.target.value })
            }
          />
          <select
            value={filters.active}
            onChange={(e) =>
              handleFilterChange({ active: e.target.value })
            }
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <div />
        </FormGrid>

        {isLoading ? (
          <TableSkeleton columns={5} rows={5} />
        ) : badges.length === 0 ? (
          <EmptyState
            title="No badges found"
            description="Get started by creating your first badge"
            action={
              <Button to="/badges/create" variant="primary">
                <HiOutlinePlus className="mr-2 h-5 w-5" />
                Add Badge
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                    Badge Text
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                    Colors
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-ink/70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {badges.map((badge) => (
                  <tr
                    key={badge._id}
                    className="border-b border-border hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3">
                      <div
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: badge.backgroundColor,
                          color: badge.textColor,
                        }}
                      >
                        {badge.badgeText}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-ink">
                      {badge.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink/70">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: badge.backgroundColor }}
                        />
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: badge.textColor }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink/70">
                      {badge.priority}
                    </td>
                    <td className="px-4 py-3">
                      <Toggle
                        checked={badge.active}
                        onChange={(value) =>
                          handleToggleStatus(badge._id, value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/badges/${badge._id}/edit`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <HiOutlinePencilSquare className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() =>
                            setConfirmState({
                              isOpen: true,
                              id: badge._id,
                            })
                          }
                          className="text-red-600 hover:text-red-700"
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
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </TableCard>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title="Delete Badge"
        description="Are you sure you want to delete this badge? This action cannot be undone."
        isConfirming={isConfirming}
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default BadgesPage;
