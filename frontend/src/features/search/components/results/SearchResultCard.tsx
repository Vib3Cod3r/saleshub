import React from 'react';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../../../shared/utils/cn';
import { highlightText } from '../../../../shared/utils/search';

interface SearchResultCardProps {
  item: Record<string, unknown>;
  query?: string;
  onClick?: () => void;
  className?: string;
  showActions?: boolean;
}

const ENTITY_ICONS = {
  Contact: UserIcon,
  Company: BuildingOfficeIcon,
  Deal: CurrencyDollarIcon,
  Lead: UserGroupIcon,
  Task: CheckCircleIcon,
};

const ENTITY_COLORS = {
  Contact: 'bg-blue-100 text-blue-800',
  Company: 'bg-green-100 text-green-800',
  Deal: 'bg-purple-100 text-purple-800',
  Lead: 'bg-orange-100 text-orange-800',
  Task: 'bg-gray-100 text-gray-800',
};

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  item,
  query = '',
  onClick,
  className,
  showActions = true
}) => {
  const entityType = item.entityType as string || 'Contact';
  const IconComponent = ENTITY_ICONS[entityType as keyof typeof ENTITY_ICONS] || UserIcon;
  const colorClass = ENTITY_COLORS[entityType as keyof typeof ENTITY_COLORS] || 'bg-gray-100 text-gray-800';

  const formatValue = (value: unknown, field: string): string => {
    if (value === null || value === undefined) return '';
    
    if (field === 'createdAt' || field === 'updatedAt') {
      return new Date(value as string).toLocaleDateString();
    }
    
    if (field === 'amount' || field === 'value') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(Number(value));
    }
    
    return String(value);
  };

  const getPrimaryField = (): string => {
    const nameFields = ['name', 'firstName', 'title', 'companyName'];
    for (const field of nameFields) {
      if (item[field]) {
        return formatValue(item[field], field);
      }
    }
    return 'Unnamed';
  };

  const getSecondaryField = (): string => {
    const secondaryFields = ['email', 'company', 'phone', 'status'];
    for (const field of secondaryFields) {
      if (item[field]) {
        return formatValue(item[field], field);
      }
    }
    return '';
  };

  const getStatusBadge = () => {
    const status = item.status as string;
    if (!status) return null;

    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      open: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
      )}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = () => {
    const priority = item.priority as string;
    if (!priority) return null;

    const priorityColors: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };

    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        priorityColors[priority.toLowerCase()] || 'bg-gray-100 text-gray-800'
      )}>
        {priority}
      </span>
    );
  };

  const renderContactInfo = () => {
    const contactFields = [];
    
    if (item.email) {
      contactFields.push(
        <div key="email" className="flex items-center text-sm text-gray-600">
          <EnvelopeIcon className="h-4 w-4 mr-1" />
          <span>{formatValue(item.email, 'email')}</span>
        </div>
      );
    }
    
    if (item.phone) {
      contactFields.push(
        <div key="phone" className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-1" />
          <span>{formatValue(item.phone, 'phone')}</span>
        </div>
      );
    }
    
    if (item.address || item.city) {
      contactFields.push(
        <div key="location" className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span>{[item.address, item.city, item.state].filter(Boolean).join(', ')}</span>
        </div>
      );
    }
    
    return contactFields;
  };

  const renderDealInfo = () => {
    const dealFields = [];
    
    if (item.amount || item.value) {
      dealFields.push(
        <div key="amount" className="text-lg font-semibold text-green-600">
          {formatValue(item.amount || item.value, 'amount')}
        </div>
      );
    }
    
    if (item.stage) {
      dealFields.push(
        <div key="stage" className="text-sm text-gray-600">
          Stage: {formatValue(item.stage, 'stage')}
        </div>
      );
    }
    
    return dealFields;
  };

  const renderCompanyInfo = () => {
    const companyFields = [];
    
    if (item.industry) {
      companyFields.push(
        <div key="industry" className="text-sm text-gray-600">
          Industry: {formatValue(item.industry, 'industry')}
        </div>
      );
    }
    
    if (item.size) {
      companyFields.push(
        <div key="size" className="text-sm text-gray-600">
          Size: {formatValue(item.size, 'size')}
        </div>
      );
    }
    
    return companyFields;
  };

  const renderEntitySpecificInfo = () => {
    switch (entityType) {
      case 'Contact':
        return renderContactInfo();
      case 'Deal':
        return renderDealInfo();
      case 'Company':
        return renderCompanyInfo();
      default:
        return null;
    }
  };

  const primaryText = getPrimaryField();
  const secondaryText = getSecondaryField();
  const highlightedPrimary = query ? highlightText(primaryText, query) : primaryText;
  const highlightedSecondary = query && secondaryText ? highlightText(secondaryText, query) : secondaryText;

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          colorClass
        )}>
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 
                className="text-sm font-medium text-gray-900 truncate"
                dangerouslySetInnerHTML={{ __html: highlightedPrimary }}
              />
              {secondaryText && (
                <p 
                  className="text-sm text-gray-500 truncate mt-1"
                  dangerouslySetInnerHTML={{ __html: highlightedSecondary }}
                />
              )}
            </div>
            
            {/* Badges */}
            <div className="flex items-center space-x-2 ml-2">
              {getStatusBadge()}
              {getPriorityBadge()}
            </div>
          </div>

          {/* Entity-specific info */}
          <div className="mt-2 space-y-1">
            {renderEntitySpecificInfo()}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {(item.createdAt as any) && (
                <div className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  Created {formatValue(item.createdAt as any, 'createdAt')}
                </div>
              )}
              {(item.updatedAt as any) && (
                <div className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  Updated {formatValue(item.updatedAt as any, 'updatedAt')}
                </div>
              )}
            </div>
            
            {/* Score/Relevance */}
            {(item.score as any) && (
              <div className="flex items-center">
                <StarIcon className="h-3 w-3 mr-1" />
                {Math.round(Number(item.score as any) * 100)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View Details
          </button>
          <button className="text-xs text-gray-600 hover:text-gray-700">
            Edit
          </button>
          <button className="text-xs text-gray-600 hover:text-gray-700">
            Quick Actions
          </button>
        </div>
      )}
    </div>
  );
};
