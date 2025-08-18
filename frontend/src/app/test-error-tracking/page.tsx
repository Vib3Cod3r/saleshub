'use client'

import { useState } from 'react'
import { logCompaniesError, logRegistryError, logHookError } from '@/lib/cursor-error-tracker'
import { logAnalysisReport, getCompaniesPageAnalysis, getRegistryAnalysis } from '@/lib/cursor-analysis-export'

export default function TestErrorTrackingPage() {
  const [analysis, setAnalysis] = useState<any>(null)

  const testCompaniesError = () => {
    logCompaniesError('Test companies page error', 'TestComponent', 'test-action')
  }

  const testRegistryError = () => {
    logRegistryError('Test registry error', 'use-version-registry', 'test-registry-action')
  }

  const testHookError = () => {
    logHookError('Test hook error', 'use-test-hook', 'TestComponent')
  }

  const testRealError = () => {
    // This will trigger the actual error we're tracking
    const registry = { getStats: undefined }
    try {
      registry.getStats()
    } catch (error) {
      logRegistryError(error as Error, 'use-version-registry', 'getStats-call')
    }
  }

  const viewAnalysis = () => {
    logAnalysisReport()
    setAnalysis({
      companies: getCompaniesPageAnalysis(),
      registry: getRegistryAnalysis(),
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Error Tracking Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Error Logging</h2>
          
          <button
            onClick={testCompaniesError}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Companies Error
          </button>
          
          <button
            onClick={testRegistryError}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Registry Error
          </button>
          
          <button
            onClick={testHookError}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test Hook Error
          </button>
          
          <button
            onClick={testRealError}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test Real getStats Error
          </button>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Analysis</h2>
          
          <button
            onClick={viewAnalysis}
            className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            View Analysis Report
          </button>
          
          <button
            onClick={() => (window as any).cursorAnalysis?.exportReport()}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Export Analysis
          </button>
        </div>
      </div>

      {analysis && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Companies Page Analysis</h3>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(analysis.companies, null, 2)}
              </pre>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Registry Analysis</h3>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(analysis.registry, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">How to Use</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Click the test buttons to simulate different types of errors</li>
          <li>• View the analysis report to see tracked errors and patterns</li>
          <li>• Export the analysis for Cursor to review</li>
          <li>• Check the browser console for detailed error logs</li>
          <li>• The "Test Real getStats Error" simulates the actual error you're experiencing</li>
        </ul>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Cursor Access</h3>
        <p className="text-sm text-blue-700">
          Cursor can access the error analysis through the global <code>window.cursorAnalysis</code> object.
          Use <code>window.cursorAnalysis.logReport()</code> in the browser console to see the full analysis.
        </p>
      </div>
    </div>
  )
}
