/**
 * Homepage Design Tokens
 * Centralized design system values for homepage components
 */

export const spacing = {
  section: {
    mobile: '32px',
    tablet: '40px',
    desktop: '48px',
  },
  card: {
    mobile: '16px',
    tablet: '20px',
    desktop: '24px',
  },
  element: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },
};

export const shadows = {
  card: {
    default: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    hover: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    elevated: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  },
  banner: {
    default: '0 2px 4px rgba(0, 0, 0, 0.08)',
    hover: '0 4px 8px rgba(0, 0, 0, 0.12)',
  },
};

export const borderRadius = {
  card: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  button: {
    sm: '6px',
    md: '8px',
    lg: '10px',
  },
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

export const backgrounds = {
  white: '#ffffff',
  cream: '#faf8f5',
  warm: '#f5f0eb',
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
  },
};

export const typography = {
  section: {
    title: {
      mobile: 'text-xl',
      tablet: 'text-2xl',
      desktop: 'text-3xl',
    },
    subtitle: 'text-sm',
  },
  card: {
    title: 'text-sm font-medium',
    subtitle: 'text-xs',
  },
};
