import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft } from "react-icons/hi2";

import {
  getBadgeByIdApi,
  createBadgeApi,
  updateBadgeApi,
} from "../api/badgeApi";

import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import Toggle from "../components/common/Toggle.jsx";
import Loader from "../components/common/Loader.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import FormGrid from "../components/common/FormGrid.jsx";

const BadgeFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      badgeText: "",
      description: "",
      backgroundColor: "#F59E0B",
      textColor: "#FFFFFF",
      icon: "",
      priority: 0,
      active: true,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        const { data } = await getBadgeByIdApi(id);
        const badge = data.data.badge;

        form.reset({
          name: badge.name,
          slug: badge.slug,
          badgeText: badge.badgeText,
          description: badge.description,
          backgroundColor: badge.backgroundColor,
          textColor: badge.textColor,
          icon: badge.icon,
          priority: badge.priority,
          active: badge.active,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load badge");
        navigate("/badges");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, form, navigate]);

  const onSubmit = async (values) => {
    setIsSaving(true);

    try {
      if (id) {
        await updateBadgeApi(id, values);
        toast.success("Badge updated successfully");
      } else {
        await createBadgeApi(values);
        toast.success("Badge created successfully");
      }

      navigate("/badges");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to save badge"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={id ? "Edit Badge" : "Create Badge"}
        description={id ? "Update badge details" : "Create a new visual merchandising label"}
        backTo="/badges"
        backIcon={<HiOutlineArrowLeft />}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-border bg-white p-6">
          <FormGrid columns={2}>
            <Input
              label="Name"
              placeholder="e.g. Bestseller"
              {...form.register("name", { required: "Badge name is required" })}
              error={form.formState.errors.name?.message}
            />

            <Input
              label="Slug"
              placeholder="e.g. bestseller"
              {...form.register("slug", { required: "Badge slug is required" })}
              error={form.formState.errors.slug?.message}
            />

            <Input
              label="Badge Text"
              placeholder="e.g. BESTSELLER"
              {...form.register("badgeText", { required: "Badge text is required" })}
              error={form.formState.errors.badgeText?.message}
            />

            <Input
              label="Icon (Optional)"
              placeholder="e.g. star, fire, heart"
              {...form.register("icon")}
            />

            <Input
              label="Background Color"
              type="color"
              {...form.register("backgroundColor")}
              className="h-12 w-full"
            />

            <Input
              label="Text Color"
              type="color"
              {...form.register("textColor")}
              className="h-12 w-full"
            />

            <Input
              label="Priority"
              type="number"
              placeholder="0"
              {...form.register("priority", { valueAsNumber: true })}
              min="0"
            />

            <div className="flex items-center gap-3">
              <Toggle
                checked={form.watch("active")}
                onChange={(value) => form.setValue("active", value)}
                label="Active"
              />
            </div>
          </FormGrid>

          <div className="mt-4">
            <Input
              label="Description"
              placeholder="Internal admin description"
              {...form.register("description")}
              textarea
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="mb-3 text-sm font-medium text-ink/80">Preview</h3>
            <div
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                backgroundColor: form.watch("backgroundColor"),
                color: form.watch("textColor"),
              }}
            >
              {form.watch("icon") && <span className="mr-2">{form.watch("icon")}</span>}
              {form.watch("badgeText") || "Badge Text"}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/badges")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Saving..." : id ? "Update Badge" : "Create Badge"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BadgeFormPage;
