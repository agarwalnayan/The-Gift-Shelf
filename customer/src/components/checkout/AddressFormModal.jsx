import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { addAddressApi, updateAddressApi } from '../../api/authApi.js';

const emptyAddress = {
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
};

const AddressFormModal = ({ isOpen, address, onClose, onSaved }) => {
    const [form, setForm] = useState(emptyAddress);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) setForm(address ? { ...emptyAddress, ...address } : emptyAddress);
    }, [isOpen, address]);

    if (!isOpen) return null;

    const handleChange = (field) => (event) => {
        const value = field === 'isDefault' ? event.target.checked : event.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        try {
            const { data } = address
                ? await updateAddressApi(address._id, form)
                : await addAddressApi(form);
            toast.success(address ? 'Address updated' : 'Address added');
            onSaved(data.data.addresses);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-charcoal/40 p-0 sm:items-center sm:p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-cream p-6 sm:rounded-2xl">
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-charcoal">
                        {address ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button onClick={onClose} className="text-charcoal/50 hover:text-charcoal" aria-label="Close">
                        <HiXMark size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Label" value={form.label} onChange={handleChange('label')} placeholder="Home / Work" />
                        <Input label="Full Name" value={form.fullName} onChange={handleChange('fullName')} required />
                    </div>
                    <Input label="Phone" value={form.phone} onChange={handleChange('phone')} required />
                    <Input label="Address Line 1" value={form.line1} onChange={handleChange('line1')} required />
                    <Input label="Address Line 2 (optional)" value={form.line2} onChange={handleChange('line2')} />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Input label="City" value={form.city} onChange={handleChange('city')} required />
                        <Input label="State" value={form.state} onChange={handleChange('state')} required />
                        <Input label="Postal Code" value={form.postalCode} onChange={handleChange('postalCode')} required />
                    </div>
                    <Input label="Country" value={form.country} onChange={handleChange('country')} required />

                    <label className="flex items-center gap-2 text-sm text-charcoal/70">
                        <input type="checkbox" checked={form.isDefault} onChange={handleChange('isDefault')} />
                        Set as default address
                    </label>

                    <div className="flex justify-end gap-3 border-t border-charcoal/10 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSaving}>
                            Save Address
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressFormModal;