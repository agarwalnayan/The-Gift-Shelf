import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCalendar, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { getFestivalsApi, deleteFestivalApi } from '../api/festivalApi.js';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';

const FestivalPage = () => {
  const [festivals, setFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadFestivals();
  }, []);

  const loadFestivals = async () => {
    setIsLoading(true);
    try {
      const { data } = await getFestivalsApi();
      setFestivals(data.data.festivals);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load festivals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFestivalApi(confirmState.id);
      toast.success('Festival deleted successfully');
      setFestivals(festivals.filter((f) => f._id !== confirmState.id));
      setConfirmState({ isOpen: false, id: null, name: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete festival');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isActiveNow = (festival) => {
    const now = new Date();
    const start = new Date(festival.startDate);
    const end = new Date(festival.endDate);
    return festival.enabled && festival.isActive && start <= now && end >= now;
  };

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Festivals</h1>
          <p className="mt-1 text-sm text-ink/60">Manage seasonal festival configurations</p>
        </div>
        <Link to="/festivals/new" className="btn-primary inline-flex items-center gap-1.5">
          <HiOutlinePlus size={16} />
          Add Festival
        </Link>
      </div>

      <div className="card overflow-hidden">
        {festivals.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-ink/60">No festivals configured yet</p>
            <Link to="/festivals/new" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline">
              Create your first festival
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink/10 bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-ink/70">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-ink/70">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-ink/70">Date Range</th>
                  <th className="px-6 py-3 text-left font-medium text-ink/70">Countdown</th>
                  <th className="px-6 py-3 text-right font-medium text-ink/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {festivals.map((festival) => (
                  <tr key={festival._id} className="hover:bg-surface">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-ink">{festival.name}</p>
                        <p className="text-xs text-ink/50">{festival.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isActiveNow(festival) ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            <HiOutlineEye size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-ink/10 px-2 py-1 text-xs font-medium text-ink/60">
                            <HiOutlineEyeSlash size={12} />
                            {festival.enabled ? 'Scheduled' : 'Disabled'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-ink/70">
                        <HiOutlineCalendar size={14} />
                        <span>{formatDate(festival.startDate)} - {formatDate(festival.endDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {festival.countdownDate ? formatDate(festival.countdownDate) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/festivals/${festival._id}`}
                          className="rounded-lg p-2 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                          title="Edit"
                        >
                          <HiOutlinePencil size={18} />
                        </Link>
                        <button
                          onClick={() => setConfirmState({ isOpen: true, id: festival._id, name: festival.name })}
                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                          title="Delete"
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
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title="Delete Festival"
        message={`Are you sure you want to delete "${confirmState.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ isOpen: false, id: null, name: '' })}
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default FestivalPage;
