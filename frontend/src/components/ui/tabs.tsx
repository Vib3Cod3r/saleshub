import React from 'react';

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
}

export function Tabs({ children, className = '' }: TabsProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function TabsTrigger({ children, className = '', onClick, active = false }: TabsTriggerProps) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        active 
          ? 'bg-white text-gray-950 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  active?: boolean;
}

export function TabsContent({ children, className = '', active = false }: TabsContentProps) {
  if (!active) return null;
  
  return (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
