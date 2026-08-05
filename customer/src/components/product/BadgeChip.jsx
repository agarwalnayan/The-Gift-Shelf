const BadgeChip = ({ badge, compact = false }) => {
  if (!badge || !badge.active) return null;

  return (
    <div
      className={`absolute left-2 top-2 inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-medium shadow-lg backdrop-blur-md sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs ${
        compact ? 'left-1.5 top-1.5 px-1.5 py-0.5 text-[9px]' : ''
      }`}
      style={{
        backgroundColor: badge.backgroundColor || '#8B5E3C',
        color: badge.textColor || '#FFFFFF',
      }}
    >
      {badge.icon && <span className="mr-1">{badge.icon}</span>}
      {badge.badgeText}
    </div>
  );
};

export default BadgeChip;
