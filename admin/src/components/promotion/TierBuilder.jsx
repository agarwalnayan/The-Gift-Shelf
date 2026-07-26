import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';

const TierBuilder = ({ tiers, onChange }) => {
  const addTier = () => {
    onChange([
      ...tiers,
      {
        minQuantity: tiers.length > 0 ? tiers[tiers.length - 1].minQuantity + 1 : 2,
        discountType: 'percentage',
        discountValue: 10,
      },
    ]);
  };

  const updateTier = (index, field, value) => {
    const updatedTiers = [...tiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    onChange(updatedTiers);
  };

  const removeTier = (index) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {tiers.map((tier, index) => (
        <div key={`${tier.minQuantity}-${tier.discountType}-${tier.discountValue}`} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Quantity
              </label>
              <input
                type="number"
                min="1"
                value={tier.minQuantity}
                onChange={(e) => updateTier(index, 'minQuantity', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <select
                value={tier.discountType}
                onChange={(e) => updateTier(index, 'discountType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="flat">Flat Amount (₹)</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_price">Fixed Price (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tier.discountType === 'percentage' ? 'Discount (%)' : tier.discountType === 'fixed_price' ? 'Bundle Price (₹)' : 'Discount Amount (₹)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tier.discountValue}
                onChange={(e) => updateTier(index, 'discountValue', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeTier(index)}
            className="mt-6 text-red-600 hover:text-red-800 p-1"
            title="Remove tier"
          >
            <HiOutlineTrash className="h-5 w-5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addTier}
        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800"
      >
        <HiOutlinePlus className="h-4 w-4" />
        Add Tier
      </button>
    </div>
  );
};

export default TierBuilder;
