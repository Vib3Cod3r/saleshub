import { useState, useEffect, useCallback } from 'react'
import versionRegistry, {
  PageVersion,
  DatabaseVersion,
  APIVersion,
  VersionSnapshot,
  StartupValidation,
  VersionDependency,
  VersionCompatibility
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

export function useVersionRegistry(options: UseVersionRegistryOptions = {}): UseVersionRegistryReturn {
  const { autoValidate = true, validateOnMount = true } = options
  
  const [activePages, setActivePages] = useState<PageVersion[]>([])
  const [activeDatabases, setActiveDatabases] = useState<DatabaseVersion[]>([])
  const [activeAPIs, setActiveAPIs] = useState<APIVersion[]>([])
  const [deprecatedComponents, setDeprecatedComponents] = useState<Array<PageVersion | DatabaseVersion | APIVersion>>([])
  const [recentSnapshots, setRecentSnapshots] = useState<VersionSnapshot[]>([])
  const [registryStats, setRegistryStats] = useState(versionRegistry.getRegistryStats())
  const [startupValidation, setStartupValidation] = useState<StartupValidation | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update registry state
  const updateRegistryState = useCallback(() => {
    try {
      setActivePages(versionRegistry.getActivePages())
      setActiveDatabases(versionRegistry.getActiveDatabases())
      setActiveAPIs(versionRegistry.getActiveAPIs())
      setDeprecatedComponents(versionRegistry.getDeprecatedComponents())
      setRecentSnapshots(versionRegistry.getRecentSnapshots())
      setRegistryStats(versionRegistry.getRegistryStats())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update registry state')
    }
  }, [])

  // Validation function
  const validateStartup = useCallback((): StartupValidation => {
    setIsValidating(true)
    setError(null)
    
    try {
      const validation = versionRegistry.validateStartup()
      setStartupValidation(validation)
      return validation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsValidating(false)
    }
  }, [])

  // Registration functions
  const registerPage = useCallback((page: Omit<PageVersion, 'lastModified'>) => {
    try {
      setError(null)
      versionRegistry.registerPage(page)
      updateRegistryState()
      
      if (autoValidate) {
        validateStartup()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register page')
      throw err
    }
  }, [autoValidate, updateRegistryState, validateStartup])

  const registerDatabase = useCallback((db: Omit<DatabaseVersion, 'lastModified'>) => {
    try {
      setError(null)
      versionRegistry.registerDatabase(db)
      updateRegistryState()
      
      if (autoValidate) {
        validateStartup()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register database')
      throw err
    }
  }, [autoValidate, updateRegistryState, validateStartup])

  const registerAPI = useCallback((api: Omit<APIVersion, 'lastModified'>) => {
    try {
      setError(null)
      versionRegistry.registerAPI(api)
      updateRegistryState()
      
      if (autoValidate) {
        validateStartup()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register API')
      throw err
    }
  }, [autoValidate, updateRegistryState, validateStartup])

  // Update functions
  const updatePageVersion = useCallback((pageId: string, updates: Partial<PageVersion>) => {
    try {
      setError(null)
      versionRegistry.updatePageVersion(pageId, updates)
      updateRegistryState()
      
      if (autoValidate) {
        validateStartup()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update page version')
      throw err
    }
  }, [autoValidate, updateRegistryState, validateStartup])

  const updateDatabaseVersion = useCallback((dbId: string, updates: Partial<DatabaseVersion>) => {
    try {
      setError(null)
      versionRegistry.updateDatabaseVersion(dbId, updates)
      updateRegistryState()
      
      if (autoValidate) {
        validateStartup()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update database version')
      throw err
    }
  }, [autoValidate, updateRegistryState, validateStartup])

  // Snapshot functions
  const createSnapshot = useCallback((environment: string, notes?: string): VersionSnapshot => {
    try {
      setError(null)
      const snapshot = versionRegistry.createSnapshot(environment, notes)
      updateRegistryState()
      return snapshot
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create snapshot')
      throw err
    }
  }, [updateRegistryState])

  // Export/Import functions
  const exportRegistry = useCallback((): string => {
    try {
      setError(null)
      return versionRegistry.exportRegistry()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export registry')
      throw err
    }
  }, [])

  const importRegistry = useCallback((data: string) => {
    try {
      setError(null)
      versionRegistry.importRegistry(data)
      updateRegistryState()
      
      if (autoValidate) {
        validateStartup()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import registry')
      throw err
    }
  }, [autoValidate, updateRegistryState, validateStartup])

  const clearRegistry = useCallback(() => {
    try {
      setError(null)
      versionRegistry.clearAll()
      updateRegistryState()
      setStartupValidation(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear registry')
      throw err
    }
  }, [updateRegistryState])

  // Query functions
  const getComponentById = useCallback((id: string) => {
    return versionRegistry.getComponentById(id)
  }, [])

  const getCompatibilityMatrix = useCallback(() => {
    return versionRegistry.getCompatibilityMatrix()
  }, [])

  // Migration functions
  const addMigrationRecord = useCallback((dbId: string, migration: any) => {
    try {
      setError(null)
      versionRegistry.addMigrationRecord(dbId, migration)
      updateRegistryState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add migration record')
      throw err
    }
  }, [updateRegistryState])

  const updateMigrationStatus = useCallback((dbId: string, migrationId: string, status: any) => {
    try {
      setError(null)
      versionRegistry.updateMigrationStatus(dbId, migrationId, status)
      updateRegistryState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update migration status')
      throw err
    }
  }, [updateRegistryState])

  // Error handling
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initialize on mount
  useEffect(() => {
    updateRegistryState()
    
    if (validateOnMount) {
      validateStartup()
    }
  }, [updateRegistryState, validateOnMount, validateStartup])

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
