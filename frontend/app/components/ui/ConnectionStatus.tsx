'use client'

import { useWebSocket } from '@/hooks/useWebSocket'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'

export function ConnectionStatus() {
  const { isConnected, isConnecting, reconnectAttempts } = useWebSocket()

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <Wifi className="w-4 h-4" />
        <span className="text-sm font-medium">Connected</span>
      </div>
    )
  }

  if (isConnecting) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">Connecting...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-red-600">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">
        Disconnected
        {reconnectAttempts > 0 && ` (${reconnectAttempts})`}
      </span>
    </div>
  )
}
