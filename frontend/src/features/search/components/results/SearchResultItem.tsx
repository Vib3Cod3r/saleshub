import React from 'react';
import { cn } from '../../../../shared/utils/cn';

interface SearchResultItemProps {
  item: Record<string, unknown>;
  onClick?: () => void;
  className?: string;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  onClick,
  className
}) => {
  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'Contact':
        return '👤';
      case 'Company':
        return '🏢';
      case 'Deal':
        return '💰';
      case 'Lead':
        return '🎯';
      case 'Task':
        return '📋';
      default:
        return '📄';
    }
  };

  const getEntityType = (item: Record<string, unknown>): string => {
    if (item.firstName || item.lastName) return 'Contact';
    if (item.name && item.industry) return 'Company';
    if (item.title && item.value) return 'Deal';
    if (item.source) return 'Lead';
    if (item.status && item.dueDate) return 'Task';
    return 'Unknown';
  };

  const entityType = getEntityType(item);
  const icon = getEntityIcon(entityType);

  const getDisplayName = (item: Record<string, unknown>): string => {
    if (item.firstName && item.lastName) {
      return `${item.firstName} ${item.lastName}`;
    }
    if (item.name) return String(item.name);
    if (item.title) return String(item.title);
    if (item.email) return String(item.email);
    return 'Unnamed';
  };

  const getDisplayDescription = (item: Record<string, unknown>): string => {
    if (item.jobTitle) return String(item.jobTitle);
    if (item.industry) return String(item.industry);
    if (item.description) return String(item.description);
    if (item.company) return String(item.company);
    if (item.email) return String(item.email);
    return '';
  };

  const displayName = getDisplayName(item);
  const displayDescription = getDisplayDescription(item);

  return (
    <div
      className={cn(
        "p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {entityType}
            </span>
          </div>
          {displayDescription && (
            <p className="text-sm text-gray-600 mt-1 truncate">
              {displayDescription}
            </p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            {(item.email as any) && (
              <span className="truncate">{String(item.email as any)}</span>
            )}
            {(item.phone as any) && (
              <span>{String(item.phone as any)}</span>
            )}
            {(item.createdAt as any) && (
              <span>{new Date(String(item.createdAt as any)).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
