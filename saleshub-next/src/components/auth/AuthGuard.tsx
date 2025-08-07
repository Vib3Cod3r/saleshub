'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: user, isLoading, error } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // Don't redirect if we're on a public route
    if (isPublicRoute) {
      return;
    }

    // If not loading and no user, redirect to login
    if (!isLoading && !user && error) {
      router.push('/login');
    }
  }, [user, isLoading, error, router, pathname, isPublicRoute]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner">Checking authentication...</div>
      </div>
    );
  }

  // If on public route, show the page without the main app layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If no user and not on public route, show loading (will redirect)
  if (!user && error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner">Redirecting to login...</div>
      </div>
    );
  }

  // If user is authenticated, show the main app
  return <>{children}</>;
} 