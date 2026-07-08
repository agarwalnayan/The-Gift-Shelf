import { useFieldArray } from 'react-hook-form';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

const VariantAttributesFieldArray = ({ control, register, variantIndex }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.attributes`,
  });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-ink/50">Attributes</label>
        <button
          type="button"
          onClick={() => append({ name: '', value: '' })}
          className="text-xs font-medium text-primary-600 hover:underline"
        >
          + Add Attribute
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, attrIndex) => (
          <div key={field.id} className="flex items-center gap-2">
            <input
              placeholder="Name (e.g. Color)"
              className="input-field"
              {...register(`variants.${variantIndex}.attributes.${attrIndex}.name`, { required: true })}
            />
            <input
              placeholder="Value (e.g. Red)"
              className="input-field"
              {...register(`variants.${variantIndex}.attributes.${attrIndex}.value`, { required: true })}
            />
            <button
              type="button"
              onClick={() => remove(attrIndex)}
              className="shrink-0 text-ink/40 hover:text-red-600"
              aria-label="Remove attribute"
            >
              <HiOutlineTrash size={16} />
            </button>
          </div>
        ))}
        {fields.length === 0 && <p className="text-xs text-ink/40">e.g. Color: Red, Size: M, Package: Gift Box</p>}
      </div>
    </div>
  );
};

const ProductVariantsManager = ({ control, register }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Variants</h3>
          <p className="text-xs text-ink/50">
            Combine any attributes (Color, Size, Material, Package Type, or new ones you invent) — no code changes needed.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ sku: '', attributes: [{ name: '', value: '' }], price: '', stock: 0, isActive: true })}
        >
          <HiOutlinePlus className="mr-1.5" size={16} />
          Add Variant
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="rounded-xl bg-surface p-4 text-sm text-ink/50">
          No variants yet. Leave empty if this product doesn't have color/size/material options.
        </p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-xl border border-ink/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">Variant {index + 1}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-ink/40 hover:text-red-600"
                aria-label="Remove variant"
              >
                <HiOutlineTrash size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input label="SKU (optional)" placeholder="Auto-generated" {...register(`variants.${index}.sku`)} />
              <Input
                label="Price Override"
                type="number"
                placeholder="Uses base price"
                {...register(`variants.${index}.price`)}
              />
              <Input label="Stock" type="number" {...register(`variants.${index}.stock`, { required: true, min: 0 })} />
            </div>

            <div className="mt-3">
              <VariantAttributesFieldArray control={control} register={register} variantIndex={index} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductVariantsManager;
