/**
 * Mistake logging system to prevent repeating mistakes
 */

export interface MistakeLog {
  id: string
  timestamp: string
  category: MistakeCategory
  severity: MistakeSeverity
  title: string
  description: string
  context: {
    component?: string
    function?: string
    userAction?: string
    url?: string
    userAgent?: string
  }
  impact: {
    userExperience?: string
    performance?: string
    security?: string
    dataIntegrity?: string
  }
  solution?: string
  prevention?: string[]
  tags: string[]
  repeatCount: number
  lastOccurrence: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  notes?: string[]
}

export type MistakeCategory = 
  | 'ui-ux' 
  | 'performance' 
  | 'security' 
  | 'data-handling' 
  | 'api-integration' 
  | 'state-management' 
  | 'routing' 
  | 'authentication' 
  | 'validation' 
  | 'error-handling' 
  | 'code-quality' 
  | 'deployment' 
  | 'testing' 
  | 'documentation' 
  | 'other'

export type MistakeSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface MistakePattern {
  id: string
  pattern: string
  category: MistakeCategory
  severity: MistakeSeverity
  description: string
  prevention: string[]
  examples: string[]
}

export interface MistakeInsights {
  totalMistakes: number
  resolvedMistakes: number
  repeatMistakes: number
  mostCommonCategory: MistakeCategory
  mostCommonSeverity: MistakeSeverity
  recentTrends: {
    category: MistakeCategory
    count: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }[]
  topRepeatingMistakes: MistakeLog[]
  preventionSuggestions: string[]
}

class MistakeLogger {
  private mistakes: MistakeLog[] = []
  private patterns: MistakePattern[] = []
  private maxMistakes = 200
  private maxPatterns = 50

  constructor() {
    this.initializeDefaultPatterns()
  }

  /**
   * Initialize default mistake patterns
   */
  private initializeDefaultPatterns(): void {
    this.patterns = [
      {
        id: 'ui-state-sync',
        pattern: 'UI state not synchronized with server state',
        category: 'state-management',
        severity: 'medium',
        description: 'User interface shows outdated information due to lack of proper state synchronization',
        prevention: [
          'Use React Query for server state management',
          'Implement optimistic updates with rollback',
          'Add loading states for async operations',
          'Use proper error boundaries'
        ],
        examples: [
          'Form shows old data after failed update',
          'List not refreshed after item deletion',
          'Modal state inconsistent with backend'
        ]
      },
      {
        id: 'unhandled-promise',
        pattern: 'Unhandled promise rejection',
        category: 'error-handling',
        severity: 'high',
        description: 'Promise rejections not properly caught and handled',
        prevention: [
          'Always use try-catch with async/await',
          'Add .catch() to promise chains',
          'Use error boundaries for React components',
          'Implement global error handlers'
        ],
        examples: [
          'API call fails without user feedback',
          'Form submission error not displayed',
          'Network error crashes component'
        ]
      },
      {
        id: 'memory-leak',
        pattern: 'Memory leak from unmounted components',
        category: 'performance',
        severity: 'high',
        description: 'Event listeners or subscriptions not cleaned up on component unmount',
        prevention: [
          'Use useEffect cleanup functions',
          'Cancel API requests on unmount',
          'Remove event listeners in cleanup',
          'Use AbortController for fetch requests'
        ],
        examples: [
          'API calls continue after navigation',
          'Event listeners accumulate over time',
          'WebSocket connections not closed'
        ]
      },
      {
        id: 'validation-bypass',
        pattern: 'Client-side validation bypassed',
        category: 'security',
        severity: 'critical',
        description: 'User can bypass client-side validation to submit invalid data',
        prevention: [
          'Always validate on server-side',
          'Use Zod for schema validation',
          'Implement proper input sanitization',
          'Add rate limiting to API endpoints'
        ],
        examples: [
          'Form accepts invalid email format',
          'SQL injection through form inputs',
          'XSS attacks through user input'
        ]
      }
    ]
  }

  /**
   * Generate unique ID for mistake
   */
  private generateId(): string {
    return `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Log a new mistake
   */
  log(
    category: MistakeCategory,
    severity: MistakeSeverity,
    title: string,
    description: string,
    context?: MistakeLog['context'],
    impact?: MistakeLog['impact'],
    solution?: string,
    prevention?: string[],
    tags: string[] = []
  ): string {
    const id = this.generateId()
    const timestamp = new Date().toISOString()

    // Check if this is a repeat mistake
    const existingMistake = this.findSimilarMistake(title, description)
    
    if (existingMistake) {
      // Update existing mistake
      existingMistake.repeatCount += 1
      existingMistake.lastOccurrence = timestamp
      existingMistake.notes = existingMistake.notes || []
      existingMistake.notes.push(`Repeated at ${timestamp}`)
      
      // Update severity if this repeat is more severe
      if (this.getSeverityWeight(severity) > this.getSeverityWeight(existingMistake.severity)) {
        existingMistake.severity = severity
      }

      return existingMistake.id
    }

    const mistake: MistakeLog = {
      id,
      timestamp,
      category,
      severity,
      title,
      description,
      context: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        ...context
      },
      impact: impact || {},
      solution,
      prevention: prevention || [],
      tags,
      repeatCount: 1,
      lastOccurrence: timestamp,
      resolved: false
    }

    this.mistakes.push(mistake)

    // Keep only the most recent mistakes
    if (this.mistakes.length > this.maxMistakes) {
      this.mistakes = this.mistakes.slice(-this.maxMistakes)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[MISTAKE-LOGGER][${severity.toUpperCase()}][${category}] ${title}`, {
        description,
        context,
        impact
      })
    }

    return id
  }

  /**
   * Find similar mistakes to detect repeats
   */
  private findSimilarMistake(title: string, description: string): MistakeLog | null {
    const titleLower = title.toLowerCase()
    const descLower = description.toLowerCase()

    return this.mistakes.find(mistake => {
      const titleSimilarity = this.calculateSimilarity(titleLower, mistake.title.toLowerCase())
      const descSimilarity = this.calculateSimilarity(descLower, mistake.description.toLowerCase())
      
      // Consider it similar if either title or description is 80% similar
      return titleSimilarity > 0.8 || descSimilarity > 0.8
    }) || null
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Get severity weight for comparison
   */
  private getSeverityWeight(severity: MistakeSeverity): number {
    const weights = { low: 1, medium: 2, high: 3, critical: 4 }
    return weights[severity]
  }

  /**
   * Resolve a mistake
   */
  resolve(mistakeId: string, resolvedBy?: string, notes?: string): boolean {
    const mistake = this.mistakes.find(m => m.id === mistakeId)
    if (!mistake) return false

    mistake.resolved = true
    mistake.resolvedAt = new Date().toISOString()
    mistake.resolvedBy = resolvedBy
    if (notes) {
      mistake.notes = mistake.notes || []
      mistake.notes.push(`Resolved: ${notes}`)
    }

    return true
  }

  /**
   * Add a note to a mistake
   */
  addNote(mistakeId: string, note: string): boolean {
    const mistake = this.mistakes.find(m => m.id === mistakeId)
    if (!mistake) return false

    mistake.notes = mistake.notes || []
    mistake.notes.push(`${new Date().toISOString()}: ${note}`)
    return true
  }

  /**
   * Get all mistakes
   */
  getMistakes(): MistakeLog[] {
    return [...this.mistakes]
  }

  /**
   * Get mistakes by category
   */
  getMistakesByCategory(category: MistakeCategory): MistakeLog[] {
    return this.mistakes.filter(mistake => mistake.category === category)
  }

  /**
   * Get mistakes by severity
   */
  getMistakesBySeverity(severity: MistakeSeverity): MistakeLog[] {
    return this.mistakes.filter(mistake => mistake.severity === severity)
  }

  /**
   * Get unresolved mistakes
   */
  getUnresolvedMistakes(): MistakeLog[] {
    return this.mistakes.filter(mistake => !mistake.resolved)
  }

  /**
   * Get repeating mistakes (repeatCount > 1)
   */
  getRepeatingMistakes(): MistakeLog[] {
    return this.mistakes.filter(mistake => mistake.repeatCount > 1)
  }

  /**
   * Get recent mistakes (last 24 hours)
   */
  getRecentMistakes(hours: number = 24): MistakeLog[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.mistakes.filter(mistake => new Date(mistake.timestamp) > cutoff)
  }

  /**
   * Get mistake insights and analytics
   */
  getInsights(): MistakeInsights {
    const totalMistakes = this.mistakes.length
    const resolvedMistakes = this.mistakes.filter(m => m.resolved).length
    const repeatMistakes = this.mistakes.filter(m => m.repeatCount > 1).length

    // Most common category
    const categoryCounts = this.mistakes.reduce((acc, mistake) => {
      acc[mistake.category] = (acc[mistake.category] || 0) + 1
      return acc
    }, {} as Record<MistakeCategory, number>)
    
    const mostCommonCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as MistakeCategory || 'other'

    // Most common severity
    const severityCounts = this.mistakes.reduce((acc, mistake) => {
      acc[mistake.severity] = (acc[mistake.severity] || 0) + 1
      return acc
    }, {} as Record<MistakeSeverity, number>)
    
    const mostCommonSeverity = Object.entries(severityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as MistakeSeverity || 'medium'

    // Recent trends
    const recentMistakes = this.getRecentMistakes(24)
    const recentCategoryCounts = recentMistakes.reduce((acc, mistake) => {
      acc[mistake.category] = (acc[mistake.category] || 0) + 1
      return acc
    }, {} as Record<MistakeCategory, number>)

    const recentTrends = Object.entries(recentCategoryCounts).map(([category, count]) => {
      const previousCount = this.getMistakesByCategory(category as MistakeCategory)
        .filter(m => new Date(m.timestamp) < new Date(Date.now() - 24 * 60 * 60 * 1000))
        .length
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (count > previousCount) trend = 'increasing'
      else if (count < previousCount) trend = 'decreasing'

      return { category: category as MistakeCategory, count, trend }
    })

    // Top repeating mistakes
    const topRepeatingMistakes = this.getRepeatingMistakes()
      .sort((a, b) => b.repeatCount - a.repeatCount)
      .slice(0, 5)

    // Prevention suggestions
    const preventionSuggestions = this.generatePreventionSuggestions()

    return {
      totalMistakes,
      resolvedMistakes,
      repeatMistakes,
      mostCommonCategory,
      mostCommonSeverity,
      recentTrends,
      topRepeatingMistakes,
      preventionSuggestions
    }
  }

  /**
   * Generate prevention suggestions based on current mistakes
   */
  private generatePreventionSuggestions(): string[] {
    const suggestions: string[] = []
    const insights = this.getInsights()

    if (insights.repeatMistakes > 0) {
      suggestions.push('Focus on resolving repeating mistakes to prevent future occurrences')
    }

    if (insights.mostCommonCategory === 'security') {
      suggestions.push('Implement additional security measures and validation')
    }

    if (insights.mostCommonSeverity === 'critical') {
      suggestions.push('Prioritize critical mistakes for immediate resolution')
    }

    const recentTrends = insights.recentTrends.filter(t => t.trend === 'increasing')
    if (recentTrends.length > 0) {
      suggestions.push(`Monitor increasing trends in: ${recentTrends.map(t => t.category).join(', ')}`)
    }

    return suggestions
  }

  /**
   * Add a new mistake pattern
   */
  addPattern(pattern: Omit<MistakePattern, 'id'>): string {
    const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newPattern: MistakePattern = { ...pattern, id }
    
    this.patterns.push(newPattern)

    if (this.patterns.length > this.maxPatterns) {
      this.patterns = this.patterns.slice(-this.maxPatterns)
    }

    return id
  }

  /**
   * Get all patterns
   */
  getPatterns(): MistakePattern[] {
    return [...this.patterns]
  }

  /**
   * Get patterns by category
   */
  getPatternsByCategory(category: MistakeCategory): MistakePattern[] {
    return this.patterns.filter(pattern => pattern.category === category)
  }

  /**
   * Clear all mistakes
   */
  clearMistakes(): void {
    this.mistakes = []
  }

  /**
   * Export mistakes as JSON string
   */
  exportMistakes(): string {
    return JSON.stringify({
      mistakes: this.mistakes,
      patterns: this.patterns,
      exportDate: new Date().toISOString()
    }, null, 2)
  }

  /**
   * Import mistakes from JSON string
   */
  importMistakes(data: string): void {
    try {
      const imported = JSON.parse(data)
      if (imported.mistakes) {
        this.mistakes = [...this.mistakes, ...imported.mistakes]
      }
      if (imported.patterns) {
        this.patterns = [...this.patterns, ...imported.patterns]
      }
      
      // Keep only the most recent items
      if (this.mistakes.length > this.maxMistakes) {
        this.mistakes = this.mistakes.slice(-this.maxMistakes)
      }
      if (this.patterns.length > this.maxPatterns) {
        this.patterns = this.patterns.slice(-this.maxPatterns)
      }
    } catch (error) {
      console.error('Failed to import mistakes:', error)
    }
  }

  /**
   * Set maximum number of mistakes to keep
   */
  setMaxMistakes(max: number): void {
    this.maxMistakes = max
    if (this.mistakes.length > this.maxMistakes) {
      this.mistakes = this.mistakes.slice(-this.maxMistakes)
    }
  }
}

// Create a singleton instance
export const mistakeLogger = new MistakeLogger()

// Export convenience functions
export const logMistake = (
  category: MistakeCategory,
  severity: MistakeSeverity,
  title: string,
  description: string,
  context?: MistakeLog['context'],
  impact?: MistakeLog['impact'],
  solution?: string,
  prevention?: string[],
  tags?: string[]
) => mistakeLogger.log(category, severity, title, description, context, impact, solution, prevention, tags)

export const resolveMistake = (mistakeId: string, resolvedBy?: string, notes?: string) =>
  mistakeLogger.resolve(mistakeId, resolvedBy, notes)

export const addMistakeNote = (mistakeId: string, note: string) =>
  mistakeLogger.addNote(mistakeId, note)

export const getMistakeInsights = () => mistakeLogger.getInsights()
