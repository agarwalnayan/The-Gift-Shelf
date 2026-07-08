import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, id, error, className = '', ...props }, ref) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink/80">
          {label}
        </label>
      )}
      <input ref={ref} id={id} className={`input-field ${className}`.trim()} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
