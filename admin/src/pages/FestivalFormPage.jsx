import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form'; import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { getFestivalByIdApi, createFestivalApi, updateFestivalApi, getFestivalsApi } from '../api/festivalApi.js';
import { getProductsApi } from '../api/productApi.js';
import {
  getBudgetCollectionsApi,
  getBannersApi,
} from '../api/marketingApi.js'; import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Toggle from '../components/common/Toggle.jsx';
import Loader from '../components/common/Loader.jsx';

const FestivalFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [badgeFile, setBadgeFile] = useState(null);
  const [featuredSectionFiles, setFeaturedSectionFiles] = useState({});

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      enabled: false,
      startDate: '',
      endDate: '',
      themeColor: '#C8A46B',
      announcement: {
        enabled: false,
        message: '',
        linkText: '',
        linkUrl: '',
        backgroundColor: '#F59E0B',
        textColor: '#FFFFFF',
        dismissible: true,
      },
      featuredCollections: [],
      heroBanners: [],
      featuredSections: [],
      displayOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, collectionsRes, bannersRes] = await Promise.all([
          getProductsApi({ limit: 100 }),
          getBudgetCollectionsApi(),
          getBannersApi({ type: 'hero' }),
        ]);
        setProducts(productsRes.data.data.products || []);
        setCollections(collectionsRes.data.data.collections || []);
        setHeroBanners(bannersRes.data.data.banners || []);

        if (id) {
          const { data } = await getFestivalByIdApi(id);
          const festival = data.data.festival;
          form.reset({
            ...festival,

            startDate: festival.startDate
              ? festival.startDate.split("T")[0]
              : "",

            endDate: festival.endDate
              ? festival.endDate.split("T")[0]
              : "",

            featuredCollections:
              festival.featuredCollections?.map((item) =>
                typeof item === "string"
                  ? item
                  : item._id
              ) || [],
            heroBanners:
              festival.heroBanners?.map((banner) =>
                typeof banner === 'string'
                  ? banner
                  : banner._id
              ) || [],
            featuredSections: festival.featuredSections || [],
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, form]);

  const onSubmit = async (values) => {
    setIsSaving(true);

    try {
      const formData = new FormData();

      // Basic fields
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("enabled", values.enabled);
      formData.append("startDate", values.startDate);
      formData.append("endDate", values.endDate);
      formData.append("themeColor", values.themeColor);
      formData.append("displayOrder", values.displayOrder);
      formData.append("isActive", values.isActive);

      // Complex objects
      formData.append(
        "announcement",
        JSON.stringify(values.announcement)
      );

      formData.append(
        "featuredCollections",
        JSON.stringify(
          (values.featuredCollections || []).map((item) =>
            typeof item === "string"
              ? item
              : item._id
          )
        )
      );

      formData.append(
        "heroBanners",
        JSON.stringify(
          values.heroBanners || []
        )
      );

      formData.append(
        "featuredSections",
        JSON.stringify(
          (values.featuredSections || []).map((section, index) => ({
            ...section,
            products: (section.products || []).map((p) =>
              typeof p === 'string' ? p : p._id
            ),
          }))
        )
      );

      // Festival badge image
      if (badgeFile) {
        formData.append(
          "festivalBadge",
          badgeFile
        );
      }

      // Featured section images
      Object.entries(featuredSectionFiles).forEach(([index, file]) => {
        if (file) {
          formData.append(`featuredSectionImage_${index}`, file);
        }
      });

      if (id) {
        await updateFestivalApi(id, formData);
        toast.success("Festival updated successfully");
      } else {
        await createFestivalApi(formData);
        toast.success("Festival created successfully");
      }

      navigate("/festivals");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to save festival"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/festivals')} className="rounded-lg p-2 text-ink/60 hover:bg-ink/5">
          <HiOutlineArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-ink">{id ? 'Edit Festival' : 'Add Festival'}</h1>
          <p className="mt-1 text-sm text-ink/60">Configure seasonal festival settings</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ink mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input label="Festival Name" {...form.register('name', { required: 'Name is required' })} error={form.formState.errors.name?.message} />
            <Input label="Slug" {...form.register('slug', { required: 'Slug is required' })} error={form.formState.errors.slug?.message} placeholder="raksha-bandhan" />
            <Input label="Start Date" type="date" {...form.register('startDate', { required: 'Start date is required' })} error={form.formState.errors.startDate?.message} />
            <Input label="End Date" type="date" {...form.register('endDate', { required: 'End date is required' })} error={form.formState.errors.endDate?.message} />
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Theme Color
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  {...form.register("themeColor")}
                  className="h-10 w-14 rounded border"
                />

                <span className="text-sm text-ink/70">
                  {form.watch("themeColor")}
                </span>
              </div>
            </div>
            <Input label="Display Order" type="number" {...form.register('displayOrder')} />
            <div className="flex items-center gap-6 pt-6">
              <Controller
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                    label="Enabled"
                  />
                )}
              />

              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                    label="Active"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Festival Badge */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ink mb-4">Festival Badge</h3>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Badge Image</label>
            {id && form.getValues("festivalBadge")?.url && (
              <img
                src={form.getValues("festivalBadge").url}
                alt="Festival Badge"
                className="mb-3 h-28 rounded-lg border object-cover"
              />
            )}
            <input type="file" accept="image/*" onChange={(e) => setBadgeFile(e.target.files[0])} className="w-full rounded-lg border border-ink/10 p-2" />
            <p className="mt-2 text-xs text-ink/50">Optional badge image displayed during the festival</p>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ink mb-4">Announcement Bar</h3>
          <div className="space-y-6">
            <Controller
              control={form.control}
              name="announcement.enabled"
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onChange={field.onChange}
                  label="Enable Announcement"
                />
              )}
            />            <Input label="Message" {...form.register('announcement.message')} placeholder="Special offer for Raksha Bandhan!" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input label="Link Text" {...form.register('announcement.linkText')} placeholder="Shop Now" />
              <Input label="Link URL" {...form.register('announcement.linkUrl')} placeholder="/raksha-bandhan" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input label="Background Color" {...form.register('announcement.backgroundColor')} placeholder="#F59E0B" />
              <Input label="Text Color" {...form.register('announcement.textColor')} placeholder="#FFFFFF" />
            </div>
            <Controller
              control={form.control}
              name="announcement.dismissible"
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onChange={field.onChange}
                  label="Dismissible"
                />
              )}
            />          </div>
        </div>

        {/* Featured Content */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ink mb-4">Featured Content</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Featured Collections</label>
              <select multiple {...form.register('featuredCollections')} className="w-full rounded-lg border border-ink/10 p-2 h-32">
                {collections.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <p className="mt-1 text-xs text-ink/50">Hold Ctrl/Cmd to select multiple</p>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-ink mb-2">
                Festival Hero Banners
              </label>

              <select
                multiple
                {...form.register("heroBanners")}
                className="w-full rounded-lg border border-ink/10 p-2 h-32"
              >
                {heroBanners.map((banner) => (
                  <option key={banner._id} value={banner._id}>
                    {banner.title || "Untitled Hero Banner"}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-xs text-ink/50">
                Select the hero banners that should appear during this festival.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Sections */}
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Featured Sections</h3>
            <button
              type="button"
              onClick={() => {
                const currentSections = form.getValues('featuredSections') || [];
                form.setValue('featuredSections', [
                  ...currentSections,
                  {
                    title: '',
                    description: '',
                    destinationType: 'url',
                    destinationUrl: '',
                    products: [],
                    displayOrder: currentSections.length,
                    isActive: true,
                  },
                ]);
              }}
              className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100"
            >
              + Add Section
            </button>
          </div>

          <div className="space-y-6">
            {(form.watch('featuredSections') || []).map((section, index) => (
              <div key={index} className="rounded-xl border border-ink/10 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">Section {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentSections = form.getValues('featuredSections') || [];
                      const newSections = currentSections.filter((_, i) => i !== index);
                      form.setValue('featuredSections', newSections);
                      setFeaturedSectionFiles((prev) => {
                        const updated = { ...prev };
                        delete updated[index];
                        return updated;
                      });
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Title"
                    {...form.register(`featuredSections.${index}.title`)}
                    placeholder="Personalised Rakhis"
                  />

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink/80">Description</label>
                    <textarea
                      rows={2}
                      className="input-field"
                      {...form.register(`featuredSections.${index}.description`)}
                      placeholder="Handcrafted resin, evil eye & custom name rakhis..."
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink/80">Section Image</label>
                    {section.image?.url && !featuredSectionFiles[index] && (
                      <img
                        src={section.image.url}
                        alt="Section"
                        className="mb-2 h-24 w-full rounded-lg border object-cover"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setFeaturedSectionFiles((prev) => ({
                          ...prev,
                          [index]: e.target.files[0],
                        }));
                      }}
                      className="w-full rounded-lg border border-ink/10 p-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink/80">Destination Type</label>
                      <select
                        {...form.register(`featuredSections.${index}.destinationType`)}
                        className="input-field"
                      >
                        <option value="url">URL</option>
                        <option value="products">Products</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink/80">Display Order</label>
                      <input
                        type="number"
                        {...form.register(`featuredSections.${index}.displayOrder`)}
                        className="input-field"
                        defaultValue={index}
                      />
                    </div>
                  </div>

                  {form.watch(`featuredSections.${index}.destinationType`) === 'url' ? (
                    <Input
                      label="Destination URL"
                      {...form.register(`featuredSections.${index}.destinationUrl`)}
                      placeholder="/categories/personalised-rakhis"
                    />
                  ) : (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink/80">Products</label>
                      <select
                        multiple
                        {...form.register(`featuredSections.${index}.products`)}
                        className="w-full rounded-lg border border-ink/10 p-2 h-32"
                      >
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-ink/50">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                  )}

                  <Controller
                    control={form.control}
                    name={`featuredSections.${index}.isActive`}
                    render={({ field }) => (
                      <Toggle
                        checked={field.value}
                        onChange={field.onChange}
                        label="Active"
                      />
                    )}
                  />
                </div>
              </div>
            ))}

            {(form.watch('featuredSections') || []).length === 0 && (
              <p className="text-sm text-ink/50">No featured sections added yet. Click "+ Add Section" to create one.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/festivals')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {id ? 'Update Festival' : 'Create Festival'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FestivalFormPage;
