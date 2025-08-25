import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export interface WebSocketMessage {
  type: 'contact_update' | 'dashboard_update' | 'notification' | 'search_update' | 'company_update' | 'activity_update' | 'pong' | 'analytics_event' | 'business_metrics' | 'user_behavior' | 'performance_metrics'
  payload: any
  timestamp: string
  userId: string
  tenantId: string
}

export interface WebSocketEvent {
  type: string
  data: any
}

export interface WebSocketConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
}

const DEFAULT_CONFIG: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8089/ws',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
}

export function useWebSocket(config: Partial<WebSocketConfig> = {}) {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messageQueueRef = useRef<WebSocketMessage[]>([])
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // Connection management
  const connect = useCallback(() => {
    if (!user || socketRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setIsConnecting(true)
    
    try {
      const wsUrl = `${finalConfig.url}?token=${localStorage.getItem('auth_token')}`
      const socket = new WebSocket(wsUrl)
      
      socket.onopen = () => {
        console.log('🔄 WebSocket connected')
        setIsConnected(true)
        setIsConnecting(false)
        setReconnectAttempts(0)
        
        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift()
          if (message) {
            socket.send(JSON.stringify(message))
          }
        }
        
        // Start heartbeat
        startHeartbeat(socket)
      }
      
      socket.onclose = (event) => {
        console.log('🔄 WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setIsConnecting(false)
        stopHeartbeat()
        
        // Attempt reconnection if not a clean close
        if (event.code !== 1000 && reconnectAttempts < finalConfig.maxReconnectAttempts) {
          scheduleReconnect()
        }
      }
      
      socket.onerror = (error) => {
        console.error('🔄 WebSocket error:', error)
        setIsConnecting(false)
        toast.error('Connection error. Attempting to reconnect...')
      }
      
      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          handleMessage(message)
        } catch (error) {
          console.error('🔄 Failed to parse WebSocket message:', error)
        }
      }
      
      socketRef.current = socket
    } catch (error) {
      console.error('🔄 Failed to create WebSocket connection:', error)
      setIsConnecting(false)
      scheduleReconnect()
    }
  }, [user, finalConfig, reconnectAttempts])

  // Disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close(1000, 'User initiated disconnect')
      socketRef.current = null
    }
    setIsConnected(false)
    setIsConnecting(false)
    stopHeartbeat()
    clearReconnectTimeout()
  }, [])

  // Send message
  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp' | 'userId' | 'tenantId'>) => {
    if (!user) return false
    
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date().toISOString(),
      userId: user.id,
      tenantId: user.tenantId,
    }
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(fullMessage))
      return true
    } else {
      // Queue message for later
      messageQueueRef.current.push(fullMessage)
      return false
    }
  }, [user])

  // Heartbeat management
  const startHeartbeat = useCallback((socket: WebSocket) => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
      }
    }, finalConfig.heartbeatInterval)
  }, [finalConfig.heartbeatInterval])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // Reconnection management
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts >= finalConfig.maxReconnectAttempts) {
      toast.error('Failed to reconnect. Please refresh the page.')
      return
    }
    
    clearReconnectTimeout()
    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts(prev => prev + 1)
      connect()
    }, finalConfig.reconnectInterval)
  }, [connect, finalConfig, reconnectAttempts])

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // Message handling
  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'contact_update':
        // Handle contact updates
        console.log('📞 Contact update received:', message.payload)
        break
      case 'dashboard_update':
        // Handle dashboard updates
        console.log('📊 Dashboard update received:', message.payload)
        break
      case 'notification':
        // Handle notifications
        console.log('🔔 Notification received:', message.payload)
        toast(message.payload.message, {
          icon: message.payload.type === 'success' ? '✅' : '⚠️',
        })
        break
      case 'search_update':
        // Handle search updates
        console.log('🔍 Search update received:', message.payload)
        break
      case 'company_update':
        // Handle company updates
        console.log('🏢 Company update received:', message.payload)
        break
      case 'activity_update':
        // Handle activity updates
        console.log('📈 Activity update received:', message.payload)
        break
      case 'pong':
        // Handle heartbeat response
        console.log('💓 Heartbeat response received')
        break
      default:
        console.log('🔄 Unknown message type:', message.type)
    }
  }, [])

  // Connection management effects
  useEffect(() => {
    if (user) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [user, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
      clearReconnectTimeout()
    }
  }, [disconnect, clearReconnectTimeout])

  return {
    isConnected,
    isConnecting,
    reconnectAttempts,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  }
}
