import Input from '../common/Input.jsx';
import CatalogMasterMultiSelect from "../catalogMaster/CatalogMasterMultiSelect";

const ProductOrganizationSection = ({ register, categories, control }) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Category</label>
          <select className="input-field" {...register('category', { required: true })}>
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Subcategory (optional)</label>
          <select className="input-field" {...register('subCategory')}>
            <option value="">None</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input label="Brand" placeholder="e.g. TGS Signature" {...register('brand')} />

      <div className="grid grid-cols-3 gap-4">
        <CatalogMasterMultiSelect
          control={control}
          name="tags"
          type="tag"
          label="Tags"
        />

        <CatalogMasterMultiSelect
          control={control}
          name="occasion"
          type="occasion"
          label="Occasions"
        />

        <CatalogMasterMultiSelect
          control={control}
          name="recipient"
          type="recipient"
          label="Recipients"
        />
      </div>

      <Input label="Material" placeholder="e.g. Ceramic, Wood, Cotton" {...register('material')} />

      <div className="grid grid-cols-2 gap-4 rounded-xl bg-surface p-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Weight" type="number" min={0} {...register('weight.value')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Unit</label>
            <select className="input-field" {...register('weight.unit')}>
              <option value="g">grams</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Input label="L" type="number" min={0} {...register('dimensions.length')} />
          <Input label="W" type="number" min={0} {...register('dimensions.width')} />
          <Input label="H" type="number" min={0} {...register('dimensions.height')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Unit</label>
            <select className="input-field" {...register('dimensions.unit')}>
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOrganizationSection;
