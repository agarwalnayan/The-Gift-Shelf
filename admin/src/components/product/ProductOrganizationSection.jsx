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
    <div className="space-y-5">
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

      {/* Rest of your component remains unchanged */}
    </div>
  );
};

export default ProductOrganizationSection;