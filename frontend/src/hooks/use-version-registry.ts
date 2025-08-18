import { useCallback, useEffect, useRef, useState } from 'react'
import { VersionRegistry } from '@/lib/version-registry'
import { logRegistryError } from '@/lib/cursor-error-tracker'
import { 
  PageVersion, 
  DatabaseVersion, 
  APIVersion, 
  VersionSnapshot,
  ComponentStatus,
  CompatibilityMatrix
} from '@/lib/version-registry'

export interface UseVersionRegistryOptions {
  autoValidate?: boolean
  validateOnMount?: boolean
}

export interface UseVersionRegistryReturn {
  // Registry state
  activePages: PageVersion[]
  activeDatabases: DatabaseVersion[]
  activeAPIs: APIVersion[]
  deprecatedComponents: Array<PageVersion | DatabaseVersion | APIVersion>
  recentSnapshots: VersionSnapshot[]
  registryStats: ReturnType<typeof versionRegistry.getRegistryStats>
  
  // Validation state
  startupValidation: StartupValidation | null
  isValidating: boolean
  
  // Actions
  registerPage: (page: Omit<PageVersion, 'lastModified'>) => void
  registerDatabase: (db: Omit<DatabaseVersion, 'lastModified'>) => void
  registerAPI: (api: Omit<APIVersion, 'lastModified'>) => void
  updatePageVersion: (pageId: string, updates: Partial<PageVersion>) => void
  updateDatabaseVersion: (dbId: string, updates: Partial<DatabaseVersion>) => void
  createSnapshot: (environment: string, notes?: string) => VersionSnapshot
  validateStartup: () => StartupValidation
  exportRegistry: () => string
  importRegistry: (data: string) => void
  clearRegistry: () => void
  
  // Query methods
  getComponentById: (id: string) => PageVersion | DatabaseVersion | APIVersion | undefined
  getCompatibilityMatrix: () => VersionCompatibility[]
  
  // Migration management
  addMigrationRecord: (dbId: string, migration: any) => void
  updateMigrationStatus: (dbId: string, migrationId: string, status: any) => void
  
  // Error handling
  error: string | null
  clearError: () => void
}

export function useVersionRegistry(options: {
  autoValidate?: boolean
  validateOnMount?: boolean
} = {}) {
  const { autoValidate = true, validateOnMount = true } = options
  
  // Use refs for stable references to prevent infinite loops
  const versionRegistryRef = useRef<VersionRegistry>(new VersionRegistry())
  const autoValidateRef = useRef(autoValidate)
  const validateOnMountRef = useRef(validateOnMount)
  
  // Update refs when options change
  useEffect(() => {
    autoValidateRef.current = autoValidate
    validateOnMountRef.current = validateOnMount
  }, [autoValidate, validateOnMount])

  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [startupValidation, setStartupValidation] = useState<{
    isValid: boolean
    issues: string[]
    timestamp: Date
  } | null>(null)

  // State for registry data
  const [activePages, setActivePages] = useState<PageVersion[]>([])
  const [activeDatabases, setActiveDatabases] = useState<DatabaseVersion[]>([])
  const [activeAPIs, setActiveAPIs] = useState<APIVersion[]>([])
  const [deprecatedComponents, setDeprecatedComponents] = useState<Array<PageVersion | DatabaseVersion | APIVersion>>([])
  const [recentSnapshots, setRecentSnapshots] = useState<VersionSnapshot[]>([])
  const [registryStats, setRegistryStats] = useState<{
    totalPages: number
    totalDatabases: number
    totalAPIs: number
    totalSnapshots: number
    lastUpdated: Date
  }>({
    totalPages: 0,
    totalDatabases: 0,
    totalAPIs: 0,
    totalSnapshots: 0,
    lastUpdated: new Date()
  })

  // Stable update function using ref
  const updateRegistryState = useCallback(() => {
    try {
      const registry = versionRegistryRef.current
      setActivePages(registry.getActivePages())
      setActiveDatabases(registry.getActiveDatabases())
      setActiveAPIs(registry.getActiveAPIs())
      setDeprecatedComponents(registry.getDeprecatedComponents())
      setRecentSnapshots(registry.getRecentSnapshots())
      setRegistryStats(registry.getRegistryStats())
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown registry error'
      logRegistryError(errorMessage, 'updateRegistryState', 'getRegistryStats')
      console.error('Error updating registry state:', error)
    }
  }, [])

  // Stable validation function using ref
  const validateStartup = useCallback(async () => {
    if (isValidating) return
    
    setIsValidating(true)
    try {
      const registry = versionRegistryRef.current
      const validation = await registry.validateStartup()
      setStartupValidation(validation)
      
      if (!validation.isValid) {
        setError(`Startup validation failed: ${validation.issues.join(', ')}`)
      } else {
        setError(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed'
      setError(errorMessage)
      setStartupValidation({
        isValid: false,
        issues: [errorMessage],
        timestamp: new Date()
      })
    } finally {
      setIsValidating(false)
    }
  }, [isValidating])

  // Registration functions with stable dependencies
  const registerPage = useCallback((page: Omit<PageVersion, 'lastModified'>) => {
    try {
      setError(null)
      versionRegistryRef.current.registerPage(page)
      updateRegistryState()
      
      if (autoValidateRef.current) {
        validateStartup()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register page'
      setError(errorMessage)
      throw err
    }
  }, [updateRegistryState, validateStartup])

  const registerDatabase = useCallback((db: Omit<DatabaseVersion, 'lastModified'>) => {
    try {
      setError(null)
      versionRegistryRef.current.registerDatabase(db)
      updateRegistryState()
      
      if (autoValidateRef.current) {
        validateStartup()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register database'
      setError(errorMessage)
      throw err
    }
  }, [updateRegistryState, validateStartup])

  const registerAPI = useCallback((api: Omit<APIVersion, 'lastModified'>) => {
    try {
      setError(null)
      versionRegistryRef.current.registerAPI(api)
      updateRegistryState()
      
      if (autoValidateRef.current) {
        validateStartup()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register API'
      setError(errorMessage)
      throw err
    }
  }, [updateRegistryState, validateStartup])

  // Update functions with stable dependencies
  const updatePageVersion = useCallback((pageId: string, updates: Partial<PageVersion>) => {
    try {
      setError(null)
      versionRegistryRef.current.updatePageVersion(pageId, updates)
      updateRegistryState()
      
      if (autoValidateRef.current) {
        validateStartup()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update page version'
      setError(errorMessage)
      throw err
    }
  }, [updateRegistryState, validateStartup])

  const updateDatabaseVersion = useCallback((dbId: string, updates: Partial<DatabaseVersion>) => {
    try {
      setError(null)
      versionRegistryRef.current.updateDatabaseVersion(dbId, updates)
      updateRegistryState()
      
      if (autoValidateRef.current) {
        validateStartup()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update database version'
      setError(errorMessage)
      throw err
    }
  }, [updateRegistryState, validateStartup])

  // Snapshot functions
  const createSnapshot = useCallback((environment: string, notes?: string): VersionSnapshot => {
    try {
      setError(null)
      const snapshot = versionRegistryRef.current.createSnapshot(environment, notes)
      updateRegistryState()
      return snapshot
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create snapshot'
      setError(errorMessage)
      throw err
    }
  }, [updateRegistryState])

  // Export/Import functions
  const exportRegistry = useCallback((): string => {
    try {
      setError(null)
      return versionRegistryRef.current.exportRegistry()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export registry'
      setError(errorMessage)
      throw err
    }
  }, [])

  const importRegistry = useCallback((data: string): void => {
    try {
      setError(null)
      versionRegistryRef.current.importRegistry(data)
      updateRegistryState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import registry'
      setError(errorMessage)
      throw err
    }
  }, [updateRegistryState])

  const clearRegistry = useCallback((): void => {
    try {
      setError(null)
      versionRegistryRef.current.clearRegistry()
      updateRegistryState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear registry'
      setError(errorMessage)
      throw err
    }
  }, [updateRegistryState])

  // Query methods
  const getComponentById = useCallback((id: string): PageVersion | DatabaseVersion | APIVersion | null => {
    try {
      return versionRegistryRef.current.getComponentById(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get component'
      setError(errorMessage)
      return null
    }
  }, [])

  const getCompatibilityMatrix = useCallback((): CompatibilityMatrix => {
    try {
      return versionRegistryRef.current.getCompatibilityMatrix()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get compatibility matrix'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Migration management
  const addMigrationRecord = useCallback((migration: {
    fromVersion: string
    toVersion: string
    componentId: string
    componentType: 'page' | 'database' | 'api'
    timestamp: Date
    status: 'pending' | 'in-progress' | 'completed' | 'failed'
    notes?: string
  }): void => {
    try {
      setError(null)
      versionRegistryRef.current.addMigrationRecord(migration)
      updateRegistryState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add migration record'
      setError(errorMessage)
      throw err
    }
  }, [updateRegistryState])

  const updateMigrationStatus = useCallback((migrationId: string, status: 'pending' | 'in-progress' | 'completed' | 'failed', notes?: string): void => {
    try {
      setError(null)
      versionRegistryRef.current.updateMigrationStatus(migrationId, status, notes)
      updateRegistryState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update migration status'
      setError(errorMessage)
      throw err
    }
  }, [updateRegistryState])

  // Error handling
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initialize on mount
  useEffect(() => {
    // Use refs to avoid dependency issues
    const registry = versionRegistryRef.current
    try {
      setActivePages(registry.getActivePages())
      setActiveDatabases(registry.getActiveDatabases())
      setActiveAPIs(registry.getActiveAPIs())
      setDeprecatedComponents(registry.getDeprecatedComponents())
      setRecentSnapshots(registry.getRecentSnapshots())
      setRegistryStats(registry.getRegistryStats())
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown registry error'
      logRegistryError(errorMessage, 'initialize', 'getRegistryStats')
      console.error('Error initializing registry state:', error)
    }
    
    if (validateOnMountRef.current) {
      // Run validation without triggering state updates that could cause loops
      setTimeout(() => {
        validateStartup()
      }, 0)
    }
  }, []) // Empty dependency array to run only once on mount

  return {
    // Registry state
    activePages,
    activeDatabases,
    activeAPIs,
    deprecatedComponents,
    recentSnapshots,
    registryStats,
    
    // Validation state
    startupValidation,
    isValidating,
    
    // Actions
    registerPage,
    registerDatabase,
    registerAPI,
    updatePageVersion,
    updateDatabaseVersion,
    createSnapshot,
    validateStartup,
    exportRegistry,
    importRegistry,
    clearRegistry,
    
    // Query methods
    getComponentById,
    getCompatibilityMatrix,
    
    // Migration management
    addMigrationRecord,
    updateMigrationStatus,
    
    // Error handling
    error,
    clearError
  }
}

// Convenience hook for page registration
export function usePageRegistration(pageConfig: Omit<PageVersion, 'lastModified'>) {
  const { registerPage, error, clearError } = useVersionRegistry()
  
  const registerThisPage = useCallback(() => {
    registerPage(pageConfig)
  }, [registerPage, pageConfig])
  
  return {
    registerThisPage,
    error,
    clearError
  }
}

// Convenience hook for database registration
export function useDatabaseRegistration(dbConfig: Omit<DatabaseVersion, 'lastModified'>) {
  const { registerDatabase, error, clearError } = useVersionRegistry()
  
  const registerThisDatabase = useCallback(() => {
    registerDatabase(dbConfig)
  }, [registerDatabase, dbConfig])
  
  return {
    registerThisDatabase,
    error,
    clearError
  }
}

// Convenience hook for API registration
export function useAPIRegistration(apiConfig: Omit<APIVersion, 'lastModified'>) {
  const { registerAPI, error, clearError } = useVersionRegistry()
  
  const registerThisAPI = useCallback(() => {
    registerAPI(apiConfig)
  }, [registerAPI, apiConfig])
  
  return {
    registerThisAPI,
    error,
    clearError
  }
}
