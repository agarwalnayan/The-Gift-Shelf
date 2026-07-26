import { memo } from 'react';

/**
 * Hero Skeleton Loading
 * Loading state for hero slider/banner sections
 */
const HeroSkeleton = memo(() => {
  return (
    <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gray-100 animate-pulse">
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-gray-300 text-sm">Loading hero...</div>
      </div>
    </div>
  );
});

HeroSkeleton.displayName = 'HeroSkeleton';

export default HeroSkeleton;
