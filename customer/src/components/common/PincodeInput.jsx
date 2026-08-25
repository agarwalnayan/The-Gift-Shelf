import { useState, useEffect } from 'react';
import { HiMagnifyingGlass, HiXMark, HiCheck, HiExclamationTriangle } from 'react-icons/hi2';
import axiosInstance from '../../api/axiosInstance.js';

const PincodeInput = ({ 
  value, 
  onChange, 
  onCityStateFound, 
  className = '',
  placeholder = 'Enter 6-digit PIN code',
  disabled = false 
}) => {
  const [pincode, setPincode] = useState(value || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    setPincode(value || '');
  }, [value]);

  const handlePincodeChange = (e) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setPincode(newValue);
    setError('');
    setSuccess(false);
    
    // Notify parent of change
    if (onChange) {
      onChange(newValue);
    }

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Trigger lookup when exactly 6 digits
    if (newValue.length === 6) {
      const timer = setTimeout(() => lookupPincode(newValue), 500); // 500ms debounce
      setDebounceTimer(timer);
    }
  };

  const lookupPincode = async (pin) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axiosInstance.get(`/address/pincode/${pin}`);
      const data = response.data;

      if (data.success && data.data) {
        setSuccess(true);
        if (onCityStateFound) {
          onCityStateFound({
            city: data.data.city,
            state: data.data.state,
            district: data.data.district
          });
        }
      } else {
        setError('PIN code not found');
      }
    } catch (err) {
      setError('Unable to find location. Please enter city and state manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPincode('');
    setError('');
    setSuccess(false);
    if (onChange) onChange('');
    if (onCityStateFound) onCityStateFound(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={pincode}
          onChange={handlePincodeChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={6}
          className={`input-field pr-20 ${error ? 'border-red-300 focus:border-red-500' : ''}`}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <div className="text-charcoal/40 text-xs">Looking up...</div>
          )}
          
          {success && !loading && (
            <HiCheck className="text-green-600" size={18} />
          )}
          
          {error && !loading && (
            <HiExclamationTriangle className="text-red-500" size={18} />
          )}
          
          {pincode && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-charcoal/40 hover:text-charcoal"
            >
              <HiXMark size={16} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-1 text-xs text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-1 text-xs text-green-600">
          ✓ Location found
        </div>
      )}
    </div>
  );
};

export default PincodeInput;
