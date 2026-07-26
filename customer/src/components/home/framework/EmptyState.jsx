import { memo } from 'react';

/**
 * Empty State Component
 * Reusable component for sections with no content
 */
const EmptyState = memo(({ 
  message = 'No content available',
  icon: Icon = null,
  actionText = null,
  onAction = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 text-gray-300">
          <Icon size={48} />
        </div>
      )}
      <p className="text-gray-500 text-sm">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 text-sm font-medium text-primary-600 hover:underline"
        >
          {actionText}
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
