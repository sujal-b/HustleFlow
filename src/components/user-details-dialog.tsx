
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { saveUserDetails } from '@/lib/user-store';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from './ui/input';

interface UserDetailsDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSave: () => void;
}

const userDetailsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  room: z.string().min(1, { message: "Room is required." }),
  contact: z.string().optional(),
});

type UserDetailsFormValues = z.infer<typeof userDetailsSchema>;

export function UserDetailsDialog({ open, setOpen, onSave }: UserDetailsDialogProps) {
  const form = useForm<UserDetailsFormValues>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      name: '',
      room: '',
      contact: '',
    },
  });

  const onSubmit = (data: UserDetailsFormValues) => {
    saveUserDetails(data);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Your Details</DialogTitle>
          <DialogDescription>
            This information is kept private until a transaction is fully confirmed. It's stored locally on your device for 24 hours.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. B-101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone or social handle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save and Continue</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
