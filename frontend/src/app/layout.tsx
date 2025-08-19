import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ErrorBoundary from '@/components/error-boundary'
import { QueryProvider } from '@/providers/query-provider'
import { AuthProvider } from '@/hooks/use-auth-provider'
import { MainContent } from '@/components/layout/main-content'
import { setupGlobalErrorInterceptor } from '@/lib/global-error-interceptor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sales CRM',
  description: 'Modern Sales CRM Application',
}

// Set up global error interceptor on client side
// Temporarily disabled to debug 500 error
// if (typeof window !== 'undefined') {
//   setupGlobalErrorInterceptor()
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <MainContent>
                {children}
              </MainContent>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
