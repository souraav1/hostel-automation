import React from 'react';
import { clsx } from 'clsx';

const Input = ({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'input',
          error && 'border-red-500 focus:ring-red-500 focus:border-transparent',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
