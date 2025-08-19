import { useEffect } from 'react'
import { versionTracker } from '@/lib/version-tracker'

interface UseVersionTrackerOptions {
  pageId?: string
  pageName?: string
  pagePath?: string
  pageVersion?: string
  pageFeatures?: string[]
  pageDependencies?: string[]
  databaseId?: string
  databaseName?: string
  databaseVersion?: string
  migrationVersion?: string
  schemaHash?: string
  autoRegister?: boolean
}

export function useVersionTracker(options: UseVersionTrackerOptions) {
  const {
    pageId,
    pageName,
    pagePath,
    pageVersion,
    pageFeatures = [],
    pageDependencies = [],
    databaseId,
    databaseName,
    databaseVersion,
    migrationVersion,
    schemaHash,
    autoRegister = true
  } = options

  useEffect(() => {
    if (!autoRegister) return

    // Register page if page info is provided
    if (pageId && pageName && pagePath && pageVersion) {
      const checksum = generateChecksum(pageName + pageVersion + JSON.stringify(pageFeatures))
      
      versionTracker.registerPage({
        id: pageId,
        name: pageName,
        path: pagePath,
        version: pageVersion,
        checksum,
        dependencies: pageDependencies,
        features: pageFeatures,
        status: 'active'
      })
    }

    // Register database if database info is provided
    if (databaseId && databaseName && databaseVersion) {
      versionTracker.registerDatabase({
        id: databaseId,
        name: databaseName,
        version: databaseVersion,
        migrationVersion,
        schemaHash,
        status: 'active'
      })
    }
  }, [
    pageId,
    pageName,
    pagePath,
    pageVersion,
    pageFeatures,
    pageDependencies,
    databaseId,
    databaseName,
    databaseVersion,
    migrationVersion,
    schemaHash,
    autoRegister
  ])

  return {
    versionTracker,
    createSnapshot: versionTracker.createSnapshot.bind(versionTracker),
    getActivePages: versionTracker.getActivePages.bind(versionTracker),
    getActiveDatabases: versionTracker.getActiveDatabases.bind(versionTracker),
    getDeprecatedPages: versionTracker.getDeprecatedPages.bind(versionTracker),
    generateRestartReport: versionTracker.generateRestartReport.bind(versionTracker),
    exportData: versionTracker.exportData.bind(versionTracker)
  }
}

// Utility function to generate a simple checksum
function generateChecksum(str: string): string {
  let hash = 0
  if (str.length === 0) return hash.toString()
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

export default useVersionTracker
