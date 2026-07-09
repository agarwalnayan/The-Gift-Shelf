const IMAGE_TYPES = ['image_upload', 'multi_image_upload'];

const isLikelyImageUrl = (value) =>
  typeof value === 'string' && /^https?:\/\//i.test(value) && /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(value);

const formatDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Renders a customization's stored value in a human-friendly way.
 * Handles the case where an Image Upload / Multi Image Upload customization
 * stores a Cloudinary URL (or array of URLs) - shown as thumbnails, not raw text.
 */
const CustomizationValue = ({ customization, thumbSize = 'h-12 w-12' }) => {
  const { type, value, label } = customization;

  const isImageType = IMAGE_TYPES.includes(type);

  if (isImageType || (Array.isArray(value) ? value.some(isLikelyImageUrl) : isLikelyImageUrl(value))) {
    const urls = Array.isArray(value) ? value : [value];
    return (
      <div className="mt-1.5 flex flex-wrap gap-2">
        {urls.filter(Boolean).map((url) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-lg border border-charcoal/10 transition-opacity hover:opacity-80"
            title={label}
          >
            <img src={url} alt={label} className={`${thumbSize} object-cover`} />
          </a>
        ))}
      </div>
    );
  }

  if (type === 'text_color') {
    return (
      <span className="mt-1 inline-flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded-full border border-charcoal/20" style={{ backgroundColor: value }} />
        <span>{value}</span>
      </span>
    );
  }

  if (type === 'date_input') {
    return <span>{formatDate(value)}</span>;
  }

  if (Array.isArray(value)) {
    return <span>{value.filter(Boolean).join(', ')}</span>;
  }

  return <span>{String(value)}</span>;
};

export default CustomizationValue;
