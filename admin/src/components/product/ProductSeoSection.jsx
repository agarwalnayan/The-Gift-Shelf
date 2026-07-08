import Input from '../common/Input.jsx';

const ProductSeoSection = ({ register }) => {
  return (
    <div className="space-y-4 rounded-xl border border-ink/10 p-4">
      <h3 className="text-sm font-semibold text-ink">SEO</h3>
      <Input label="Meta Title" maxLength={70} {...register('metaTitle')} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/80">Meta Description</label>
        <textarea rows={2} maxLength={160} className="input-field" {...register('metaDescription')} />
      </div>
      <Input label="Keywords (comma separated)" {...register('keywordsText')} />
    </div>
  );
};

export default ProductSeoSection;
