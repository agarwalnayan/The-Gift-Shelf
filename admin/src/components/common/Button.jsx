const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
};

const Button = ({ variant = 'primary', className = '', children, isLoading = false, ...props }) => {
  return (
    <button
      className={`${variantClasses[variant]} ${className}`.trim()}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Please wait…' : children}
    </button>
  );
};

export default Button;
