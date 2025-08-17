import React from 'react';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ className = '', orientation = 'horizontal' }: SeparatorProps) {
  const baseClasses = 'shrink-0 bg-gray-200';
  const orientationClasses = orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px';
  
  return (
    <div className={`${baseClasses} ${orientationClasses} ${className}`} />
  );
}
