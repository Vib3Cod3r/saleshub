/**
 * AI Mistake Helper - Easy logging of AI mistakes
 */

import { 
  logAIMistake, 
  addAIMistakeNote, 
  getAIMistakeInsights, 
  getAILearningSummary,
  type AIMistakeCategory,
  type AIMistakeSeverity 
} from './ai-mistake-logger'

/**
 * Quick logging functions for common AI mistakes
 */

// Type safety mistakes
export const logTypeSafetyMistake = (
  title: string,
  description: string,
  context?: {
    file?: string
    function?: string
    expectedType?: string
    actualType?: string
    userQuery?: string
  }
) => {
  return logAIMistake(
    'type-safety',
    'high',
    title,
    description,
    context,
    {
      codeQuality: 'Reduced type safety and potential runtime errors',
      debuggingTime: 'Additional time needed to fix type issues'
    },
    'Always check existing type definitions and use proper TypeScript types',
    [
      'Check existing interfaces and types before generating code',
      'Use proper TypeScript annotations',
      'Avoid using any type unless necessary',
      'Test with TypeScript compiler'
    ],
    ['typescript', 'type-safety', 'code-quality'],
    [
      'Study TypeScript best practices',
      'Understand the project\'s type system',
      'Always consider type safety first'
    ]
  )
}

// Understanding requirements mistakes
export const logRequirementMistake = (
  title: string,
  description: string,
  context?: {
    userQuery?: string
    aiResponse?: string
    expectedBehavior?: string
    actualBehavior?: string
    userCorrection?: string
  }
) => {
  return logAIMistake(
    'understanding-requirements',
    'critical',
    title,
    description,
    context,
    {
      developmentTime: 'Time wasted on wrong implementation',
      userExperience: 'Frustration due to incorrect solution'
    },
    'Improve requirement analysis and ask clarifying questions',
    [
      'Read the entire user query carefully',
      'Ask clarifying questions when unclear',
      'Consider project context',
      'Verify understanding before proceeding'
    ],
    ['requirements', 'understanding', 'user-query'],
    [
      'Improve requirement analysis skills',
      'Ask better clarifying questions',
      'Consider project context more carefully'
    ]
  )
}

// Architecture mistakes
export const logArchitectureMistake = (
  title: string,
  description: string,
  context?: {
    file?: string
    component?: string
    expectedPattern?: string
    actualPattern?: string
  }
) => {
  return logAIMistake(
    'architecture',
    'high',
    title,
    description,
    context,
    {
      codeQuality: 'Violation of established patterns',
      developmentTime: 'Time needed to refactor to correct architecture'
    },
    'Study project structure and follow established patterns',
    [
      'Study the project structure before generating code',
      'Follow existing architectural patterns',
      'Use established naming conventions',
      'Respect separation of concerns'
    ],
    ['architecture', 'patterns', 'structure'],
    [
      'Understand project architecture better',
      'Study existing code patterns',
      'Follow established conventions'
    ]
  )
}

// Import/dependency mistakes
export const logImportMistake = (
  title: string,
  description: string,
  context?: {
    file?: string
    wrongImport?: string
    correctImport?: string
    missingDependency?: string
  }
) => {
  return logAIMistake(
    'imports-dependencies',
    'medium',
    title,
    description,
    context,
    {
      developmentTime: 'Time to fix import issues',
      debuggingTime: 'Time spent debugging import errors'
    },
    'Check existing imports and verify package names',
    [
      'Check existing imports in the target file',
      'Verify package names and versions',
      'Understand project dependency structure',
      'Use correct import paths'
    ],
    ['imports', 'dependencies', 'packages'],
    [
      'Study project dependency structure',
      'Check existing import patterns',
      'Verify package names carefully'
    ]
  )
}

// Code quality mistakes
export const logCodeQualityMistake = (
  title: string,
  description: string,
  context?: {
    file?: string
    function?: string
    issue?: string
    impact?: string
  }
) => {
  return logAIMistake(
    'best-practices',
    'medium',
    title,
    description,
    context,
    {
      codeQuality: 'Reduced code quality and maintainability',
      performance: 'Potential performance issues'
    },
    'Follow established coding standards and best practices',
    [
      'Follow established coding standards',
      'Consider performance implications',
      'Keep solutions simple and maintainable',
      'Use consistent formatting'
    ],
    ['code-quality', 'best-practices', 'standards'],
    [
      'Study coding best practices',
      'Consider performance implications',
      'Focus on maintainability'
    ]
  )
}

// Performance mistakes
export const logPerformanceMistake = (
  title: string,
  description: string,
  context?: {
    file?: string
    function?: string
    performanceIssue?: string
    impact?: string
  }
) => {
  return logAIMistake(
    'performance',
    'high',
    title,
    description,
    context,
    {
      performance: 'Performance degradation',
      userExperience: 'Poor user experience due to slow performance'
    },
    'Consider performance implications and optimize code',
    [
      'Consider performance implications',
      'Use efficient algorithms and data structures',
      'Avoid unnecessary re-renders',
      'Profile code for bottlenecks'
    ],
    ['performance', 'optimization', 'efficiency'],
    [
      'Study performance optimization techniques',
      'Understand React performance patterns',
      'Learn about efficient algorithms'
    ]
  )
}

// Security mistakes
export const logSecurityMistake = (
  title: string,
  description: string,
  context?: {
    file?: string
    vulnerability?: string
    risk?: string
  }
) => {
  return logAIMistake(
    'security',
    'critical',
    title,
    description,
    context,
    {
      security: 'Security vulnerability introduced',
      userExperience: 'Potential security risks for users'
    },
    'Always consider security implications and follow security best practices',
    [
      'Always validate and sanitize user input',
      'Use proper authentication and authorization',
      'Follow security best practices',
      'Consider potential attack vectors'
    ],
    ['security', 'vulnerability', 'safety'],
    [
      'Study security best practices',
      'Understand common vulnerabilities',
      'Learn about secure coding patterns'
    ]
  )
}

// Error handling mistakes
export const logErrorHandlingMistake = (
  title: string,
  description: string,
  context?: {
    file?: string
    function?: string
    error?: string
    impact?: string
  }
) => {
  return logAIMistake(
    'error-handling',
    'high',
    title,
    description,
    context,
    {
      userExperience: 'Poor error handling leads to bad UX',
      debuggingTime: 'Time needed to debug unhandled errors'
    },
    'Implement proper error handling and user feedback',
    [
      'Always handle potential errors',
      'Provide meaningful error messages',
      'Use try-catch blocks appropriately',
      'Implement proper error boundaries'
    ],
    ['error-handling', 'exceptions', 'user-feedback'],
    [
      'Study error handling best practices',
      'Learn about React error boundaries',
      'Understand async error handling'
    ]
  )
}

/**
 * Utility functions for managing AI mistakes
 */

// Get a summary of AI learning progress
export const getAILearningProgress = () => {
  const insights = getAIMistakeInsights()
  const summary = getAILearningSummary()
  
  return {
    totalMistakes: insights.totalMistakes,
    resolvedMistakes: insights.resolvedMistakes,
    repeatMistakes: insights.repeatMistakes,
    mostCommonIssues: insights.mostCommonCategory,
    topLearningPoints: summary.keyLearningPoints.slice(0, 5),
    improvementAreas: summary.improvementAreas,
    preventionStrategies: summary.preventionStrategies.slice(0, 5)
  }
}

// Add a note to an existing mistake
export const addNoteToMistake = (mistakeId: string, note: string) => {
  return addAIMistakeNote(mistakeId, note)
}

// Quick logging with minimal parameters
export const quickLogMistake = (
  category: AIMistakeCategory,
  title: string,
  description: string,
  severity: AIMistakeSeverity = 'medium'
) => {
  return logAIMistake(category, severity, title, description)
}

// Log a mistake with user correction
export const logMistakeWithCorrection = (
  category: AIMistakeCategory,
  title: string,
  description: string,
  userCorrection: string,
  severity: AIMistakeSeverity = 'medium'
) => {
  return logAIMistake(
    category,
    severity,
    title,
    description,
    { userCorrection },
    undefined,
    `User correction: ${userCorrection}`,
    ['Learn from user corrections', 'Verify understanding before implementing'],
    ['user-correction', 'learning'],
    ['Learn from user feedback', 'Improve understanding of requirements']
  )
}

// Export the mistake log for analysis
export const exportMistakeLog = () => {
  const insights = getAIMistakeInsights()
  const summary = getAILearningSummary()
  
  return {
    timestamp: new Date().toISOString(),
    insights,
    learningSummary: summary,
    recommendations: {
      focusAreas: summary.improvementAreas,
      keyLearnings: summary.keyLearningPoints.slice(0, 10),
      preventionStrategies: summary.preventionStrategies.slice(0, 10)
    }
  }
}
