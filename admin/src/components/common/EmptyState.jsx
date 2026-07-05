const EmptyState = ({ title, description, action }) => {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-ink/60">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
