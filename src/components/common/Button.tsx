import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode };

export const Button: React.FC<Props> = ({ children, className = '', ...rest }) => (
  <button {...rest} className={`px-3 py-1 rounded ${className}`}>
    {children}
  </button>
);

export default Button;
