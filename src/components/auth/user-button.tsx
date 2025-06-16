'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LogOut, User, Home, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UserButtonProps {
  afterSignOutUrl?: string;
}

export function UserButton({ afterSignOutUrl = '/' }: UserButtonProps) {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleCloseDialog = () => {
    setShowSignOutDialog(false);
    // Ensure focus returns to the page
    setTimeout(() => {
      document.body.focus();
    }, 100);
  };

  const handleSignOut = async () => {
    await signOut();
    handleCloseDialog();
  };

  const handleSignOutAndGoToSignIn = async () => {
    await signOut();
    setShowSignOutDialog(false);
    router.push('/sign-in');
  };

  const handleSignOutAndGoToHome = async () => {
    await signOut();
    setShowSignOutDialog(false);
    window.location.href = 'https://www.meducate.cloud/';
  };

  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!user) {
    return null;
  }

  const initials = user.full_name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSignOutDialog(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSignOutDialog} onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        } else {
          setShowSignOutDialog(open);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              You are about to sign out. Where would you like to go next?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOutAndGoToHome}
              className="w-full sm:flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button 
              onClick={handleSignOutAndGoToSignIn}
              className="w-full sm:flex-1"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 