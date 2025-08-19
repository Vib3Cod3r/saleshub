// Comprehensive Version Registry System
// Tracks page versions, database schemas, migrations, and dependencies

export interface VersionDependency {
  id: string
  type: 'page' | 'database' | 'api' | 'component'
  version: string
  required: boolean
  compatibility: 'exact' | 'minimum' | 'range'
  minVersion?: string
  maxVersion?: string
}

export interface PageVersion {
  id: string
  name: string
  path: string
  version: string
  lastModified: string
  checksum: string
  dependencies: VersionDependency[]
  features: string[]
  status: 'active' | 'deprecated' | 'development' | 'error'
  metadata: Record<string, any>
  compatibilityMatrix: Record<string, string[]>
}

export interface DatabaseVersion {
  id: string
  name: string
  version: string
  lastModified: string
  migrationVersion: string
  schemaHash: string
  status: 'active' | 'migrating' | 'error' | 'rollback'
  schemaDefinition: Record<string, any>
  migrationHistory: MigrationRecord[]
  dependencies: VersionDependency[]
  metadata: Record<string, any>
}

export interface MigrationRecord {
  id: string
  version: string
  appliedAt: string
  checksum: string
  status: 'applied' | 'pending' | 'failed' | 'rolled_back'
  description: string
  rollbackScript?: string
}

export interface APIVersion {
  id: string
  name: string
  path: string
  method: string
  version: string
  lastModified: string
  checksum: string
  dependencies: VersionDependency[]
  status: 'active' | 'deprecated' | 'development'
  metadata: Record<string, any>
}

export interface VersionSnapshot {
  id: string
  timestamp: string
  environment: string
  pages: PageVersion[]
  databases: DatabaseVersion[]
  apis: APIVersion[]
  notes?: string
  checksum: string
  status: 'valid' | 'invalid' | 'partial'
  validationErrors: string[]
}

export interface VersionCompatibility {
  sourceId: string
  sourceType: 'page' | 'database' | 'api'
  targetId: string
  targetType: 'page' | 'database' | 'api'
  compatibility: 'compatible' | 'incompatible' | 'unknown'
  requiredVersion?: string
  testedVersions: string[]
  lastTested: string
}

export interface StartupValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  recommendations: string[]
  incompatibleComponents: string[]
  missingDependencies: string[]
  versionMismatches: Array<{
    component: string
    expected: string
    actual: string
    severity: 'critical' | 'warning' | 'info'
  }>
}

class VersionRegistry {
  private pageVersions: Map<string, PageVersion> = new Map()
  private databaseVersions: Map<string, DatabaseVersion> = new Map()
  private apiVersions: Map<string, APIVersion> = new Map()
  private snapshots: VersionSnapshot[] = []
  private compatibilityMatrix: Map<string, VersionCompatibility> = new Map()
  private maxSnapshots = 100
  private registryVersion = '2.0.0'

  constructor() {
    this.loadPersistedData()
    this.validateRegistryIntegrity()
  }

  // Core Registration Methods
  registerPage(page: Omit<PageVersion, 'lastModified'>): void {
    const pageVersion: PageVersion = {
      ...page,
      lastModified: new Date().toISOString(),
      metadata: page.metadata || {},
      compatibilityMatrix: page.compatibilityMatrix || {}
    }

    this.pageVersions.set(page.id, pageVersion)
    this.updateCompatibilityMatrix(pageVersion)
    this.persistData()
  }

  registerDatabase(db: Omit<DatabaseVersion, 'lastModified'>): void {
    const dbVersion: DatabaseVersion = {
      ...db,
      lastModified: new Date().toISOString(),
      migrationHistory: db.migrationHistory || [],
      dependencies: db.dependencies || [],
      metadata: db.metadata || {}
    }

    this.databaseVersions.set(db.id, dbVersion)
    this.updateCompatibilityMatrix(dbVersion)
    this.persistData()
  }

  registerAPI(api: Omit<APIVersion, 'lastModified'>): void {
    const apiVersion: APIVersion = {
      ...api,
      lastModified: new Date().toISOString(),
      dependencies: api.dependencies || [],
      metadata: api.metadata || {}
    }

    this.apiVersions.set(api.id, apiVersion)
    this.updateCompatibilityMatrix(apiVersion)
    this.persistData()
  }

  // Version Management
  updatePageVersion(pageId: string, updates: Partial<PageVersion>): void {
    const page = this.pageVersions.get(pageId)
    if (page) {
      const updatedPage = { ...page, ...updates, lastModified: new Date().toISOString() }
      this.pageVersions.set(pageId, updatedPage)
      this.updateCompatibilityMatrix(updatedPage)
      this.persistData()
    }
  }

  updateDatabaseVersion(dbId: string, updates: Partial<DatabaseVersion>): void {
    const db = this.databaseVersions.get(dbId)
    if (db) {
      const updatedDb = { ...db, ...updates, lastModified: new Date().toISOString() }
      this.databaseVersions.set(dbId, updatedDb)
      this.updateCompatibilityMatrix(updatedDb)
      this.persistData()
    }
  }

  // Migration Management
  addMigrationRecord(dbId: string, migration: MigrationRecord): void {
    const db = this.databaseVersions.get(dbId)
    if (db) {
      db.migrationHistory.push(migration)
      this.databaseVersions.set(dbId, db)
      this.persistData()
    }
  }

  updateMigrationStatus(dbId: string, migrationId: string, status: MigrationRecord['status']): void {
    const db = this.databaseVersions.get(dbId)
    if (db) {
      const migration = db.migrationHistory.find(m => m.id === migrationId)
      if (migration) {
        migration.status = status
        this.databaseVersions.set(dbId, db)
        this.persistData()
      }
    }
  }

  // Snapshot Management
  createSnapshot(environment: string, notes?: string): VersionSnapshot {
    const snapshot: VersionSnapshot = {
      id: `snapshot_${Date.now()}`,
      timestamp: new Date().toISOString(),
      environment,
      pages: Array.from(this.pageVersions.values()),
      databases: Array.from(this.databaseVersions.values()),
      apis: Array.from(this.apiVersions.values()),
      notes,
      checksum: this.generateSnapshotChecksum(),
      status: 'valid',
      validationErrors: []
    }

    // Validate snapshot
    const validation = this.validateSnapshot(snapshot)
    snapshot.status = validation.isValid ? 'valid' : 'invalid'
    snapshot.validationErrors = validation.errors

    this.snapshots.push(snapshot)
    
    // Keep only the last maxSnapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots)
    }

    this.persistData()
    return snapshot
  }

  // Compatibility Management
  private updateCompatibilityMatrix(component: PageVersion | DatabaseVersion | APIVersion): void {
    // Update compatibility matrix for this component
    component.dependencies.forEach(dep => {
      const compatibilityKey = `${component.id}_${dep.id}`
      const compatibility: VersionCompatibility = {
        sourceId: component.id,
        sourceType: this.getComponentType(component),
        targetId: dep.id,
        targetType: dep.type,
        compatibility: this.checkCompatibility(component, dep),
        requiredVersion: dep.version,
        testedVersions: [component.version],
        lastTested: new Date().toISOString()
      }
      
      this.compatibilityMatrix.set(compatibilityKey, compatibility)
    })
  }

  private getComponentType(component: PageVersion | DatabaseVersion | APIVersion): 'page' | 'database' | 'api' {
    if ('path' in component && 'method' in component) return 'api'
    if ('schemaDefinition' in component) return 'database'
    return 'page'
  }

  private checkCompatibility(component: PageVersion | DatabaseVersion | APIVersion, dep: VersionDependency): 'compatible' | 'incompatible' | 'unknown' {
    // Implement compatibility checking logic
    // This is a simplified version - in practice, you'd have more sophisticated logic
    return 'compatible'
  }

  // Startup Validation
  validateStartup(): StartupValidation {
    const validation: StartupValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: [],
      incompatibleComponents: [],
      missingDependencies: [],
      versionMismatches: []
    }

    // Check all components for missing dependencies
    const allComponents = [
      ...Array.from(this.pageVersions.values()),
      ...Array.from(this.databaseVersions.values()),
      ...Array.from(this.apiVersions.values())
    ]

    allComponents.forEach(component => {
      component.dependencies.forEach(dep => {
        const targetComponent = this.getComponentById(dep.id, dep.type)
        if (!targetComponent) {
          validation.missingDependencies.push(`${component.id} -> ${dep.id}`)
          validation.isValid = false
        } else if (!this.isVersionCompatible(targetComponent.version, dep)) {
          validation.versionMismatches.push({
            component: `${component.id} -> ${dep.id}`,
            expected: dep.version,
            actual: targetComponent.version,
            severity: dep.required ? 'critical' : 'warning'
          })
          if (dep.required) {
            validation.isValid = false
          }
        }
      })
    })

    // Check for deprecated components
    const deprecatedComponents = allComponents.filter(c => c.status === 'deprecated')
    if (deprecatedComponents.length > 0) {
      validation.warnings.push(`Found ${deprecatedComponents.length} deprecated components`)
      validation.recommendations.push('Consider updating or removing deprecated components')
    }

    // Check for components in error state
    const errorComponents = allComponents.filter(c => c.status === 'error')
    if (errorComponents.length > 0) {
      validation.errors.push(`Found ${errorComponents.length} components in error state`)
      validation.isValid = false
    }

    // Check for migrating databases
    const migratingDatabases = Array.from(this.databaseVersions.values()).filter(db => db.status === 'migrating')
    if (migratingDatabases.length > 0) {
      validation.warnings.push(`Found ${migratingDatabases.length} databases in migration state`)
      validation.recommendations.push('Complete database migrations before startup')
    }

    return validation
  }

  private getComponentById(id: string, type: string): PageVersion | DatabaseVersion | APIVersion | undefined {
    switch (type) {
      case 'page': return this.pageVersions.get(id)
      case 'database': return this.databaseVersions.get(id)
      case 'api': return this.apiVersions.get(id)
      default: return undefined
    }
  }

  private isVersionCompatible(actualVersion: string, dep: VersionDependency): boolean {
    switch (dep.compatibility) {
      case 'exact':
        return actualVersion === dep.version
      case 'minimum':
        return this.compareVersions(actualVersion, dep.version) >= 0
      case 'range':
        const minOk = !dep.minVersion || this.compareVersions(actualVersion, dep.minVersion) >= 0
        const maxOk = !dep.maxVersion || this.compareVersions(actualVersion, dep.maxVersion) <= 0
        return minOk && maxOk
      default:
        return true
    }
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0
      if (part1 !== part2) {
        return part1 - part2
      }
    }
    return 0
  }

  // Snapshot Validation
  private validateSnapshot(snapshot: VersionSnapshot): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check for missing components
    const allComponentIds = new Set([
      ...snapshot.pages.map(p => p.id),
      ...snapshot.databases.map(d => d.id),
      ...snapshot.apis.map(a => a.id)
    ])

    // Validate dependencies
    const allComponents = [...snapshot.pages, ...snapshot.databases, ...snapshot.apis]
    allComponents.forEach(component => {
      component.dependencies.forEach(dep => {
        if (!allComponentIds.has(dep.id)) {
          errors.push(`Missing dependency: ${component.id} -> ${dep.id}`)
        }
      })
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private generateSnapshotChecksum(): string {
    const data = JSON.stringify({
      pages: Array.from(this.pageVersions.values()),
      databases: Array.from(this.databaseVersions.values()),
      apis: Array.from(this.apiVersions.values()),
      timestamp: Date.now()
    })
    
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }

  // Registry Integrity
  private validateRegistryIntegrity(): void {
    // Check for orphaned compatibility entries
    const allComponentIds = new Set([
      ...Array.from(this.pageVersions.keys()),
      ...Array.from(this.databaseVersions.keys()),
      ...Array.from(this.apiVersions.keys())
    ])

    const orphanedEntries: string[] = []
    this.compatibilityMatrix.forEach((compatibility, key) => {
      if (!allComponentIds.has(compatibility.sourceId) || !allComponentIds.has(compatibility.targetId)) {
        orphanedEntries.push(key)
      }
    })

    // Clean up orphaned entries
    orphanedEntries.forEach(key => this.compatibilityMatrix.delete(key))
  }

  // Query Methods
  getActivePages(): PageVersion[] {
    return Array.from(this.pageVersions.values()).filter(page => page.status === 'active')
  }

  getActiveDatabases(): DatabaseVersion[] {
    return Array.from(this.databaseVersions.values()).filter(db => db.status === 'active')
  }

  getActiveAPIs(): APIVersion[] {
    return Array.from(this.apiVersions.values()).filter(api => api.status === 'active')
  }

  getDeprecatedComponents(): Array<PageVersion | DatabaseVersion | APIVersion> {
    return [
      ...Array.from(this.pageVersions.values()).filter(c => c.status === 'deprecated'),
      ...Array.from(this.databaseVersions.values()).filter(c => c.status === 'deprecated'),
      ...Array.from(this.apiVersions.values()).filter(c => c.status === 'deprecated')
    ]
  }

  getRecentSnapshots(limit: number = 10): VersionSnapshot[] {
    return this.snapshots.slice(-limit)
  }

  getComponentById(id: string): PageVersion | DatabaseVersion | APIVersion | undefined {
    return this.pageVersions.get(id) || this.databaseVersions.get(id) || this.apiVersions.get(id)
  }

  getCompatibilityMatrix(): VersionCompatibility[] {
    return Array.from(this.compatibilityMatrix.values())
  }

  // Export and Import
  exportRegistry(): string {
    return JSON.stringify({
      registryVersion: this.registryVersion,
      pageVersions: Array.from(this.pageVersions.entries()),
      databaseVersions: Array.from(this.databaseVersions.entries()),
      apiVersions: Array.from(this.apiVersions.entries()),
      snapshots: this.snapshots,
      compatibilityMatrix: Array.from(this.compatibilityMatrix.entries()),
      exportTimestamp: new Date().toISOString()
    }, null, 2)
  }

  importRegistry(data: string): void {
    try {
      const imported = JSON.parse(data)
      
      // Validate registry version compatibility
      if (imported.registryVersion !== this.registryVersion) {
        console.warn(`Registry version mismatch: expected ${this.registryVersion}, got ${imported.registryVersion}`)
      }

      // Import data
      this.pageVersions = new Map(imported.pageVersions || [])
      this.databaseVersions = new Map(imported.databaseVersions || [])
      this.apiVersions = new Map(imported.apiVersions || [])
      this.snapshots = imported.snapshots || []
      this.compatibilityMatrix = new Map(imported.compatibilityMatrix || [])

      this.validateRegistryIntegrity()
      this.persistData()
    } catch (error) {
      console.error('Failed to import registry:', error)
      throw new Error('Invalid registry data format')
    }
  }

  // Persistence
  private persistData(): void {
    if (typeof window !== 'undefined') {
      try {
        const data = {
          registryVersion: this.registryVersion,
          pageVersions: Array.from(this.pageVersions.entries()),
          databaseVersions: Array.from(this.databaseVersions.entries()),
          apiVersions: Array.from(this.apiVersions.entries()),
          snapshots: this.snapshots,
          compatibilityMatrix: Array.from(this.compatibilityMatrix.entries())
        }
        localStorage.setItem('version-registry', JSON.stringify(data))
      } catch (e) {
        console.warn('Failed to persist version registry:', e)
      }
    }
  }

  private loadPersistedData(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('version-registry')
        if (stored) {
          const data = JSON.parse(stored)
          
          // Load data with version compatibility check
          if (data.registryVersion === this.registryVersion) {
            this.pageVersions = new Map(data.pageVersions || [])
            this.databaseVersions = new Map(data.databaseVersions || [])
            this.apiVersions = new Map(data.apiVersions || [])
            this.snapshots = data.snapshots || []
            this.compatibilityMatrix = new Map(data.compatibilityMatrix || [])
          } else {
            console.warn('Registry version mismatch, starting fresh')
          }
        }
      } catch (e) {
        console.warn('Failed to load persisted version registry:', e)
      }
    }
  }

  // Utility Methods
  clearAll(): void {
    this.pageVersions.clear()
    this.databaseVersions.clear()
    this.apiVersions.clear()
    this.snapshots = []
    this.compatibilityMatrix.clear()
    this.persistData()
  }

  getRegistryStats(): {
    totalPages: number
    totalDatabases: number
    totalAPIs: number
    totalSnapshots: number
    activeComponents: number
    deprecatedComponents: number
    errorComponents: number
  } {
    const allComponents = [
      ...Array.from(this.pageVersions.values()),
      ...Array.from(this.databaseVersions.values()),
      ...Array.from(this.apiVersions.values())
    ]

    return {
      totalPages: this.pageVersions.size,
      totalDatabases: this.databaseVersions.size,
      totalAPIs: this.apiVersions.size,
      totalSnapshots: this.snapshots.length,
      activeComponents: allComponents.filter(c => c.status === 'active').length,
      deprecatedComponents: allComponents.filter(c => c.status === 'deprecated').length,
      errorComponents: allComponents.filter(c => c.status === 'error').length
    }
  }
}

// Create singleton instance
export const versionRegistry = new VersionRegistry()

// Export the class for direct instantiation if needed
export { VersionRegistry }

export default versionRegistry
