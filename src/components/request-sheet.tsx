"use client";

import type { Dispatch, SetStateAction } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { RequestForm } from './request-form';

interface RequestSheetProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function RequestSheet({ open, setOpen }: RequestSheetProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="rounded-t-2xl sm:max-w-xl mx-auto p-0">
        <div className="p-6">
            <SheetHeader>
            <SheetTitle className="font-headline text-2xl">Create New Exchange Request</SheetTitle>
            <SheetDescription>
                Find the best match for your currency exchange needs. Enter the details below.
            </SheetDescription>
            </SheetHeader>
        </div>
        <div className="p-6 pt-0">
            <RequestForm setSheetOpen={setOpen} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
