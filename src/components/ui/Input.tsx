import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-primary-dark dark:text-white mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 rounded-input
          border border-secondary dark:border-gray-700
          bg-white dark:bg-background-darkSecondary
          text-primary-dark dark:text-white
          placeholder:text-secondary dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent
          transition-all duration-300
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
