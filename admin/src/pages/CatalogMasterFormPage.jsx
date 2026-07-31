import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  createCatalogMasterApi,
  getCatalogMasterByIdApi,
  updateCatalogMasterApi,
} from "../api/catalogMasterApi";

import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Toggle from "../components/common/Toggle";
import Loader from "../components/common/Loader";

const slugify = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");

const defaultValues = {
  name: "",
  slug: "",
  type: "tag",
  description: "",
  displayOrder: 0,
  isActive: true,
  showOnHomepage: false,
  homepageDisplayOrder: 0,
  image: null,
};

const CatalogMasterFormPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditMode);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imagePreview, setImagePreview] = useState("");

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

useEffect(() => {
  if (!isEditMode) return;

  getCatalogMasterByIdApi(id)
    .then(({ data }) => {
      const master = data.data.master;

      reset({
        ...master,
        image: null,
      });

      setImagePreview(master.image?.url || "");
    })
    .catch(() => {
      toast.error("Failed to load catalog master");
    })
    .finally(() => {
      setIsLoading(false);
    });
}, [id, isEditMode, reset]);

const name = watch("name");

const showOnHomepage = watch("showOnHomepage");

useEffect(() => {
  if (!isEditMode) {
    setValue("slug", slugify(name));
  }
}, [name, isEditMode, setValue]);

const onSubmit = async (values) => {
  setIsSubmitting(true);

  try {
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("slug", values.slug);
    formData.append("type", values.type);
    formData.append("description", values.description || "");
    formData.append("displayOrder", values.displayOrder);
    formData.append("isActive", values.isActive);
    formData.append("showOnHomepage", values.showOnHomepage);
    formData.append(
      "homepageDisplayOrder",
      values.homepageDisplayOrder || 0
    );

    if (values.image instanceof File) {
      formData.append("image", values.image);
    }

    if (isEditMode) {
      await updateCatalogMasterApi(id, formData);
      toast.success("Catalog master updated");
    } else {
      await createCatalogMasterApi(formData);
      toast.success("Catalog master created");
    }

    navigate("/catalog-masters");
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to save catalog master"
    );
  } finally {
    setIsSubmitting(false);
  }
};

if (isLoading) return <Loader fullScreen />;

return (
  <div className="mx-auto max-w-3xl">

    <h1 className="mb-6 text-2xl font-semibold text-ink">
      {isEditMode ? "Edit Catalog Master" : "Add Catalog Master"}
    </h1>

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card space-y-5"
    >
      <Input
        label="Name *"
        error={errors.name?.message}
        {...register("name", {
          required: "Name is required",
        })}
      />

      <Input
        label="Slug"
        {...register("slug")}
      />

      <div>
        <label className="mb-2 block text-sm font-medium">
          Type
        </label>

        <select
          className="input-field"
          {...register("type")}
        >
          <option value="tag">Tag</option>
          <option value="occasion">
            Occasion
          </option>
          <option value="recipient">
            Recipient
          </option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          rows={4}
          className="input-field"
          {...register("description")}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Image
        </label>

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mb-3 h-32 w-32 rounded-lg border object-cover"
          />
        )}

        <input
          type="file"
          accept="image/*"
          className="input-field"
          onChange={(e) => {
            const file = e.target.files[0];

            if (!file) return;

            setValue("image", file);

            setImagePreview(URL.createObjectURL(file));
          }}
        />
      </div>

      <Input
        label="Display Order"
        type="number"
        {...register("displayOrder")}
      />

      <Toggle
        label="Active"
        checked={watch("isActive")}
        onChange={(v) =>
          setValue("isActive", v)
        }
      />

      <Toggle
        label="Show on Homepage"
        checked={showOnHomepage}
        onChange={(value) =>
          setValue("showOnHomepage", value)
        }
      />

      {showOnHomepage && (
        <Input
          label="Homepage Display Order"
          type="number"
          {...register("homepageDisplayOrder")}
        />
      )}

      <div className="flex gap-3 pt-3">

        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          {isEditMode
            ? "Save Changes"
            : "Create Catalog Master"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            navigate("/catalog-masters")
          }
        >
          Cancel
        </Button>

      </div>
    </form>

  </div>
);
};

export default CatalogMasterFormPage;