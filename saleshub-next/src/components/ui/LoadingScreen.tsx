'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/lib/hooks';
import { usePathname } from 'next/navigation';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function LoadingScreen() {
  const { isLoading, isError, error } = useCurrentUser();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading SalesHub CRM...');

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // Don't show loading screen on public routes
    if (isPublicRoute) {
      setIsVisible(false);
      return;
    }

    // Hide loading screen when authentication check is complete (including errors)
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isPublicRoute]);

  useEffect(() => {
    if (!isVisible) return;

    const messages = [
      'Loading SalesHub CRM...',
      'Checking server connection...',
      'Loading dashboard...',
      'Initializing application...'
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (isVisible) {
        setLoadingMessage(messages[currentIndex % messages.length]);
        currentIndex++;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="loading-screen">
      <div className="loader">
        <div className="spinner"></div>
        <p className="loading-message">{loadingMessage}</p>
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p className="progress-text">Initializing application...</p>
        </div>
      </div>
    </div>
  );
} 