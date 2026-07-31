import { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { getCatalogMastersApi } from "../../api/catalogMasterApi";

const CatalogMasterMultiSelect = ({
  control,
  name,
  type,
  label,
}) => {
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setLoading(true);

        const { data } = await getCatalogMastersApi({
          type,
          isActive: true,
          limit: 500,
        });

        setOptions(data.data.masters || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMasters();
  }, [type]);

  const filtered = useMemo(() => {
    if (!search) return options;

    return options.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      render={({ field }) => (
        <div className="rounded-xl border border-border bg-white p-4">
          <label className="mb-3 block text-sm font-medium text-ink">
            {label}

            <span className="ml-2 text-xs text-ink/50">
              ({field.value?.length || 0} selected)
            </span>
          </label>

          <input
            type="text"
            className="input-field mb-3"
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-52 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-500">
                No {label.toLowerCase()} found.
              </p>
            ) : (
              [...filtered]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item) => {
                  const checked = field.value?.includes(item._id);

                  return (
                    <label
                      key={item._id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([
                              ...(field.value || []),
                              item._id,
                            ]);
                          } else {
                            field.onChange(
                              (field.value || []).filter(
                                (v) => v !== item._id
                              )
                            );
                          }

                          setSearch("");
                        }}
                      />

                      <span>{item.name}</span>
                    </label>
                  );
                })
            )}
          </div>
        </div>
      )}
    />
  );
};

export default CatalogMasterMultiSelect;