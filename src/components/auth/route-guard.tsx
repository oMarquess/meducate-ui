'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVerification?: boolean;
}

export function RouteGuard({ 
  children, 
  requireAuth = true, 
  requireVerification = true 
}: RouteGuardProps) {
  const { user, isLoading, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      console.log('RouteGuard: Still loading...');
      return;
    }

    console.log('RouteGuard check:', { requireAuth, requireVerification, user: !!user, isSignedIn, isVerified: user?.is_verified });

    if (requireAuth && !user) {
      console.log('RouteGuard: No user, redirecting to sign-in');
      router.push('/sign-in');
      return;
    }

    if (requireVerification && user && !user.is_verified) {
      console.log('RouteGuard: User not verified, redirecting to sign-in');
      router.push('/sign-in');
      return;
    }

    console.log('RouteGuard: Access granted');
  }, [user, isLoading, isSignedIn, router, requireAuth, requireVerification]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect via useEffect
  }

  if (requireVerification && user && !user.is_verified) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
} 