import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ['percentage', 'flat'],
            required: true,
        },
        value: {
            type: Number,
            required: true,
            min: 0,
        },
        minOrderValue: {
            type: Number,
            default: 0,
            min: 0,
        },
        maxDiscount: {
            type: Number,
            default: null,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

/** Computes the discount amount for a given cart subtotal, or throws-free 0 if invalid/ineligible. */
couponSchema.methods.computeDiscount = function (subtotal) {
    if (!this.isActive) return 0;
    if (this.expiresAt && this.expiresAt.getTime() < Date.now()) return 0;
    if (subtotal < this.minOrderValue) return 0;

    let discount = this.type === 'percentage' ? (subtotal * this.value) / 100 : this.value;
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
    discount = Math.min(discount, subtotal);

    return Number(discount.toFixed(2));
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;