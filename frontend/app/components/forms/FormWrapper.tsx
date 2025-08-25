'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  title?: string;
  description?: string;
  submitText?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  showSubmitButton?: boolean;
}

export function FormWrapper({
  children,
  onSubmit,
  title,
  description,
  submitText = 'Submit',
  loading = false,
  disabled = false,
  className,
  showSubmitButton = true,
}: FormWrapperProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-6', className)}
    >
      {(title || description) && (
        <div className="text-center">
          {title && (
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-secondary-600">{description}</p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
      
      {showSubmitButton && (
        <Button
          type="submit"
          loading={loading}
          disabled={disabled}
          className="w-full"
        >
          {submitText}
        </Button>
      )}
    </form>
  );
}
