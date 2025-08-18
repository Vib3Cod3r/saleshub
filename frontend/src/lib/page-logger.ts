interface PageVersion {
  id: string
  name: string
  path: string
  version: string
  lastModified: string
  checksum: string
  dependencies: string[]
  features: string[]
  status: 'active' | 'deprecated' | 'development'
  metadata: Record<string, any>
}

interface PageLog {
  timestamp: string
  action: 'load' | 'navigate' | 'error' | 'version_change'
  pageId: string
  pageName: string
  pagePath: string
  version: string
  previousVersion?: string
  userAgent?: string
  sessionId?: string
  performance?: {
    loadTime: number
    renderTime: number
    totalTime: number
  }
  errors?: string[]
  details?: Record<string, any>
}

class PageLogger {
  private pageVersions: Map<string, PageVersion> = new Map()
  private pageLogs: PageLog[] = []
  private maxLogs = 1000
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.loadPersistedData()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Register a page version
  registerPage(page: Omit<PageVersion, 'lastModified'>): void {
    const pageVersion: PageVersion = {
      ...page,
      lastModified: new Date().toISOString()
    }

    this.pageVersions.set(page.id, pageVersion)
    this.persistPageVersions()
    
    // Log the registration
    this.logPageAction('version_change', {
      pageId: page.id,
      pageName: page.name,
      pagePath: page.path,
      version: page.version,
      details: { action: 'register', features: page.features }
    })
  }

  // Log page actions
  logPageAction(action: PageLog['action'], data: {
    pageId: string
    pageName: string
    pagePath: string
    version: string
    previousVersion?: string
    performance?: PageLog['performance']
    errors?: string[]
    details?: Record<string, any>
  }): void {
    const pageLog: PageLog = {
      timestamp: new Date().toISOString(),
      action,
      sessionId: this.sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...data
    }

    this.pageLogs.push(pageLog)
    
    // Keep only the last maxLogs entries
    if (this.pageLogs.length > this.maxLogs) {
      this.pageLogs = this.pageLogs.slice(-this.maxLogs)
    }

    this.persistPageLogs()

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`[PAGE_LOGGER] ${action.toUpperCase()}: ${data.pageName}`)
      console.log('Page ID:', data.pageId)
      console.log('Version:', data.version)
      console.log('Path:', data.pagePath)
      if (data.performance) {
        console.log('Performance:', data.performance)
      }
      if (data.errors?.length) {
        console.log('Errors:', data.errors)
      }
      console.groupEnd()
    }
  }

  // Log performance metrics
  logPerformance(metrics: { loadTime: number; renderTime: number; totalTime: number }): void {
    // This method is called by the hook but we don't need to do anything special here
    // The performance data is already being logged through logPageAction
    if (process.env.NODE_ENV === 'development') {
      console.log('[PAGE_LOGGER] Performance metrics:', metrics)
    }
  }

  // Get all page versions
  getPageVersions(): PageVersion[] {
    return Array.from(this.pageVersions.values())
  }

  // Get page version by ID
  getPageVersion(pageId: string): PageVersion | undefined {
    return this.pageVersions.get(pageId)
  }

  // Get page version by path
  getPageVersionByPath(path: string): PageVersion | undefined {
    return Array.from(this.pageVersions.values()).find(page => page.path === path)
  }

  // Get recent page logs
  getRecentLogs(limit: number = 50): PageLog[] {
    return this.pageLogs.slice(-limit)
  }

  // Get logs for a specific page
  getPageLogs(pageId: string, limit: number = 50): PageLog[] {
    return this.pageLogs
      .filter(log => log.pageId === pageId)
      .slice(-limit)
  }

  // Get active pages
  getActivePages(): PageVersion[] {
    return Array.from(this.pageVersions.values()).filter(page => page.status === 'active')
  }

  // Get deprecated pages
  getDeprecatedPages(): PageVersion[] {
    return Array.from(this.pageVersions.values()).filter(page => page.status === 'deprecated')
  }

  // Mark page as deprecated
  deprecatePage(pageId: string, reason?: string): void {
    const page = this.pageVersions.get(pageId)
    if (page) {
      page.status = 'deprecated'
      page.metadata.deprecationReason = reason
      page.metadata.deprecatedAt = new Date().toISOString()
      this.persistPageVersions()
      
      this.logPageAction('version_change', {
        pageId,
        pageName: page.name,
        pagePath: page.path,
        version: page.version,
        details: { action: 'deprecate', reason }
      })
    }
  }

  // Generate restart report
  generateRestartReport(): {
    activePages: PageVersion[]
    deprecatedPages: PageVersion[]
    recentActivity: PageLog[]
    recommendations: string[]
  } {
    const activePages = this.getActivePages()
    const deprecatedPages = this.getDeprecatedPages()
    const recentActivity = this.getRecentLogs(20)
    
    const recommendations: string[] = []
    
    // Check for pages with recent errors
    const pagesWithErrors = recentActivity.filter(log => log.errors?.length)
    if (pagesWithErrors.length > 0) {
      recommendations.push(`Found ${pagesWithErrors.length} pages with recent errors. Review before restart.`)
    }
    
    // Check for deprecated pages that are still being accessed
    const deprecatedPageIds = new Set(deprecatedPages.map(p => p.id))
    const deprecatedPageAccess = recentActivity.filter(log => deprecatedPageIds.has(log.pageId))
    if (deprecatedPageAccess.length > 0) {
      recommendations.push(`Found ${deprecatedPageAccess.length} accesses to deprecated pages. Consider migration.`)
    }
    
    // Check for performance issues
    const slowPages = recentActivity.filter(log => 
      log.performance && log.performance.loadTime > 3000
    )
    if (slowPages.length > 0) {
      recommendations.push(`Found ${slowPages.length} pages with load times > 3s. Consider optimization.`)
    }

    return {
      activePages,
      deprecatedPages,
      recentActivity,
      recommendations
    }
  }

  // Export data for backup
  exportData(): string {
    return JSON.stringify({
      pageVersions: Array.from(this.pageVersions.entries()),
      pageLogs: this.pageLogs,
      sessionId: this.sessionId,
      exportTimestamp: new Date().toISOString()
    }, null, 2)
  }

  // Clear logs
  clearLogs(): void {
    this.pageLogs = []
    this.persistPageLogs()
  }

  // Clear all data
  clearAll(): void {
    this.pageVersions.clear()
    this.pageLogs = []
    this.persistPageVersions()
    this.persistPageLogs()
  }

  private persistPageVersions(): void {
    if (typeof window !== 'undefined') {
      try {
        const data = Array.from(this.pageVersions.entries())
        localStorage.setItem('page-versions', JSON.stringify(data))
      } catch (e) {
        console.warn('Failed to persist page versions:', e)
      }
    }
  }

  private persistPageLogs(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('page-logs', JSON.stringify(this.pageLogs))
      } catch (e) {
        console.warn('Failed to persist page logs:', e)
      }
    }
  }

  private loadPersistedData(): void {
    if (typeof window !== 'undefined') {
      try {
        // Load page versions
        const storedVersions = localStorage.getItem('page-versions')
        if (storedVersions) {
          const data = JSON.parse(storedVersions)
          this.pageVersions = new Map(data)
        }

        // Load page logs
        const storedLogs = localStorage.getItem('page-logs')
        if (storedLogs) {
          this.pageLogs = JSON.parse(storedLogs)
        }
      } catch (e) {
        console.warn('Failed to load persisted page data:', e)
      }
    }
  }
}

// Create singleton instance
export const pageLogger = new PageLogger()

// Auto-register pages on navigation (if in browser)
if (typeof window !== 'undefined') {
  // Track page loads
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = function(...args) {
    originalPushState.apply(history, args)
    trackPageNavigation()
  }

  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args)
    trackPageNavigation()
  }

  window.addEventListener('popstate', trackPageNavigation)

  function trackPageNavigation() {
    const path = window.location.pathname
    const pageName = path.split('/').filter(Boolean).pop() || 'home'
    
    pageLogger.logPageAction('navigate', {
      pageId: `page_${path.replace(/\//g, '_')}`,
      pageName: pageName.charAt(0).toUpperCase() + pageName.slice(1),
      pagePath: path,
      version: '1.0.0', // Default version, should be updated by individual pages
      details: { action: 'navigation' }
    })
  }

  // Track initial page load
  trackPageNavigation()
}

export default pageLogger
