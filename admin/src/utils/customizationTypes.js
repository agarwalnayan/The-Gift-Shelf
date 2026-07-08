export const CUSTOMIZATION_TYPES = [
  { value: 'image_upload', label: 'Image Upload' },
  { value: 'multi_image_upload', label: 'Multiple Image Upload' },
  { value: 'text_input', label: 'Single Text Input' },
  { value: 'multi_text_input', label: 'Multiple Text Inputs' },
  { value: 'date_input', label: 'Date Input' },
  { value: 'dropdown', label: 'Dropdown Selection' },
  { value: 'font_selection', label: 'Font Selection' },
  { value: 'text_color', label: 'Text Color' },
  { value: 'gift_message', label: 'Gift Message' },
  { value: 'greeting_card', label: 'Greeting Card' },
  { value: 'gift_wrapping', label: 'Gift Wrapping' },
  { value: 'special_instructions', label: 'Special Instructions' },
];

// Types where the admin needs to define a fixed list of choices.
export const CHOICE_LIKE_TYPES = ['dropdown', 'font_selection', 'greeting_card', 'gift_wrapping'];

// Types where character-limit validation is meaningful.
export const TEXT_LIKE_TYPES = ['text_input', 'multi_text_input', 'gift_message', 'special_instructions'];

// Types where min/max selection counts are meaningful.
export const MULTI_LIKE_TYPES = ['multi_text_input', 'multi_image_upload'];

export const getCustomizationTypeLabel = (value) =>
  CUSTOMIZATION_TYPES.find((type) => type.value === value)?.label || value;
