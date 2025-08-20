
"use client";

import type { ExchangeRequest } from "@/lib/types";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { CheckCircle2, Lock, Star, Phone, Home, User, Bell } from "lucide-react";
import { Textarea } from "./ui/textarea";

interface TransactionDialogProps {
  request: ExchangeRequest;
  children: React.ReactNode;
}

export function TransactionDialog({ request, children }: TransactionDialogProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const handleFeedback = () => {
    setFeedbackSubmitted(true);
  }

  return (
    <AlertDialog onOpenChange={(open) => { if(!open) { setIsConfirmed(false); setFeedbackSubmitted(false); }}}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline">
            {isConfirmed ? "Transaction Details" : "Confirm Exchange"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isConfirmed
              ? "Your transaction is confirmed. You can now contact the user."
              : `You are about to start a transaction with User ${request.user.name}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {isConfirmed ? (
            <div className="space-y-4 py-4">
                {feedbackSubmitted ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-secondary rounded-lg">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold">Thank you!</h3>
                        <p className="text-muted-foreground">Your feedback has been submitted.</p>
                    </div>
                ) : (
                    <>
                    <div className="rounded-lg border p-4 space-y-3">
                        <div>
                            <p className="font-semibold text-sm text-muted-foreground">Transaction ID:</p>
                            <p className="font-mono bg-muted p-2 rounded-md text-sm">{request.id}</p>
                        </div>
                        <div className="pt-2">
                             <p className="font-semibold text-sm text-muted-foreground mb-2">Contact Info:</p>
                             <div className="space-y-2">
                                <p className="flex items-center gap-2"><User className="w-4 h-4 text-primary"/>{request.user.realName}</p>
                                <p className="flex items-center gap-2"><Home className="w-4 h-4 text-primary"/>{request.user.room}</p>
                                {request.user.contact && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary"/>{request.user.contact}</p>}
                             </div>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => alert("Notification functionality to be implemented.")}>
                        <Bell className="w-4 h-4 mr-2" />
                        Notify User
                    </Button>
                     <div className="space-y-2">
                        <h4 className="font-semibold">Leave Anonymous Feedback</h4>
                        <Textarea placeholder={`How was your exchange with User ${request.user.name}?`} />
                     </div>
                    </>
                )}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-secondary rounded-lg">
                <Lock className="w-16 h-16 text-primary/80 mb-4"/>
                <p className="text-muted-foreground max-w-xs">Real user details are hidden for privacy. Contact info and a secure chat room will be unlocked upon confirmation from all parties.</p>
            </div>
        )}

        <AlertDialogFooter>
          {isConfirmed ? (
            feedbackSubmitted ? (
                <AlertDialogCancel asChild><Button variant="secondary">Close</Button></AlertDialogCancel>
            ) : (
                <>
                <AlertDialogCancel asChild><Button variant="ghost">Close</Button></AlertDialogCancel>
                <AlertDialogAction onClick={handleFeedback} className="bg-accent hover:bg-accent/90">
                    <Star className="w-4 h-4 mr-2" /> Submit Feedback
                </AlertDialogAction>
                </>
            )
          ) : (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                Confirm & Reveal Info
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
