import { useState, useEffect, useCallback } from 'react'

export interface PerformanceMetrics {
  pageLoadTime: number
  renderTime: number
  memoryUsage: {
    used: number
    total: number
    limit: number
  } | null
  networkLatency: number
  frameRate: number
  interactionDelay: number
}

export interface PerformanceThresholds {
  pageLoadTime: number
  renderTime: number
  memoryUsage: number
  networkLatency: number
  frameRate: number
  interactionDelay: number
}

export interface PerformanceAlert {
  type: 'warning' | 'error'
  metric: keyof PerformanceMetrics
  value: number
  threshold: number
  message: string
  timestamp: Date
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  pageLoadTime: 3000,
  renderTime: 100,
  memoryUsage: 50 * 1024 * 1024, // 50MB
  networkLatency: 1000,
  frameRate: 30,
  interactionDelay: 100,
}

export function usePerformanceMonitor(
  thresholds: Partial<PerformanceThresholds> = {}
) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    renderTime: 0,
    memoryUsage: null,
    networkLatency: 0,
    frameRate: 0,
    interactionDelay: 0,
  })

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds }

  // Measure page load time
  const measurePageLoadTime = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart
        setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }))
        return loadTime
      }
    }
    return 0
  }, [])

  // Measure memory usage
  const measureMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      const memoryData = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      }
      setMetrics(prev => ({ ...prev, memoryUsage: memoryData }))
      return memoryData
    }
    return null
  }, [])

  // Measure render time
  const measureRenderTime = useCallback(() => {
    const start = performance.now()
    return () => {
      const end = performance.now()
      const renderTime = end - start
      setMetrics(prev => ({ ...prev, renderTime }))
      return renderTime
    }
  }, [])

  // Measure network latency
  const measureNetworkLatency = useCallback(async () => {
    const start = performance.now()
    try {
      await fetch('/api/health', { method: 'HEAD' })
      const end = performance.now()
      const latency = end - start
      setMetrics(prev => ({ ...prev, networkLatency: latency }))
      return latency
    } catch (error) {
      console.warn('Failed to measure network latency:', error)
      return 0
    }
  }, [])

  // Measure frame rate
  const measureFrameRate = useCallback(() => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const countFrame = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        setMetrics(prev => ({ ...prev, frameRate: fps }))
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(countFrame)
    }
    
    return requestAnimationFrame(countFrame)
  }, [])

  // Check performance thresholds and generate alerts
  const checkThresholds = useCallback((currentMetrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = []

    Object.entries(finalThresholds).forEach(([metric, threshold]) => {
      const value = currentMetrics[metric as keyof PerformanceMetrics]
      
      if (typeof value === 'number' && value > threshold) {
        const alert: PerformanceAlert = {
          type: value > threshold * 1.5 ? 'error' : 'warning',
          metric: metric as keyof PerformanceMetrics,
          value,
          threshold,
          message: `${metric} exceeded threshold: ${value} > ${threshold}`,
          timestamp: new Date(),
        }
        newAlerts.push(alert)
      }
    })

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts])
    }
  }, [finalThresholds])

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    
    // Initial measurements
    measurePageLoadTime()
    measureMemoryUsage()
    measureNetworkLatency()
    
    // Start frame rate monitoring
    const frameRateId = measureFrameRate()
    
    // Set up periodic measurements
    const interval = setInterval(() => {
      measureMemoryUsage()
      measureNetworkLatency()
      checkThresholds(metrics)
    }, 5000) // Check every 5 seconds
    
    return () => {
      clearInterval(interval)
      cancelAnimationFrame(frameRateId)
    }
  }, [measurePageLoadTime, measureMemoryUsage, measureNetworkLatency, measureFrameRate, checkThresholds, metrics])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  // Get performance score (0-100)
  const getPerformanceScore = useCallback(() => {
    let score = 100
    
    Object.entries(metrics).forEach(([metric, value]) => {
      if (typeof value === 'number' && metric !== 'frameRate') {
        const threshold = finalThresholds[metric as keyof PerformanceThresholds]
        if (value > threshold) {
          score -= Math.min(20, (value - threshold) / threshold * 20)
        }
      }
    })
    
    return Math.max(0, Math.round(score))
  }, [metrics, finalThresholds])

  useEffect(() => {
    if (isMonitoring) {
      return startMonitoring()
    }
  }, [isMonitoring, startMonitoring])

  return {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    measureRenderTime,
    getPerformanceScore,
  }
}
