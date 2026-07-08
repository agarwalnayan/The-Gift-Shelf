import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineStar, HiOutlineTrash, HiOutlineBars3 } from 'react-icons/hi2';
import Button from '../common/Button.jsx';
import { updateProductImagesApi } from '../../api/productApi.js';

const ImageTile = ({ image, isPrimary, onSetPrimary, onRemove, draggable, onDragStart, onDragOver, onDrop }) => (
  <div
    draggable={draggable}
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    className="group relative aspect-square overflow-hidden rounded-lg border border-ink/10 bg-surface"
  >
    <img src={image.url} alt="" className="h-full w-full object-cover" />
    {draggable && (
      <span className="absolute left-1.5 top-1.5 rounded bg-ink/40 p-1 text-white opacity-0 group-hover:opacity-100">
        <HiOutlineBars3 size={14} />
      </span>
    )}
    {isPrimary && (
      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-semibold text-white">
        Primary
      </span>
    )}
    <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        onClick={onSetPrimary}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink/70 hover:text-primary-600"
        title="Set as primary"
      >
        <HiOutlineStar size={13} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink/70 hover:text-red-600"
        title="Remove"
      >
        <HiOutlineTrash size={13} />
      </button>
    </div>
  </div>
);

// Used on the "Add Product" form: images aren't uploaded yet, just staged as
// File objects. Order in the array determines display order; the first file
// is treated as primary by the backend once the product is created.
export const NewProductImagesPicker = ({ files, onFilesChange }) => {
  const [dragIndex, setDragIndex] = useState(null);

  const handleFileInput = (e) => {
    onFilesChange([...files, ...Array.from(e.target.files)]);
    e.target.value = '';
  };

  const removeAt = (index) => onFilesChange(files.filter((_, i) => i !== index));

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const next = [...files];
    const [dragged] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, dragged);
    onFilesChange(next);
    setDragIndex(null);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink/80">Product Images</label>
      <input type="file" multiple accept="image/*" onChange={handleFileInput} className="input-field" />
      <p className="mt-1 text-xs text-ink/50">The first image (drag to reorder) will be used as the primary image.</p>

      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {files.map((file, index) => (
            <ImageTile
              key={`${file.name}-${index}`}
              image={{ url: URL.createObjectURL(file) }}
              isPrimary={index === 0}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              onSetPrimary={() => handleDrop(0) || onFilesChange([file, ...files.filter((_, i) => i !== index)])}
              onRemove={() => removeAt(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Used on the "Edit Product" form: manages an already-saved product's image
// gallery (reorder, primary, delete existing, append new) via its own save
// action against PATCH /products/:id/images.
const ProductImagesManager = ({ productId, images, onUpdated }) => {
  const [pending, setPending] = useState(images.map((img, index) => ({ ...img, order: index })));
  const [newFiles, setNewFiles] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileInput = (e) => {
    setNewFiles([...newFiles, ...Array.from(e.target.files)]);
    e.target.value = '';
  };

  const setPrimary = (publicId) => {
    setPending((prev) => prev.map((img) => ({ ...img, isPrimary: img.publicId === publicId })));
  };

  const removeExisting = (publicId) => {
    setPending((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  const removeNewFile = (index) => setNewFiles((prev) => prev.filter((_, i) => i !== index));

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const next = [...pending];
    const [dragged] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, dragged);
    setPending(next.map((img, index) => ({ ...img, order: index })));
    setDragIndex(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        'imagesMeta',
        JSON.stringify(pending.map(({ publicId, order, isPrimary }) => ({ publicId, order, isPrimary: Boolean(isPrimary) })))
      );
      newFiles.forEach((file) => formData.append('images', file));

      const { data } = await updateProductImagesApi(productId, formData);
      onUpdated(data.data.product);
      setNewFiles([]);
      toast.success('Product images updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update images');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/80">Current Images</label>
        {pending.length === 0 ? (
          <p className="text-sm text-ink/50">No images yet — add at least one below.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {pending.map((image, index) => (
              <ImageTile
                key={image.publicId}
                image={image}
                isPrimary={Boolean(image.isPrimary)}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                onSetPrimary={() => setPrimary(image.publicId)}
                onRemove={() => removeExisting(image.publicId)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/80">Add More Images</label>
        <input type="file" multiple accept="image/*" onChange={handleFileInput} className="input-field" />

        {newFiles.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
            {newFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-dashed border-primary-300 bg-surface">
                <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(index)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink/70 opacity-0 hover:text-red-600 group-hover:opacity-100"
                >
                  <HiOutlineTrash size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="button" onClick={handleSave} isLoading={isSaving}>
        Save Image Changes
      </Button>
    </div>
  );
};

export default ProductImagesManager;
