/**
 * Export utilities for file downloads and data export
 */

export interface ExportOptions {
  filename?: string
  mimeType?: string
  extension?: string
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  mimeType: 'application/json',
  extension: 'json'
}

/**
 * Downloads data as a file
 */
export function downloadFile(
  data: string | Blob,
  options: ExportOptions = {}
): void {
  const { filename, mimeType, extension } = { ...DEFAULT_EXPORT_OPTIONS, ...options }
  
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `export-${new Date().toISOString().split('T')[0]}.${extension}`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exports JSON data as a downloadable file
 */
export function exportJSON(
  data: unknown,
  filename?: string,
  options: Omit<ExportOptions, 'mimeType' | 'extension'> = {}
): void {
  const jsonString = JSON.stringify(data, null, 2)
  downloadFile(jsonString, {
    ...options,
    filename: filename || `export-${new Date().toISOString().split('T')[0]}.json`,
    mimeType: 'application/json',
    extension: 'json'
  })
}

/**
 * Exports CSV data as a downloadable file
 */
export function exportCSV(
  data: string[][],
  filename?: string,
  options: Omit<ExportOptions, 'mimeType' | 'extension'> = {}
): void {
  const csvContent = data.map(row => row.join(',')).join('\n')
  downloadFile(csvContent, {
    ...options,
    filename: filename || `export-${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv',
    extension: 'csv'
  })
}

/**
 * Generates a filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().split('T')[0]
  return `${prefix}-${timestamp}.${extension}`
}
