'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DebugAuth() {
  const { user, isLoading, isSignedIn } = useAuth();

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Debug Auth State</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Is Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User:</strong> {user ? 'Yes' : 'No'}
          </div>
          {user && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Name:</strong> {user.full_name}</div>
              <div><strong>Verified:</strong> {user.is_verified ? 'Yes' : 'No'}</div>
              <div><strong>ID:</strong> {user.id}</div>
            </div>
          )}
          <div className="mt-4">
            <strong>Tokens:</strong>
            <div className="text-xs">
              <div>Access Token: {typeof window !== 'undefined' && localStorage.getItem('access_token') ? 'Present' : 'Missing'}</div>
              <div>Refresh Token: {typeof window !== 'undefined' && localStorage.getItem('refresh_token') ? 'Present' : 'Missing'}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 