import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Toggle from '../common/Toggle.jsx';
import { updateCommerceSettingsApi } from '../../api/marketingApi.js';

const defaults = {
    freeShippingThreshold: 999,
    shippingCharge: 49,
    whatsappCharge: 50,
    whatsappNumber: '',
    checkoutMessage: '',
    paymentOptions: { razorpay: true, whatsapp: true },
    returnPolicy: '',
    replacementPolicy: '',
};

// Single save-in-place form for the checkout/commerce settings singleton —
// same pattern as the Announcement Bar / Welcome Popup blocks above it.
const StoreCheckoutSettingsForm = ({ settings, onSaved }) => {
    const [isSaving, setIsSaving] = useState(false);
    const form = useForm({ defaultValues: defaults });

    useEffect(() => {
        if (settings?.commerce) form.reset({ ...defaults, ...settings.commerce });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings]);

    const submit = async (values) => {
        setIsSaving(true);
        try {
            const { data } = await updateCommerceSettingsApi({
                ...values,
                freeShippingThreshold: Number(values.freeShippingThreshold),
                shippingCharge: Number(values.shippingCharge),
                whatsappCharge: Number(values.whatsappCharge),
            });
            toast.success('Checkout settings updated');
            onSaved?.({ ...settings, commerce: data.data.commerce });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update checkout settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(submit)} className="card space-y-5 p-5">
            <h3 className="text-base font-semibold text-ink">Shipping &amp; Charges</h3>
            <div className="grid gap-4 sm:grid-cols-3">
                <Input
                    label="Free Shipping Threshold (₹)"
                    type="number"
                    min={0}
                    {...form.register('freeShippingThreshold', { min: 0 })}
                />
                <Input label="Shipping Charge (₹)" type="number" min={0} {...form.register('shippingCharge', { min: 0 })} />
                <Input
                    label="WhatsApp Order Charge (₹)"
                    type="number"
                    min={0}
                    {...form.register('whatsappCharge', { min: 0 })}
                />
            </div>

            <h3 className="border-t border-ink/10 pt-5 text-base font-semibold text-ink">Payment Options</h3>
            <div className="flex flex-wrap gap-6">
                <Toggle
                    label="Razorpay"
                    checked={form.watch('paymentOptions.razorpay')}
                    onChange={(value) => form.setValue('paymentOptions.razorpay', value)}
                />
                <Toggle
                    label="WhatsApp Order"
                    checked={form.watch('paymentOptions.whatsapp')}
                    onChange={(value) => form.setValue('paymentOptions.whatsapp', value)}
                />
            </div>
            <Input
                label="WhatsApp Business Number (with country code, digits only)"
                placeholder="919876543210"
                {...form.register('whatsappNumber')}
            />

            <h3 className="border-t border-ink/10 pt-5 text-base font-semibold text-ink">Checkout Message</h3>
            <Input
                label="Banner shown on checkout (optional)"
                maxLength={240}
                placeholder="Free gift wrapping on every order!"
                {...form.register('checkoutMessage', { maxLength: 240 })}
            />

            <h3 className="border-t border-ink/10 pt-5 text-base font-semibold text-ink">Policies</h3>
            <div>
                <label className="mb-1.5 block text-sm font-medium text-ink/80">Return Policy</label>
                <textarea rows={4} className="input-field" {...form.register('returnPolicy')} />
            </div>
            <div>
                <label className="mb-1.5 block text-sm font-medium text-ink/80">Replacement Policy</label>
                <textarea rows={4} className="input-field" {...form.register('replacementPolicy')} />
            </div>

            <div className="flex justify-end border-t border-ink/10 pt-4">
                <Button type="submit" isLoading={isSaving}>
                    Save Checkout Settings
                </Button>
            </div>
        </form>
    );
};

export default StoreCheckoutSettingsForm;