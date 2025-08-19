/**
 * AI Mistake Logger - Tracks mistakes made by Cursor AI during development
 */

export interface AIMistakeLog {
  id: string
  timestamp: string
  category: AIMistakeCategory
  severity: AIMistakeSeverity
  title: string
  description: string
  context: {
    file?: string
    function?: string
    lineNumber?: number
    userQuery?: string
    aiResponse?: string
    codeGenerated?: string
    expectedBehavior?: string
    actualBehavior?: string
    userCorrection?: string
  }
  impact: {
    developmentTime?: string
    codeQuality?: string
    userExperience?: string
    debuggingTime?: string
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
  learningPoints?: string[]
}

export type AIMistakeCategory = 
  | 'code-generation' 
  | 'understanding-requirements' 
  | 'type-safety' 
  | 'architecture' 
  | 'best-practices' 
  | 'context-awareness' 
  | 'file-structure' 
  | 'imports-dependencies' 
  | 'naming-conventions' 
  | 'error-handling' 
  | 'performance' 
  | 'security' 
  | 'testing' 
  | 'documentation' 
  | 'refactoring' 
  | 'other'

export type AIMistakeSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface AIMistakePattern {
  id: string
  pattern: string
  category: AIMistakeCategory
  severity: AIMistakeSeverity
  description: string
  commonCauses: string[]
  prevention: string[]
  examples: string[]
  learningPoints: string[]
}

export interface AIMistakeInsights {
  totalMistakes: number
  resolvedMistakes: number
  repeatMistakes: number
  mostCommonCategory: AIMistakeCategory
  mostCommonSeverity: AIMistakeSeverity
  recentTrends: {
    category: AIMistakeCategory
    count: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }[]
  topRepeatingMistakes: AIMistakeLog[]
  preventionSuggestions: string[]
  learningRecommendations: string[]
  commonPatterns: string[]
}

class AIMistakeLogger {
  private mistakes: AIMistakeLog[] = []
  private patterns: AIMistakePattern[] = []
  private maxMistakes = 500
  private maxPatterns = 100

  constructor() {
    this.initializeDefaultPatterns()
  }

  /**
   * Initialize default AI mistake patterns
   */
  private initializeDefaultPatterns(): void {
    this.patterns = [
      {
        id: 'type-safety-ignored',
        pattern: 'Type safety ignored or incorrect types used',
        category: 'type-safety',
        severity: 'high',
        description: 'AI generates code without proper TypeScript types or uses incorrect types',
        commonCauses: [
          'Not understanding the existing type system',
          'Rushing to generate code without considering types',
          'Not checking existing interfaces and types',
          'Using any type instead of proper typing'
        ],
        prevention: [
          'Always check existing type definitions before generating code',
          'Use proper TypeScript interfaces and types',
          'Avoid using any type unless absolutely necessary',
          'Test type safety with TypeScript compiler',
          'Review existing codebase type patterns'
        ],
        examples: [
          'Generated function without return type annotation',
          'Used any[] instead of proper array types',
          'Ignored existing interface definitions',
          'Created duplicate type definitions'
        ],
        learningPoints: [
          'Study TypeScript best practices',
          'Understand the project\'s type system',
          'Always consider type safety first',
          'Review existing type definitions'
        ]
      },
      {
        id: 'context-misunderstanding',
        pattern: 'Misunderstanding user requirements or context',
        category: 'understanding-requirements',
        severity: 'critical',
        description: 'AI generates code that doesn\'t match what the user actually wanted',
        commonCauses: [
          'Not reading the full user query carefully',
          'Ignoring important context clues',
          'Making assumptions without clarification',
          'Focusing on wrong aspects of the request'
        ],
        prevention: [
          'Read the entire user query multiple times',
          'Ask clarifying questions when requirements are unclear',
          'Consider the broader context and project structure',
          'Verify understanding before generating code',
          'Look for context clues in the conversation'
        ],
        examples: [
          'Generated wrong component when user wanted different functionality',
          'Implemented wrong API endpoint structure',
          'Used wrong styling approach',
          'Created unnecessary complexity'
        ],
        learningPoints: [
          'Improve requirement analysis skills',
          'Ask better clarifying questions',
          'Consider project context more carefully',
          'Verify understanding before proceeding'
        ]
      },
      {
        id: 'architecture-violation',
        pattern: 'Violating established architecture patterns',
        category: 'architecture',
        severity: 'high',
        description: 'AI generates code that doesn\'t follow the project\'s architectural patterns',
        commonCauses: [
          'Not understanding the project structure',
          'Ignoring existing architectural decisions',
          'Using patterns from other projects inappropriately',
          'Not following established conventions'
        ],
        prevention: [
          'Study the project structure before generating code',
          'Follow existing architectural patterns',
          'Use established naming conventions',
          'Respect the separation of concerns',
          'Check existing similar implementations'
        ],
        examples: [
          'Created components in wrong directories',
          'Used wrong state management approach',
          'Violated established file naming conventions',
          'Mixed concerns in single components'
        ],
        learningPoints: [
          'Understand project architecture better',
          'Study existing code patterns',
          'Follow established conventions',
          'Respect architectural decisions'
        ]
      },
      {
        id: 'import-dependency-errors',
        pattern: 'Incorrect imports or missing dependencies',
        category: 'imports-dependencies',
        severity: 'medium',
        description: 'AI generates code with wrong imports or missing dependencies',
        commonCauses: [
          'Not checking existing imports in the file',
          'Using wrong package names',
          'Not understanding the project\'s dependency structure',
          'Copying imports from wrong contexts'
        ],
        prevention: [
          'Check existing imports in the target file',
          'Verify package names and versions',
          'Understand the project\'s dependency structure',
          'Use correct import paths',
          'Check for existing similar imports'
        ],
        examples: [
          'Used wrong import path for components',
          'Imported non-existent functions',
          'Used wrong package version',
          'Missing required dependencies'
        ],
        learningPoints: [
          'Study project dependency structure',
          'Check existing import patterns',
          'Verify package names carefully',
          'Understand import path conventions'
        ]
      },
      {
        id: 'code-quality-issues',
        pattern: 'Poor code quality or best practices violations',
        category: 'best-practices',
        severity: 'medium',
        description: 'AI generates code that violates coding best practices',
        commonCauses: [
          'Not following established coding standards',
          'Ignoring performance considerations',
          'Creating overly complex solutions',
          'Not considering maintainability'
        ],
        prevention: [
          'Follow established coding standards',
          'Consider performance implications',
          'Keep solutions simple and maintainable',
          'Use consistent formatting and style',
          'Consider code readability'
        ],
        examples: [
          'Generated overly complex functions',
          'Used inconsistent naming conventions',
          'Created performance bottlenecks',
          'Ignored error handling'
        ],
        learningPoints: [
          'Study coding best practices',
          'Consider performance implications',
          'Focus on maintainability',
          'Follow consistent patterns'
        ]
      }
    ]
  }

  /**
   * Generate unique ID for mistake
   */
  private generateId(): string {
    return `ai_mistake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Log a new AI mistake
   */
  log(
    category: AIMistakeCategory,
    severity: AIMistakeSeverity,
    title: string,
    description: string,
    context?: AIMistakeLog['context'],
    impact?: AIMistakeLog['impact'],
    solution?: string,
    prevention?: string[],
    tags: string[] = [],
    learningPoints?: string[]
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

      // Add new learning points
      if (learningPoints) {
        existingMistake.learningPoints = existingMistake.learningPoints || []
        existingMistake.learningPoints.push(...learningPoints)
      }

      return existingMistake.id
    }

    const mistake: AIMistakeLog = {
      id,
      timestamp,
      category,
      severity,
      title,
      description,
      context: context || {},
      impact: impact || {},
      solution,
      prevention: prevention || [],
      tags,
      repeatCount: 1,
      lastOccurrence: timestamp,
      resolved: false,
      learningPoints: learningPoints || []
    }

    this.mistakes.push(mistake)

    // Keep only the most recent mistakes
    if (this.mistakes.length > this.maxMistakes) {
      this.mistakes = this.mistakes.slice(-this.maxMistakes)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[AI-MISTAKE-LOGGER][${severity.toUpperCase()}][${category}] ${title}`, {
        description,
        context,
        impact,
        learningPoints
      })
    }

    return id
  }

  /**
   * Log a build error mistake
   */
  logBuildError(
    file: string,
    lineNumber: number,
    error: string,
    userQuery?: string,
    codeGenerated?: string
  ): string {
    return this.log(
      'code-generation',
      'high',
      `Build Error: ${error}`,
      `Build failed due to ${error} in ${file} at line ${lineNumber}`,
      {
        file,
        lineNumber,
        userQuery,
        codeGenerated,
        expectedBehavior: 'Code should compile without syntax errors',
        actualBehavior: `Build fails with "${error}"`
      },
      {
        developmentTime: 'Blocks development progress',
        codeQuality: 'Prevents code from running',
        userExperience: 'User cannot access the page'
      },
      'Fix the syntax error in the specified file',
      [
        'Use proper syntax highlighting in editor',
        'Run linter before committing',
        'Test build process regularly',
        'Use TypeScript strict mode'
      ],
      ['build-error', 'syntax-error', 'compilation-error']
    )
  }

  /**
   * Find similar mistakes to detect repeats
   */
  private findSimilarMistake(title: string, description: string): AIMistakeLog | null {
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
  private getSeverityWeight(severity: AIMistakeSeverity): number {
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
   * Add learning points to a mistake
   */
  addLearningPoints(mistakeId: string, learningPoints: string[]): boolean {
    const mistake = this.mistakes.find(m => m.id === mistakeId)
    if (!mistake) return false

    mistake.learningPoints = mistake.learningPoints || []
    mistake.learningPoints.push(...learningPoints)
    return true
  }

  /**
   * Get all mistakes
   */
  getMistakes(): AIMistakeLog[] {
    return [...this.mistakes]
  }

  /**
   * Get mistakes by category
   */
  getMistakesByCategory(category: AIMistakeCategory): AIMistakeLog[] {
    return this.mistakes.filter(mistake => mistake.category === category)
  }

  /**
   * Get mistakes by severity
   */
  getMistakesBySeverity(severity: AIMistakeSeverity): AIMistakeLog[] {
    return this.mistakes.filter(mistake => mistake.severity === severity)
  }

  /**
   * Get unresolved mistakes
   */
  getUnresolvedMistakes(): AIMistakeLog[] {
    return this.mistakes.filter(mistake => !mistake.resolved)
  }

  /**
   * Get repeating mistakes (repeatCount > 1)
   */
  getRepeatingMistakes(): AIMistakeLog[] {
    return this.mistakes.filter(mistake => mistake.repeatCount > 1)
  }

  /**
   * Get recent mistakes (last 24 hours)
   */
  getRecentMistakes(hours: number = 24): AIMistakeLog[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.mistakes.filter(mistake => new Date(mistake.timestamp) > cutoff)
  }

  /**
   * Get mistakes by file
   */
  getMistakesByFile(file: string): AIMistakeLog[] {
    return this.mistakes.filter(mistake => mistake.context.file === file)
  }

  /**
   * Get AI mistake insights and analytics
   */
  getInsights(): AIMistakeInsights {
    const totalMistakes = this.mistakes.length
    const resolvedMistakes = this.mistakes.filter(m => m.resolved).length
    const repeatMistakes = this.mistakes.filter(m => m.repeatCount > 1).length

    // Most common category
    const categoryCounts = this.mistakes.reduce((acc, mistake) => {
      acc[mistake.category] = (acc[mistake.category] || 0) + 1
      return acc
    }, {} as Record<AIMistakeCategory, number>)
    
    const mostCommonCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as AIMistakeCategory || 'other'

    // Most common severity
    const severityCounts = this.mistakes.reduce((acc, mistake) => {
      acc[mistake.severity] = (acc[mistake.severity] || 0) + 1
      return acc
    }, {} as Record<AIMistakeSeverity, number>)
    
    const mostCommonSeverity = Object.entries(severityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as AIMistakeSeverity || 'medium'

    // Recent trends
    const recentMistakes = this.getRecentMistakes(24)
    const recentCategoryCounts = recentMistakes.reduce((acc, mistake) => {
      acc[mistake.category] = (acc[mistake.category] || 0) + 1
      return acc
    }, {} as Record<AIMistakeCategory, number>)

    const recentTrends = Object.entries(recentCategoryCounts).map(([category, count]) => {
      const previousCount = this.getMistakesByCategory(category as AIMistakeCategory)
        .filter(m => new Date(m.timestamp) < new Date(Date.now() - 24 * 60 * 60 * 1000))
        .length
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (count > previousCount) trend = 'increasing'
      else if (count < previousCount) trend = 'decreasing'

      return { category: category as AIMistakeCategory, count, trend }
    })

    // Top repeating mistakes
    const topRepeatingMistakes = this.getRepeatingMistakes()
      .sort((a, b) => b.repeatCount - a.repeatCount)
      .slice(0, 5)

    // Prevention suggestions
    const preventionSuggestions = this.generatePreventionSuggestions()

    // Learning recommendations
    const learningRecommendations = this.generateLearningRecommendations()

    // Common patterns
    const commonPatterns = this.extractCommonPatterns()

    return {
      totalMistakes,
      resolvedMistakes,
      repeatMistakes,
      mostCommonCategory,
      mostCommonSeverity,
      recentTrends,
      topRepeatingMistakes,
      preventionSuggestions,
      learningRecommendations,
      commonPatterns
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

    if (insights.mostCommonCategory === 'understanding-requirements') {
      suggestions.push('Improve requirement analysis and ask more clarifying questions')
    }

    if (insights.mostCommonCategory === 'type-safety') {
      suggestions.push('Always consider TypeScript types and existing type definitions')
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
   * Generate learning recommendations
   */
  private generateLearningRecommendations(): string[] {
    const recommendations: string[] = []
    const insights = this.getInsights()

    // Get all learning points from mistakes
    const allLearningPoints = this.mistakes
      .flatMap(mistake => mistake.learningPoints || [])
      .filter((point, index, array) => array.indexOf(point) === index) // Remove duplicates

    // Get most common learning points
    const learningPointCounts = allLearningPoints.reduce((acc, point) => {
      acc[point] = (acc[point] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topLearningPoints = Object.entries(learningPointCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([point]) => point)

    recommendations.push(...topLearningPoints)

    // Add category-specific recommendations
    if (insights.mostCommonCategory === 'type-safety') {
      recommendations.push('Study TypeScript best practices and type system')
    }

    if (insights.mostCommonCategory === 'architecture') {
      recommendations.push('Understand project architecture and patterns better')
    }

    return recommendations
  }

  /**
   * Extract common patterns from mistakes
   */
  private extractCommonPatterns(): string[] {
    const patterns: string[] = []
    
    // Analyze mistake titles and descriptions for common patterns
    const allText = this.mistakes.map(m => `${m.title} ${m.description}`).join(' ').toLowerCase()
    
    const commonPhrases = [
      'type error',
      'import error',
      'not found',
      'undefined',
      'wrong',
      'incorrect',
      'missing',
      'failed',
      'error',
      'bug',
      'issue'
    ]

    commonPhrases.forEach(phrase => {
      if (allText.includes(phrase)) {
        patterns.push(`Common pattern: ${phrase}`)
      }
    })

    return patterns.slice(0, 10) // Limit to top 10
  }

  /**
   * Add a new mistake pattern
   */
  addPattern(pattern: Omit<AIMistakePattern, 'id'>): string {
    const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newPattern: AIMistakePattern = { ...pattern, id }
    
    this.patterns.push(newPattern)

    if (this.patterns.length > this.maxPatterns) {
      this.patterns = this.patterns.slice(-this.maxPatterns)
    }

    return id
  }

  /**
   * Get all patterns
   */
  getPatterns(): AIMistakePattern[] {
    return [...this.patterns]
  }

  /**
   * Get patterns by category
   */
  getPatternsByCategory(category: AIMistakeCategory): AIMistakePattern[] {
    return this.patterns.filter(pattern => pattern.category === category)
  }

  /**
   * Get learning summary for AI improvement
   */
  getLearningSummary(): {
    topMistakes: AIMistakeLog[]
    keyLearningPoints: string[]
    improvementAreas: string[]
    preventionStrategies: string[]
  } {
    const topMistakes = this.getRepeatingMistakes()
      .sort((a, b) => b.repeatCount - a.repeatCount)
      .slice(0, 10)

    const allLearningPoints = this.mistakes
      .flatMap(mistake => mistake.learningPoints || [])
      .filter((point, index, array) => array.indexOf(point) === index)

    const improvementAreas = this.getInsights().recentTrends
      .filter(t => t.trend === 'increasing')
      .map(t => t.category)

    const preventionStrategies = this.patterns
      .flatMap(pattern => pattern.prevention)
      .filter((strategy, index, array) => array.indexOf(strategy) === index)

    return {
      topMistakes,
      keyLearningPoints: allLearningPoints.slice(0, 20),
      improvementAreas,
      preventionStrategies: preventionStrategies.slice(0, 20)
    }
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
      console.error('Failed to import AI mistakes:', error)
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
export const aiMistakeLogger = new AIMistakeLogger()

// Export convenience functions
export const logAIMistake = (
  category: AIMistakeCategory,
  severity: AIMistakeSeverity,
  title: string,
  description: string,
  context?: AIMistakeLog['context'],
  impact?: AIMistakeLog['impact'],
  solution?: string,
  prevention?: string[],
  tags?: string[],
  learningPoints?: string[]
) => aiMistakeLogger.log(category, severity, title, description, context, impact, solution, prevention, tags, learningPoints)

export const resolveAIMistake = (mistakeId: string, resolvedBy?: string, notes?: string) =>
  aiMistakeLogger.resolve(mistakeId, resolvedBy, notes)

export const addAIMistakeNote = (mistakeId: string, note: string) =>
  aiMistakeLogger.addNote(mistakeId, note)

export const addAILearningPoints = (mistakeId: string, learningPoints: string[]) =>
  aiMistakeLogger.addLearningPoints(mistakeId, learningPoints)

export const getAIMistakeInsights = () => aiMistakeLogger.getInsights()

export const getAILearningSummary = () => aiMistakeLogger.getLearningSummary()

// Log the current build error
aiMistakeLogger.logBuildError(
  './src/app/companies/page.tsx',
  223,
  'Unterminated regexp literal',
  'User tried to connect to the companies page',
  'Companies page component with potential syntax error'
)
