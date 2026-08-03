import Input from "../common/Input.jsx";
import CatalogMasterMultiSelect from "../catalogMaster/CatalogMasterMultiSelect";

const ProductOrganizationSection = ({
  register,
  categories,
  control,
  watch,
}) => {

  const selectedCategory = watch("category");

  return (
    <div className="space-y-6">
      {/* Category & Subcategory */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-ink">Classification</h3>
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">
              Category
            </label>

            <select
              className="input-field"
              {...register("category", { required: true })}
            >
              <option value="">Select a category</option>

              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">
              Subcategory (optional)
            </label>

            <select
              className="input-field"
              {...register("subCategory")}
            >
              <option value="">None</option>

              {categories
                .find((cat) => cat._id === selectedCategory)
                ?.children?.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
            </select>
          </div>

        </div>
      </div>

      {/* Collections, Occasions, Recipients */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-ink">Associations</h3>
        <div className="space-y-4">
          <CatalogMasterMultiSelect
            control={control}
            name="collections"
            type="collection"
            label="Collections"
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
      </div>

      {/* Tags */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-ink">Tags</h3>
        <Input
          label="Tags"
          placeholder="Enter tags separated by commas (e.g., personalized, gift, birthday)"
          {...register("tags")}
        />
      </div>
    </div>
  );
};

export default ProductOrganizationSection;