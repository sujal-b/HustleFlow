"use client";

import type { Dispatch, SetStateAction } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RequestForm } from './request-form';

interface RequestDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function RequestDialog({ open, setOpen }: RequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl p-0">
        <div className="p-6">
            <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Create New Exchange Request</DialogTitle>
            <DialogDescription>
                Find the best match for your currency exchange needs. Enter the details below.
            </DialogDescription>
            </DialogHeader>
        </div>
        <div className="p-6 pt-0">
            <RequestForm setSheetOpen={setOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
