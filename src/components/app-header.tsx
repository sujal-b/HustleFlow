
"use client";

import { ArrowRightLeft, Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUserDetails } from '@/lib/user-store';

interface AppHeaderProps {
  setRequestSheetOpen: (isOpen: boolean) => void;
}

const ADMIN_TOKEN = "admin_super_secret_token";

export function AppHeader({ setRequestSheetOpen }: AppHeaderProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // This check must run on the client after hydration
    const user = getUserDetails();
    if (user && user.token === ADMIN_TOKEN) {
      setIsAdmin(true);
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="h-7 w-7 text-primary" />
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          HustleFlow
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Button variant="outline" asChild>
            <Link href="/admin">
              <Shield className="-ml-1 h-5 w-5" />
              Admin Dashboard
            </Link>
          </Button>
        )}
        <Button 
          onClick={() => setRequestSheetOpen(true)} 
          className="animate-pulse hover:animate-none"
        >
          <Plus className="-ml-1 h-5 w-5" />
          New Request
        </Button>
      </div>
    </header>
  );
}
