import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize WebSocket connection and real-time dashboard updates
  const { isConnected } = useWebSocket()
  useRealtimeDashboard()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        {/* WebSocket Connection Status Indicator */}
        {!isConnected && (
          <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm">Connecting...</span>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
