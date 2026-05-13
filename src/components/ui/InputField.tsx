'use client';

import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  hint?: string;
}

export function InputField({ label, unit, hint, className = '', ...props }: InputFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-base text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition pr-10"
          {...props}
        />
        {unit && (
          <span className="absolute right-3 text-sm text-stone-400 font-medium pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}

export function SelectField({ label, value, onChange, options, hint }: SelectFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-stone-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-base text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export function ToggleField({ label, checked, onChange, hint }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <span className="text-sm font-medium text-stone-700">{label}</span>
        {hint && <p className="text-xs text-stone-400">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          checked ? 'bg-amber-700' : 'bg-stone-200'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
