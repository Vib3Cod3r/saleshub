/**
 * Status utilities for consistent status handling across components
 */

import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Clock,
  Info,
  AlertCircle
} from 'lucide-react'

export interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  textColor: string
}

export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  active: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  loading: {
    icon: RefreshCw,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  pending: {
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700'
  },
  deprecated: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  migrating: {
    icon: RefreshCw,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  }
}

/**
 * Gets status configuration for a given status
 */
export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIGS[status.toLowerCase()] || STATUS_CONFIGS.info
}

/**
 * Gets status icon component for a given status
 */
export function getStatusIcon(status: string) {
  const config = getStatusConfig(status)
  return config.icon
}

/**
 * Gets status colors for a given status
 */
export function getStatusColors(status: string) {
  const config = getStatusConfig(status)
  return {
    color: config.color,
    bgColor: config.bgColor,
    textColor: config.textColor
  }
}



/**
 * HTTP status code to status mapping
 */
export const HTTP_STATUS_MAP: Record<number, string> = {
  200: 'success',
  201: 'success',
  204: 'success',
  400: 'error',
  401: 'error',
  403: 'error',
  404: 'error',
  500: 'error',
  502: 'error',
  503: 'error'
}

/**
 * Gets status for HTTP status code
 */
export function getStatusFromHTTPCode(code: number): string {
  return HTTP_STATUS_MAP[code] || 'info'
}
