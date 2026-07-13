const EmptyState = ({ title, description, action, illustration }) => {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      {illustration && <div className="mb-6">{illustration}</div>}
      <h3 className="text-xl font-semibold text-charcoal">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-charcoal/60">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;