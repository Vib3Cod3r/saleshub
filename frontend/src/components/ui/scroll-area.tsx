import React, { forwardRef } from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className = '', style }, ref) => {
    return (
      <div 
        ref={ref}
        className={`overflow-auto ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';
