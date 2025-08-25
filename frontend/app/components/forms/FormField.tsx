'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('w-full', className)}>
      <Input
        id={name}
        name={name}
        type={type}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
      />
    </div>
  );
}
