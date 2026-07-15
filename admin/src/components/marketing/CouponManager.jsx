import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Toggle from '../common/Toggle.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import { getCouponsApi, createCouponApi, updateCouponApi, deleteCouponApi } from '../../api/couponApi.js';

const emptyForm = { code: '', type: 'percentage', value: '', minOrderValue: '', maxDiscount: '', expiresAt: '' };

/**
 * Minimal coupon administration UI backing the storefront's Coupon
 * Apply/Remove flow. No prior coupon architecture existed, so this
 * mirrors the simple list + inline form pattern used elsewhere in
 * Marketing without introducing a new modal component.
 */
const CouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [filteredCoupons, setFilteredCoupons] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadCoupons = async () => {
        setIsLoading(true);
        try {
            const { data } = await getCouponsApi();
            setCoupons(data.data.coupons);
            setFilteredCoupons(data.data.coupons);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load coupons');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCoupons(coupons);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredCoupons(
                coupons.filter(
                    (coupon) =>
                        coupon.code?.toLowerCase().includes(query) ||
                        coupon.type?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, coupons]);

    const handleCreate = async (event) => {
        event.preventDefault();
        if (!form.code.trim() || !form.value) {
            toast.error('Coupon code and value are required');
            return;
        }
        setIsSubmitting(true);
        try {
            await createCouponApi({
                code: form.code.trim(),
                type: form.type,
                value: Number(form.value),
                minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
                maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
                expiresAt: form.expiresAt || null,
            });
            toast.success('Coupon created');
            setForm(emptyForm);
            loadCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create coupon');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (coupon) => {
        try {
            await updateCouponApi(coupon._id, { isActive: !coupon.isActive });
            setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c)));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update coupon');
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteCouponApi(confirmId);
            toast.success('Coupon deleted');
            setConfirmId(null);
            loadCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete coupon');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleCreate} className="card space-y-4 p-5">
                <h3 className="text-base font-semibold text-ink">Add Coupon</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                        label="Code"
                        placeholder="WELCOME10"
                        value={form.code}
                        onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    />
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink/80">Type</label>
                        <select
                            className="input-field"
                            value={form.type}
                            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="flat">Flat (₹)</option>
                        </select>
                    </div>
                    <Input
                        label="Value"
                        type="number"
                        min={0}
                        value={form.value}
                        onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    />
                    <Input
                        label="Min Order Value (optional)"
                        type="number"
                        min={0}
                        value={form.minOrderValue}
                        onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                    />
                    <Input
                        label="Max Discount Cap (optional)"
                        type="number"
                        min={0}
                        value={form.maxDiscount}
                        onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                    />
                    <Input
                        label="Expires On (optional)"
                        type="date"
                        value={form.expiresAt}
                        onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    />
                </div>
                <div className="flex justify-end border-t border-ink/10 pt-4">
                    <Button type="submit" isLoading={isSubmitting}>
                        Create Coupon
                    </Button>
                </div>
            </form>

            {coupons.length > 0 && (
                <div className="card p-5">
                    <h3 className="text-base font-semibold text-ink mb-4">Coupon Analytics</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-surface p-4">
                            <p className="text-sm text-ink/60">Total Coupons</p>
                            <p className="text-2xl font-semibold text-ink">{coupons.length}</p>
                        </div>
                        <div className="rounded-lg bg-surface p-4">
                            <p className="text-sm text-ink/60">Active Coupons</p>
                            <p className="text-2xl font-semibold text-green-600">{coupons.filter(c => c.isActive).length}</p>
                        </div>
                        <div className="rounded-lg bg-surface p-4">
                            <p className="text-sm text-ink/60">Expired Coupons</p>
                            <p className="text-2xl font-semibold text-amber-600">
                                {coupons.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date()).length}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="card p-0">
                <div className="border-b border-ink/10 p-4">
                    <div className="relative">
                        <HiOutlineMagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                        <input
                            type="text"
                            placeholder="Search by code or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-ink/20 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none"
                        />
                    </div>
                </div>
                {isLoading ? (
                    <p className="p-5 text-sm text-ink/50">Loading coupons…</p>
                ) : filteredCoupons.length === 0 ? (
                    <p className="p-5 text-sm text-ink/50">{searchQuery ? 'No coupons found' : 'No coupons created yet.'}</p>
                ) : (
                    <div className="divide-y divide-ink/5">
                        {filteredCoupons.map((coupon) => (
                            <div key={coupon._id} className="flex items-center justify-between gap-4 p-4">
                                <div className="flex-1">
                                    <p className="font-semibold text-ink">{coupon.code}</p>
                                    <p className="text-xs text-ink/50">
                                        {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                                        {coupon.minOrderValue > 0 && ` · Min ₹${coupon.minOrderValue}`}
                                        {coupon.maxDiscount && ` · Max ₹${coupon.maxDiscount}`}
                                        {coupon.expiresAt && ` · Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                                    </p>
                                    <div className="mt-2 flex items-center gap-4 text-xs text-ink/60">
                                        <span>Uses: {coupon.usageCount || 0}</span>
                                        {coupon.totalDiscountGiven !== undefined && (
                                            <span>Total Discount: ₹{coupon.totalDiscountGiven.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Toggle checked={coupon.isActive} onChange={() => handleToggleActive(coupon)} label="Active" />
                                    <button
                                        onClick={() => setConfirmId(coupon._id)}
                                        className="text-ink/40 transition-colors hover:text-red-600"
                                        aria-label="Delete coupon"
                                    >
                                        <HiOutlineTrash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={Boolean(confirmId)}
                title="Delete this coupon?"
                description="Customers will no longer be able to apply this code."
                confirmLabel="Delete"
                isLoading={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setConfirmId(null)}
            />
        </div>
    );
};

export default CouponManager;