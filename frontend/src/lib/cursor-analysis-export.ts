/**
 * Cursor Analysis Export - Utilities for exporting error data for Cursor AI analysis
 */

import { getCursorErrorAnalysis, getErrorPatterns, getFrequentErrors } from './cursor-error-tracker'

export interface CursorAnalysisReport {
  timestamp: string
  summary: {
    totalErrors: number
    errorPatterns: number
    frequentErrors: number
    criticalErrors: number
    companiesPageErrors: number
    registryErrors: number
  }
  patterns: Array<{
    pattern: string
    occurrences: number
    firstSeen: string
    lastSeen: string
    affectedComponents: string[]
    suggestedSolutions: string[]
  }>
  recentErrors: Array<{
    message: string
    type: string
    severity: string
    component: string
    timestamp: string
    frequency: string
  }>
  recommendations: string[]
  technicalDetails: {
    userAgent: string
    url: string
    environment: string
  }
}

/**
 * Generate a comprehensive analysis report for Cursor
 */
export function generateCursorAnalysisReport(): CursorAnalysisReport {
  const analysis = JSON.parse(getCursorErrorAnalysis())
  const patterns = getErrorPatterns()
  const frequentErrors = getFrequentErrors()

  // Count errors by type
  const companiesPageErrors = frequentErrors.filter(e => e.context.page === 'companies').length
  const registryErrors = frequentErrors.filter(e => e.errorType === 'registry').length
  const criticalErrors = frequentErrors.filter(e => e.severity === 'critical').length

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalErrors: analysis.summary.totalErrors,
      errorPatterns: analysis.summary.errorPatterns,
      frequentErrors: analysis.summary.frequentErrors,
      criticalErrors,
      companiesPageErrors,
      registryErrors
    },
    patterns: patterns.map(p => ({
      pattern: p.pattern,
      occurrences: p.occurrences,
      firstSeen: p.firstSeen,
      lastSeen: p.lastSeen,
      affectedComponents: p.affectedComponents,
      suggestedSolutions: p.suggestedSolutions
    })),
    recentErrors: analysis.recentErrors.map((e: any) => ({
      message: e.message,
      type: e.errorType,
      severity: e.severity,
      component: e.context.component,
      timestamp: e.timestamp,
      frequency: e.metadata.frequency
    })),
    recommendations: analysis.recommendations,
    technicalDetails: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      environment: process.env.NODE_ENV || 'unknown'
    }
  }
}

/**
 * Export analysis report as JSON file
 */
export function exportAnalysisReport(): void {
  const report = generateCursorAnalysisReport()
  const data = JSON.stringify(report, null, 2)
  
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cursor-error-analysis-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Get analysis report for console output
 */
export function logAnalysisReport(): void {
  const report = generateCursorAnalysisReport()
  
  console.group('🔍 Cursor Error Analysis Report')
  console.log('📊 Summary:', report.summary)
  console.log('🔄 Patterns:', report.patterns)
  console.log('⚠️ Recent Errors:', report.recentErrors)
  console.log('💡 Recommendations:', report.recommendations)
  console.log('🔧 Technical Details:', report.technicalDetails)
  console.groupEnd()
}

/**
 * Get specific analysis for companies page errors
 */
export function getCompaniesPageAnalysis(): {
  totalErrors: number
  frequentErrors: number
  patterns: string[]
  recommendations: string[]
} {
  const analysis = JSON.parse(getCursorErrorAnalysis())
  const companiesErrors = analysis.recentErrors.filter((e: any) => e.context.page === 'companies')
  const patterns = getErrorPatterns()
  const companiesPatterns = patterns.filter(p => 
    p.affectedComponents.some(c => c.toLowerCase().includes('companies'))
  )

  return {
    totalErrors: companiesErrors.length,
    frequentErrors: companiesErrors.filter((e: any) => e.metadata.frequency === 'frequent').length,
    patterns: companiesPatterns.map(p => p.pattern),
    recommendations: analysis.recommendations.filter((r: string) => 
      r.toLowerCase().includes('companies') || r.toLowerCase().includes('component')
    )
  }
}

/**
 * Get specific analysis for registry errors
 */
export function getRegistryAnalysis(): {
  totalErrors: number
  frequentErrors: number
  patterns: string[]
  recommendations: string[]
} {
  const analysis = JSON.parse(getCursorErrorAnalysis())
  const registryErrors = analysis.recentErrors.filter((e: any) => e.errorType === 'registry')
  const patterns = getErrorPatterns()
  const registryPatterns = patterns.filter(p => 
    p.pattern.includes('registry') || p.pattern.includes('getStats')
  )

  return {
    totalErrors: registryErrors.length,
    frequentErrors: registryErrors.filter((e: any) => e.metadata.frequency === 'frequent').length,
    patterns: registryPatterns.map(p => p.pattern),
    recommendations: analysis.recommendations.filter((r: string) => 
      r.toLowerCase().includes('registry') || r.toLowerCase().includes('method')
    )
  }
}

// Make functions available globally for Cursor access
if (typeof window !== 'undefined') {
  (window as any).cursorAnalysis = {
    generateReport: generateCursorAnalysisReport,
    exportReport: exportAnalysisReport,
    logReport: logAnalysisReport,
    getCompaniesAnalysis: getCompaniesPageAnalysis,
    getRegistryAnalysis: getRegistryAnalysis,
    getRawAnalysis: () => JSON.parse(getCursorErrorAnalysis())
  }
}
