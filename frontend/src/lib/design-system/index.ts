// Design tokens
export * from './colors'
export * from './spacing'
export * from './typography'

// Design system utilities
export const designSystem = {
  colors: {
    ...require('./colors').colors,
    semantic: require('./colors').semanticColors,
  },
  spacing: require('./spacing').spacing,
  typography: require('./typography').typography,
}

// Utility functions
export function getColor(scale: string, shade: string | number): string {
  const colorScale = designSystem.colors[scale as keyof typeof designSystem.colors]
  if (typeof colorScale === 'object' && colorScale !== null) {
    return colorScale[shade as keyof typeof colorScale] as string
  }
  return ''
}

export function getSpacing(size: string): string {
  return designSystem.spacing[size as keyof typeof designSystem.spacing] || ''
}

export function getTypography(style: string): any {
  return designSystem.typography.textStyles[style as keyof typeof designSystem.typography.textStyles] || {}
}

// CSS custom properties generator
export function generateCSSVariables(): string {
  const variables: string[] = []
  
  // Color variables
  Object.entries(designSystem.colors).forEach(([scaleName, scale]) => {
    if (typeof scale === 'object' && scale !== null) {
      Object.entries(scale).forEach(([shade, value]) => {
        variables.push(`--color-${scaleName}-${shade}: ${value};`)
      })
    }
  })
  
  // Spacing variables
  Object.entries(designSystem.spacing).forEach(([name, value]) => {
    if (typeof value === 'string') {
      variables.push(`--spacing-${name}: ${value};`)
    }
  })
  
  // Typography variables
  Object.entries(designSystem.typography.fontSizes).forEach(([name, value]) => {
    variables.push(`--font-size-${name}: ${value};`)
  })
  
  Object.entries(designSystem.typography.fontWeights).forEach(([name, value]) => {
    variables.push(`--font-weight-${name}: ${value};`)
  })
  
  return `:root {\n  ${variables.join('\n  ')}\n}`
}

// Tailwind CSS configuration helper
export function getTailwindConfig() {
  return {
    theme: {
      extend: {
        colors: designSystem.colors,
        spacing: designSystem.spacing,
        fontSize: designSystem.typography.fontSizes,
        fontWeight: designSystem.typography.fontWeights,
        lineHeight: designSystem.typography.lineHeights,
        letterSpacing: designSystem.typography.letterSpacing,
        fontFamily: designSystem.typography.fontFamily,
      },
    },
  }
}
