import { useState } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

const CustomizationEditModal = ({ isOpen, onClose, customizationOptions, currentCustomizations, onSave }) => {
  const [values, setValues] = useState(() => {
    const initialValues = {};
    if (currentCustomizations && currentCustomizations.length > 0) {
      currentCustomizations.forEach(c => {
        initialValues[c.key] = c.value;
      });
    }
    return initialValues;
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const hasValue = (value) => {
    return value !== undefined && value !== null && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true);
  };

  const validateField = (option, value) => {
    if (option.isRequired && !hasValue(value)) {
      return `${option.label} is required`;
    }

    if (option.validation) {
      const { minLength, maxLength, pattern } = option.validation;
      
      if (typeof value === 'string') {
        if (minLength && value.length < minLength) {
          return `${option.label} must be at least ${minLength} characters`;
        }
        if (maxLength && value.length > maxLength) {
          return `${option.label} must not exceed ${maxLength} characters`;
        }
        if (pattern && !new RegExp(pattern).test(value)) {
          return `${option.label} format is invalid`;
        }
      }
    }

    if (option.choices && option.choices.length > 0) {
      if (Array.isArray(value)) {
        const invalidChoices = value.filter(v => !option.choices.includes(v));
        if (invalidChoices.length > 0) {
          return `Invalid selection for ${option.label}`;
        }
      } else if (value && !option.choices.includes(value)) {
        return `Invalid selection for ${option.label}`;
      }
    }

    return null;
  };

  const handleChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const handleSave = () => {
    const newErrors = {};
    let isValid = true;

    customizationOptions.forEach(option => {
      const error = validateField(option, values[option.key]);
      if (error) {
        newErrors[option.key] = error;
        isValid = false;
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // Convert values to customization format
    const updatedCustomizations = customizationOptions
      .map(option => {
        const value = values[option.key];
        if (!hasValue(value)) return null;
        
        return {
          key: option.key,
          label: option.label,
          type: option.type,
          value,
          additionalPrice: option.additionalPrice || 0,
        };
      })
      .filter(Boolean);

    onSave(updatedCustomizations);
    onClose();
  };

  const renderInput = (option) => {
    const value = values[option.key] || '';
    const error = errors[option.key];

    switch (option.type) {
      case 'text':
      case 'text_area':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(option.key, e.target.value)}
            placeholder={option.placeholder || option.helpText}
            rows={option.type === 'text_area' ? 4 : 1}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        );

      case 'text_input':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(option.key, e.target.value)}
            placeholder={option.placeholder || option.helpText}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        );

      case 'number_input':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(option.key, e.target.value)}
            placeholder={option.placeholder || option.helpText}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        );

      case 'select':
      case 'multi_select':
        return (
          <select
            multiple={option.type === 'multi_select'}
            value={Array.isArray(value) ? value : [value].filter(Boolean)}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value);
              handleChange(option.key, option.type === 'multi_select' ? selected : selected[0]);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            {option.choices.map(choice => (
              <option key={choice} value={choice}>{choice}</option>
            ))}
          </select>
        );

      case 'date_input':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(option.key, e.target.value)}
            min={option.validation?.minDate?.toISOString().split('T')[0]}
            max={option.validation?.maxDate?.toISOString().split('T')[0]}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        );

      case 'text_color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleChange(option.key, e.target.value)}
              className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(option.key, e.target.value)}
              placeholder="#000000"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
        );

      case 'image_upload':
      case 'multi_image_upload':
        return (
          <div>
            <input
              type="url"
              value={Array.isArray(value) ? value[0] : value}
              onChange={(e) => handleChange(option.key, e.target.value)}
              placeholder="Enter image URL"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            {value && (
              <div className="mt-2">
                <img
                  src={Array.isArray(value) ? value[0] : value}
                  alt="Preview"
                  className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(option.key, e.target.value)}
            placeholder={option.placeholder || option.helpText}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Customization</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <HiOutlineXMark size={24} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          <div className="space-y-6">
            {customizationOptions.map((option) => (
              <div key={option.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {option.label}
                  {option.isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                {option.helpText && (
                  <p className="text-xs text-gray-500 mb-2">{option.helpText}</p>
                )}
                {renderInput(option)}
                {errors[option.key] && (
                  <p className="mt-1 text-xs text-red-600">{errors[option.key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationEditModal;
