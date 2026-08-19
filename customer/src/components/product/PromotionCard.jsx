import { getPromotionTiers, getPDPTierStatuses, renderProductCardBenefit } from '../../utils/promotionRenderer.js';

const PromotionCard = ({ promotion, cartQuantity = 0 }) => {
  if (!promotion) return null;

  const tiers = getPromotionTiers(promotion);
  const tierStatuses = getPDPTierStatuses(promotion, cartQuantity);
  const benefitText = renderProductCardBenefit(promotion);

  if (!benefitText && (!tiers || tiers.length === 0)) return null;

  const isTiered = tiers && tiers.length > 0;

  return (
    <div className="rounded-xl border border-[#F0D8CC] bg-[#FFF8F4] p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#B85C38] text-white sm:h-10 sm:w-10">
          <span className="text-base sm:text-lg">🎁</span>
        </div>
        <div className="flex-1">
          {isTiered ? (
            <>
              <p className="text-sm font-semibold text-[#B85C38]">Save More</p>
              <p className="mt-1 text-xs text-charcoal/60">The more you add, the more you save</p>
              <div className="mt-3 space-y-2">
                {tierStatuses.map((tier, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      tier.isUnlocked
                        ? 'bg-[#B85C38]/10 border border-[#B85C38]/20'
                        : tier.isNext
                          ? 'bg-white border border-[#B85C38]/30 shadow-sm'
                          : 'bg-white/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tier.isUnlocked ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B85C38] text-white text-xs">✓</span>
                      ) : tier.isNext ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#B85C38] text-[10px] font-bold text-[#B85C38]">★</span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-charcoal/20 text-[10px] text-charcoal/40">{index + 1}</span>
                      )}
                      <span className={`font-medium ${tier.isUnlocked ? 'text-[#B85C38]' : 'text-charcoal/70'}`}>
                        {tier.label}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${tier.isNext ? 'text-[#B85C38]' : 'text-charcoal/60'}`}>
                      {tier.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-base font-semibold text-charcoal">{benefitText}</p>
          )}

          <div className="mt-3 flex items-center gap-1.5 text-xs text-charcoal/50">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Applied automatically at checkout
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;
