const PromotionBadge = ({ badges = [], promotions = [] }) => {
  // Sort by priority and combine: promotions first, then badges
  const sortedBadges = badges
    .filter(b => b.active)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const sortedPromotions = promotions
    .filter(p => p.isActive !== false)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const allLabels = [...sortedPromotions, ...sortedBadges];

  if (allLabels.length === 0) return null;

  return (
    <div className="space-y-2">
      {allLabels.map((label) => (
        <div
          key={label._id}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: label.backgroundColor || '#10B981',
            color: label.textColor || '#FFFFFF',
          }}
        >
          {label.icon && <span className="mr-1">{label.icon}</span>}
          {label.badgeText}
        </div>
      ))}
    </div>
  );
};

export default PromotionBadge;
