import { useState, useCallback, useMemo } from 'react'

interface VirtualizedListOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
  threshold?: number
}

interface VirtualizedItem<T> {
  index: number
  data: T
  style: React.CSSProperties
}

export function useVirtualizedList<T>(
  items: T[],
  options: VirtualizedListOptions
) {
  const { itemHeight, containerHeight, overscan = 5, threshold = 100 } = options

  const [scrollTop, setScrollTop] = useState(0)

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  // Get visible items
  const visibleItems = useMemo(() => {
    const virtualizedItems: VirtualizedItem<T>[] = []
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      virtualizedItems.push({
        index: i,
        data: items[i],
        style: {
          position: 'absolute',
          top: i * itemHeight,
          height: itemHeight,
          width: '100%',
        },
      })
    }
    return virtualizedItems
  }, [visibleRange, items, itemHeight])

  // Calculate total height
  const totalHeight = items.length * itemHeight

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  // Check if virtualization is needed
  const shouldVirtualize = items.length > threshold

  // Get container style
  const containerStyle: React.CSSProperties = {
    height: containerHeight,
    overflow: 'auto',
    position: 'relative',
  }

  // Get content style
  const contentStyle: React.CSSProperties = {
    height: totalHeight,
    position: 'relative',
  }

  return {
    visibleItems,
    containerStyle,
    contentStyle,
    handleScroll,
    shouldVirtualize,
    totalHeight,
    visibleRange,
  }
}
