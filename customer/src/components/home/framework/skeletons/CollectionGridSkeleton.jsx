import { memo } from 'react';

/**
 * Collection Grid Skeleton Loading
 * Loading state for budget collection sections
 */
const CollectionGridSkeleton = memo(({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="aspect-video bg-gray-100 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
});

CollectionGridSkeleton.displayName = 'CollectionGridSkeleton';

export default CollectionGridSkeleton;
