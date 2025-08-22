'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    setStatus('Test page loaded successfully!')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="text-lg">{status}</p>
        <p className="text-sm text-gray-600 mt-4">
          If you can see this, the basic Next.js setup is working.
        </p>
      </div>
    </div>
  )
}
