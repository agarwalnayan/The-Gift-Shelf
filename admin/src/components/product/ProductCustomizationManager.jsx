import { useFieldArray, useWatch } from 'react-hook-form';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Toggle from '../common/Toggle.jsx';
import { CUSTOMIZATION_TYPES, CHOICE_LIKE_TYPES, TEXT_LIKE_TYPES, MULTI_LIKE_TYPES } from '../../utils/customizationTypes.js';

const slugifyKey = (label) =>
  label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const CustomizationOptionRow = ({ control, register, setValue, index, remove }) => {
  const type = useWatch({ control, name: `customizationOptions.${index}.type` });
  const isEnabled = useWatch({ control, name: `customizationOptions.${index}.isEnabled` });
  const isRequired = useWatch({ control, name: `customizationOptions.${index}.isRequired` });

  const isChoiceLike = CHOICE_LIKE_TYPES.includes(type) || type === 'text_color';
  const isTextLike = TEXT_LIKE_TYPES.includes(type);
  const isMultiLike = MULTI_LIKE_TYPES.includes(type);
  const isImageLike = type === 'image_upload' || type === 'multi_image_upload';
  const isDateLike = type === 'date_input';

  return (
    <div className="rounded-xl border border-ink/10 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">Option {index + 1}</span>
        <button type="button" onClick={() => remove(index)} className="text-ink/40 hover:text-red-600" aria-label="Remove option">
          <HiOutlineTrash size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Label"
          placeholder="e.g. Gift Message"
          {...register(`customizationOptions.${index}.label`, {
            required: true,
            onChange: (e) => setValue(`customizationOptions.${index}.key`, slugifyKey(e.target.value)),
          })}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Type</label>
          <select className="input-field" {...register(`customizationOptions.${index}.type`, { required: true })}>
            {CUSTOMIZATION_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <input type="hidden" {...register(`customizationOptions.${index}.key`)} />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Input label="Additional Price (₹)" type="number" min={0} {...register(`customizationOptions.${index}.additionalPrice`)} />
        <Input label="Display Order" type="number" min={0} {...register(`customizationOptions.${index}.displayOrder`)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Input label="Placeholder Text" {...register(`customizationOptions.${index}.placeholder`)} />
        <Input label="Help Text" {...register(`customizationOptions.${index}.helpText`)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-6 rounded-lg bg-surface p-3">
        <Toggle label="Enabled" checked={Boolean(isEnabled)} onChange={(v) => setValue(`customizationOptions.${index}.isEnabled`, v)} />
        <Toggle label="Required" checked={Boolean(isRequired)} onChange={(v) => setValue(`customizationOptions.${index}.isRequired`, v)} />
      </div>

      {isChoiceLike && (
        <div className="mt-3">
          <Input
            label={type === 'text_color' ? 'Allowed Colors (comma separated hex/names)' : 'Choices (comma separated)'}
            placeholder="e.g. Arial, Times New Roman, Script"
            {...register(`customizationOptions.${index}.choicesText`)}
          />
        </div>
      )}

      {(isTextLike || isMultiLike) && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Input label="Min Length" type="number" min={0} {...register(`customizationOptions.${index}.validation.minLength`)} />
          <Input label="Max Length (Character Limit)" type="number" min={0} {...register(`customizationOptions.${index}.validation.maxLength`)} />
        </div>
      )}

      {isMultiLike && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Input label="Min Selections" type="number" min={0} {...register(`customizationOptions.${index}.validation.minSelections`)} />
          <Input label="Max Selections" type="number" min={0} {...register(`customizationOptions.${index}.validation.maxSelections`)} />
        </div>
      )}

      {isImageLike && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Input label="Max File Size (MB)" type="number" min={0} {...register(`customizationOptions.${index}.validation.maxFileSizeMB`)} />
          <Input
            label="Allowed File Types (comma separated)"
            placeholder="jpg, png, webp"
            {...register(`customizationOptions.${index}.allowedFileTypesText`)}
          />
        </div>
      )}

      {isDateLike && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Input label="Earliest Date" type="date" {...register(`customizationOptions.${index}.validation.minDate`)} />
          <Input label="Latest Date" type="date" {...register(`customizationOptions.${index}.validation.maxDate`)} />
        </div>
      )}
    </div>
  );
};

const ProductCustomizationManager = ({ control, register, setValue }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'customizationOptions' });

  const addOption = () =>
    append({
      key: '',
      label: '',
      type: 'text_input',
      isEnabled: true,
      isRequired: false,
      additionalPrice: 0,
      displayOrder: fields.length,
      placeholder: '',
      helpText: '',
      choicesText: '',
      allowedFileTypesText: '',
      validation: {},
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Personalization Options</h3>
          <p className="text-xs text-ink/50">
            Configure how customers personalize this product — no code required. New option types can be added later
            from a single shared list.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={addOption}>
          <HiOutlinePlus className="mr-1.5" size={16} />
          Add Option
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="rounded-xl bg-surface p-4 text-sm text-ink/50">
          No personalization options configured. Add one for gift messages, monogramming, greeting cards, and more.
        </p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <CustomizationOptionRow
            key={field.id}
            control={control}
            register={register}
            setValue={setValue}
            index={index}
            remove={remove}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCustomizationManager;
