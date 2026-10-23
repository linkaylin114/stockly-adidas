import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  min?: number;
  id?: string;
  name?: string;
}

/**
 * Format raw number to thousands separated string (e.g. 1620000 -> 1.620.000)
 */
export function formatCurrencyString(num: number | string): string {
  if (num === '' || num === null || num === undefined) return '';
  const cleanNumber = typeof num === 'number' ? num : Number(String(num).replace(/\D/g, ''));
  if (isNaN(cleanNumber)) return '';
  return cleanNumber.toLocaleString('vi-VN');
}

/**
 * Parse thousands separated string to number (e.g. 1.620.000 -> 1620000)
 */
export function parseCurrencyString(str: string): number {
  if (!str) return 0;
  const digitsOnly = str.replace(/\D/g, '');
  return digitsOnly ? Number(digitsOnly) : 0;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = 'Nhập số tiền...',
  className = '',
  required = false,
  min = 0,
  id,
  name,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(formatCurrencyString(value));

  useEffect(() => {
    setDisplayValue(formatCurrencyString(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const numericValue = parseCurrencyString(rawInput);
    
    // Format for display
    const formatted = formatCurrencyString(numericValue);
    setDisplayValue(formatted);
    onChange(numericValue);
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        inputMode="numeric"
        id={id}
        name={name}
        required={required}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full pr-12 text-right font-mono tabular-nums font-semibold ${className}`}
      />
      <span className="absolute right-3 text-xs text-slate-400 font-medium pointer-events-none select-none">
        VNĐ
      </span>
    </div>
  );
};
