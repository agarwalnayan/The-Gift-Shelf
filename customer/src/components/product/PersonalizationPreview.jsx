import { useMemo } from 'react';

const PersonalizationPreview = ({ customizationOptions, customizationValues, productImage, productName }) => {
  const activeOptions = useMemo(() => {
    return customizationOptions
      .filter((option) => option.isEnabled && option.displayOrder > 0)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [customizationOptions]);

  const hasActiveValues = activeOptions.some((option) => {
    const value = customizationValues[option.key];
    return value !== undefined && value !== null && value !== '';
  });

  if (!hasActiveValues) {
    return (
      <div className="rounded-2xl border border-dashed border-charcoal/15 bg-surface/40 p-6 text-center">
        <p className="text-sm font-medium text-charcoal/60">Your personalization preview will appear here</p>
        <p className="mt-1 text-xs text-charcoal/40">Start filling in the options above to see how your gift will look</p>
      </div>
    );
  }

  const renderValue = (option, value) => {
    if (option.type === 'image_upload' || option.type === 'multi_image_upload') {
      const urls = Array.isArray(value) ? value : [value];
      const validUrls = urls.filter(Boolean);
      if (validUrls.length === 0) return null;
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {validUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`${option.label} preview ${idx + 1}`}
              className="h-16 w-16 rounded-lg border border-charcoal/10 object-cover"
            />
          ))}
        </div>
      );
    }

    if (option.type === 'text_color') {
      return (
        <div className="mt-2 flex items-center gap-2">
          <span className="h-5 w-5 rounded-full border border-charcoal/20" style={{ backgroundColor: value }} />
          <span className="text-xs text-charcoal/70">{value}</span>
        </div>
      );
    }

    if (option.type === 'date_input') {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return <p className="mt-1 text-sm text-charcoal/80">{value}</p>;
      return <p className="mt-1 text-sm text-charcoal/80">{parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>;
    }

    if (Array.isArray(value)) {
      const display = value.filter(Boolean).join(', ');
      if (!display) return null;
      return <p className="mt-1 text-sm text-charcoal/80">{display}</p>;
    }

    if (typeof value === 'string' && value.trim()) {
      return <p className="mt-1 text-sm text-charcoal/80">{value}</p>;
    }

    return null;
  };

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        {productImage?.url && (
          <img
            src={productImage.url}
            alt={productName}
            className="h-12 w-12 rounded-lg object-cover border border-charcoal/10"
          />
        )}
        <div>
          <p className="text-sm font-semibold text-charcoal">Preview</p>
          <p className="text-xs text-charcoal/50">How your personalized gift will look</p>
        </div>
      </div>

      <div className="space-y-4">
        {activeOptions.map((option) => {
          const value = customizationValues[option.key];
          if (!value && value !== false && value !== 0) return null;

          return (
            <div key={option.key} className="border-b border-charcoal/5 pb-3 last:border-0 last:pb-0">
              <p className="text-xs font-medium uppercase tracking-wide text-charcoal/50">{option.label}</p>
              {renderValue(option, value)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalizationPreview;
