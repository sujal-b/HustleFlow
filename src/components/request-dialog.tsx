
"use client";

import type { Dispatch, SetStateAction } from 'react';
import type { ExchangeRequest } from '@/lib/types';
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
  request?: ExchangeRequest;
}

export function RequestDialog({ open, setOpen, request }: RequestDialogProps) {
  const isEditMode = !!request;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl p-0">
        <div className="p-6">
            <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {isEditMode ? "Edit Exchange Request" : "Create New Exchange Request"}
            </DialogTitle>
            <DialogDescription>
                {isEditMode 
                  ? "Update the details of your request below."
                  : "Find the best match for your currency exchange needs. Enter the details below."
                }
            </DialogDescription>
            </DialogHeader>
        </div>
        <div className="p-6 pt-0">
            <RequestForm setSheetOpen={setOpen} request={request} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
