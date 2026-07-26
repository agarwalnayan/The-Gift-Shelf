import { memo } from 'react';

/**
 * Category Grid Skeleton Loading
 * Loading state for category grid sections
 */
const CategoryGridSkeleton = memo(({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
});

CategoryGridSkeleton.displayName = 'CategoryGridSkeleton';

export default CategoryGridSkeleton;
