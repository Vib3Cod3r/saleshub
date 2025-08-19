/**
 * React hook for using the mistake logger
 */

import { useCallback, useMemo } from 'react'
import { 
  mistakeLogger, 
  logMistake, 
  resolveMistake, 
  addMistakeNote, 
  getMistakeInsights,
  type MistakeCategory,
  type MistakeSeverity,
  type MistakeLog,
  type MistakePattern,
  type MistakeInsights
} from '../lib/mistake-logger'

export interface UseMistakeLoggerReturn {
  // Core logging functions
  logMistake: (
    category: MistakeCategory,
    severity: MistakeSeverity,
    title: string,
    description: string,
    context?: MistakeLog['context'],
    impact?: MistakeLog['impact'],
    solution?: string,
    prevention?: string[],
    tags?: string[]
  ) => string
  
  // Management functions
  resolveMistake: (mistakeId: string, resolvedBy?: string, notes?: string) => boolean
  addNote: (mistakeId: string, note: string) => boolean
  
  // Query functions
  getMistakes: () => MistakeLog[]
  getMistakesByCategory: (category: MistakeCategory) => MistakeLog[]
  getMistakesBySeverity: (severity: MistakeSeverity) => MistakeLog[]
  getUnresolvedMistakes: () => MistakeLog[]
  getRepeatingMistakes: () => MistakeLog[]
  getRecentMistakes: (hours?: number) => MistakeLog[]
  
  // Pattern functions
  getPatterns: () => MistakePattern[]
  getPatternsByCategory: (category: MistakeCategory) => MistakePattern[]
  addPattern: (pattern: Omit<MistakePattern, 'id'>) => string
  
  // Analytics
  getInsights: () => MistakeInsights
  
  // Utility functions
  clearMistakes: () => void
  exportMistakes: () => string
  importMistakes: (data: string) => void
  setMaxMistakes: (max: number) => void
}

export function useMistakeLogger(): UseMistakeLoggerReturn {
  // Memoize the logger instance to prevent unnecessary re-renders
  const logger = useMemo(() => mistakeLogger, [])

  // Core logging function
  const logMistakeCallback = useCallback((
    category: MistakeCategory,
    severity: MistakeSeverity,
    title: string,
    description: string,
    context?: MistakeLog['context'],
    impact?: MistakeLog['impact'],
    solution?: string,
    prevention?: string[],
    tags?: string[]
  ) => {
    return logMistake(category, severity, title, description, context, impact, solution, prevention, tags)
  }, [])

  // Management functions
  const resolveMistakeCallback = useCallback((mistakeId: string, resolvedBy?: string, notes?: string) => {
    return resolveMistake(mistakeId, resolvedBy, notes)
  }, [])

  const addNoteCallback = useCallback((mistakeId: string, note: string) => {
    return addMistakeNote(mistakeId, note)
  }, [])

  // Query functions
  const getMistakes = useCallback(() => logger.getMistakes(), [logger])
  const getMistakesByCategory = useCallback((category: MistakeCategory) => 
    logger.getMistakesByCategory(category), [logger])
  const getMistakesBySeverity = useCallback((severity: MistakeSeverity) => 
    logger.getMistakesBySeverity(severity), [logger])
  const getUnresolvedMistakes = useCallback(() => logger.getUnresolvedMistakes(), [logger])
  const getRepeatingMistakes = useCallback(() => logger.getRepeatingMistakes(), [logger])
  const getRecentMistakes = useCallback((hours?: number) => logger.getRecentMistakes(hours), [logger])

  // Pattern functions
  const getPatterns = useCallback(() => logger.getPatterns(), [logger])
  const getPatternsByCategory = useCallback((category: MistakeCategory) => 
    logger.getPatternsByCategory(category), [logger])
  const addPattern = useCallback((pattern: Omit<MistakePattern, 'id'>) => 
    logger.addPattern(pattern), [logger])

  // Analytics
  const getInsights = useCallback(() => getMistakeInsights(), [])

  // Utility functions
  const clearMistakes = useCallback(() => logger.clearMistakes(), [logger])
  const exportMistakes = useCallback(() => logger.exportMistakes(), [logger])
  const importMistakes = useCallback((data: string) => logger.importMistakes(data), [logger])
  const setMaxMistakes = useCallback((max: number) => logger.setMaxMistakes(max), [logger])

  return {
    logMistake: logMistakeCallback,
    resolveMistake: resolveMistakeCallback,
    addNote: addNoteCallback,
    getMistakes,
    getMistakesByCategory,
    getMistakesBySeverity,
    getUnresolvedMistakes,
    getRepeatingMistakes,
    getRecentMistakes,
    getPatterns,
    getPatternsByCategory,
    addPattern,
    getInsights,
    clearMistakes,
    exportMistakes,
    importMistakes,
    setMaxMistakes
  }
}

// Convenience hook for quick mistake logging
export function useQuickMistakeLogger() {
  const { logMistake } = useMistakeLogger()

  const logUIUXMistake = useCallback((
    title: string,
    description: string,
    severity: MistakeSeverity = 'medium',
    context?: MistakeLog['context']
  ) => {
    return logMistake('ui-ux', severity, title, description, context)
  }, [logMistake])

  const logPerformanceMistake = useCallback((
    title: string,
    description: string,
    severity: MistakeSeverity = 'medium',
    context?: MistakeLog['context']
  ) => {
    return logMistake('performance', severity, title, description, context)
  }, [logMistake])

  const logSecurityMistake = useCallback((
    title: string,
    description: string,
    severity: MistakeSeverity = 'high',
    context?: MistakeLog['context']
  ) => {
    return logMistake('security', severity, title, description, context)
  }, [logMistake])

  const logStateManagementMistake = useCallback((
    title: string,
    description: string,
    severity: MistakeSeverity = 'medium',
    context?: MistakeLog['context']
  ) => {
    return logMistake('state-management', severity, title, description, context)
  }, [logMistake])

  const logErrorHandlingMistake = useCallback((
    title: string,
    description: string,
    severity: MistakeSeverity = 'high',
    context?: MistakeLog['context']
  ) => {
    return logMistake('error-handling', severity, title, description, context)
  }, [logMistake])

  return {
    logUIUXMistake,
    logPerformanceMistake,
    logSecurityMistake,
    logStateManagementMistake,
    logErrorHandlingMistake
  }
}
