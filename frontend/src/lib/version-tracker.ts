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
}

interface DatabaseVersion {
  id: string
  name: string
  version: string
  lastModified: string
  migrationVersion?: string
  schemaHash?: string
  status: 'active' | 'migrating' | 'error'
}

interface VersionSnapshot {
  timestamp: string
  pages: PageVersion[]
  database: DatabaseVersion[]
  environment: string
  notes?: string
}

class VersionTracker {
  private pageVersions: Map<string, PageVersion> = new Map()
  private databaseVersions: Map<string, DatabaseVersion> = new Map()
  private snapshots: VersionSnapshot[] = []
  private maxSnapshots = 50

  constructor() {
    this.loadPersistedData()
  }

  // Register a page version
  registerPage(page: Omit<PageVersion, 'lastModified'>): void {
    const pageVersion: PageVersion = {
      ...page,
      lastModified: new Date().toISOString()
    }

    this.pageVersions.set(page.id, pageVersion)
    this.persistData()
  }

  // Register a database version
  registerDatabase(db: Omit<DatabaseVersion, 'lastModified'>): void {
    const dbVersion: DatabaseVersion = {
      ...db,
      lastModified: new Date().toISOString()
    }

    this.databaseVersions.set(db.id, dbVersion)
    this.persistData()
  }

  // Mark a page as deprecated
  deprecatePage(pageId: string, reason?: string): void {
    const page = this.pageVersions.get(pageId)
    if (page) {
      page.status = 'deprecated'
      this.persistData()
    }
  }

  // Mark a database as migrating
  markDatabaseMigrating(dbId: string): void {
    const db = this.databaseVersions.get(dbId)
    if (db) {
      db.status = 'migrating'
      this.persistData()
    }
  }

  // Create a snapshot of current versions
  createSnapshot(environment: string, notes?: string): void {
    const snapshot: VersionSnapshot = {
      timestamp: new Date().toISOString(),
      pages: Array.from(this.pageVersions.values()),
      database: Array.from(this.databaseVersions.values()),
      environment,
      notes
    }

    this.snapshots.push(snapshot)
    
    // Keep only the last maxSnapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots)
    }

    this.persistData()
  }

  // Get current active pages
  getActivePages(): PageVersion[] {
    return Array.from(this.pageVersions.values()).filter(page => page.status === 'active')
  }

  // Get current active databases
  getActiveDatabases(): DatabaseVersion[] {
    return Array.from(this.databaseVersions.values()).filter(db => db.status === 'active')
  }

  // Get deprecated pages
  getDeprecatedPages(): PageVersion[] {
    return Array.from(this.pageVersions.values()).filter(page => page.status === 'deprecated')
  }

  // Get recent snapshots
  getRecentSnapshots(limit: number = 10): VersionSnapshot[] {
    return this.snapshots.slice(-limit)
  }

  // Get version by ID
  getPageVersion(pageId: string): PageVersion | undefined {
    return this.pageVersions.get(pageId)
  }

  getDatabaseVersion(dbId: string): DatabaseVersion | undefined {
    return this.databaseVersions.get(dbId)
  }

  // Generate restart report
  generateRestartReport(): {
    activePages: PageVersion[]
    deprecatedPages: PageVersion[]
    activeDatabases: DatabaseVersion[]
    recommendations: string[]
    lastSnapshot?: VersionSnapshot
  } {
    const activePages = this.getActivePages()
    const deprecatedPages = this.getDeprecatedPages()
    const activeDatabases = this.getActiveDatabases()
    const lastSnapshot = this.snapshots[this.snapshots.length - 1]
    
    const recommendations: string[] = []
    
    // Check for deprecated pages
    if (deprecatedPages.length > 0) {
      recommendations.push(`Found ${deprecatedPages.length} deprecated pages. Consider removing or updating them.`)
    }
    
    // Check for migrating databases
    const migratingDbs = Array.from(this.databaseVersions.values()).filter(db => db.status === 'migrating')
    if (migratingDbs.length > 0) {
      recommendations.push(`Found ${migratingDbs.length} databases in migration state. Complete migrations before restart.`)
    }
    
    // Check for databases with errors
    const errorDbs = Array.from(this.databaseVersions.values()).filter(db => db.status === 'error')
    if (errorDbs.length > 0) {
      recommendations.push(`Found ${errorDbs.length} databases with errors. Resolve issues before restart.`)
    }

    return {
      activePages,
      deprecatedPages,
      activeDatabases,
      recommendations,
      lastSnapshot
    }
  }

  // Export all data
  exportData(): string {
    return JSON.stringify({
      pageVersions: Array.from(this.pageVersions.entries()),
      databaseVersions: Array.from(this.databaseVersions.entries()),
      snapshots: this.snapshots,
      exportTimestamp: new Date().toISOString()
    }, null, 2)
  }

  // Clear all data
  clearAll(): void {
    this.pageVersions.clear()
    this.databaseVersions.clear()
    this.snapshots = []
    this.persistData()
  }

  private persistData(): void {
    if (typeof window !== 'undefined') {
      try {
        const data = {
          pageVersions: Array.from(this.pageVersions.entries()),
          databaseVersions: Array.from(this.databaseVersions.entries()),
          snapshots: this.snapshots
        }
        localStorage.setItem('version-tracker', JSON.stringify(data))
      } catch (e) {
        console.warn('Failed to persist version data:', e)
      }
    }
  }

  private loadPersistedData(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('version-tracker')
        if (stored) {
          const data = JSON.parse(stored)
          this.pageVersions = new Map(data.pageVersions || [])
          this.databaseVersions = new Map(data.databaseVersions || [])
          this.snapshots = data.snapshots || []
        }
      } catch (e) {
        console.warn('Failed to load persisted version data:', e)
      }
    }
  }
}

// Create singleton instance
export const versionTracker = new VersionTracker()

export default versionTracker
