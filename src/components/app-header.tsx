"use client";

import type { Dispatch, SetStateAction } from 'react';
import { ArrowRightLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  setRequestSheetOpen: Dispatch<SetStateAction<boolean>>;
}

export function AppHeader({ setRequestSheetOpen }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="h-7 w-7 text-primary" />
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          HustleFlow
        </h1>
      </div>
      <Button 
        onClick={() => setRequestSheetOpen(true)} 
        className="animate-pulse hover:animate-none"
      >
        <Plus className="-ml-1 h-5 w-5" />
        New Request
      </Button>
    </header>
  );
}
