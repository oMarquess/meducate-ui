'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { verifyEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    const handleVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully! You can now access your account.');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        if (error.response?.status === 400) {
          setMessage('Invalid or expired verification token. Please sign up again or request a new verification email.');
        } else {
          setMessage('An error occurred during verification. Please try again.');
        }
      }
    };

    handleVerification();
  }, [searchParams, verifyEmail, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            Verifying your email address...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Please wait while we verify your email...</p>
            </div>
          )}

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status !== 'loading' && (
            <div className="text-center space-y-2">
              {status === 'success' ? (
                <p className="text-sm text-muted-foreground">
                  Redirecting to dashboard in a few seconds...
                </p>
              ) : (
                <div className="space-y-2">
                  <Link href="/sign-up">
                    <Button className="w-full">
                      Sign Up Again
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="outline" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Please wait...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 