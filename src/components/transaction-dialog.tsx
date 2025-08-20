
"use client";

import type { ExchangeRequest } from "@/lib/types";
import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Check, CheckCircle2, Home, Loader2, Lock, Phone, Send, User, X } from "lucide-react";
import { getUserDetails } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";
import { acceptOfferAction, makeOfferAction, rejectOfferAction } from "@/app/actions";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import type { UserDetails } from "@/lib/user-store";

interface TransactionDialogProps {
  request: ExchangeRequest;
  children: React.ReactNode;
}

export function TransactionDialog({ request, children }: TransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [isPending, startTransition] = useTransition();
  const [offerAmount, setOfferAmount] = useState<number>(request.amount);
  const { toast } = useToast();

  useEffect(() => {
    const user = getUserDetails();
    if (user) {
      setCurrentUser(user);
      setIsOwner(user.token === request.user.token);
    }
  }, [request.user.token, open]);

  const handleMakeOffer = () => {
    startTransition(async () => {
      const result = await makeOfferAction({ requestId: request.id, offerAmount }, currentUser);
      if (result.success) {
        toast({ title: "Offer Sent", description: result.reasoning });
        setOpen(false);
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    });
  };

  const handleAcceptOffer = (offerId: string) => {
    startTransition(async () => {
        const result = await acceptOfferAction(request.id, offerId, currentUser?.token);
        if (result.success) {
            toast({ title: "Offer Accepted!", description: result.reasoning });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    });
  }
  
  const handleRejectOffer = (offerId: string) => {
    startTransition(async () => {
        const result = await rejectOfferAction(request.id, offerId, currentUser?.token);
        if (result.success) {
            toast({ title: "Offer Rejected", description: result.reasoning });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    });
  }

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  const confirmedMatch = request.status === 'Fully Matched' ? 
    request.offers.find(o => o.status === 'accepted') : undefined;
  
  const canMakeOffer = !isOwner && request.status !== 'Fully Matched' && !request.offers.some(o => o.user.token === currentUser?.token);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Request Details</DialogTitle>
          <DialogDescription>
            {isOwner ? "Manage offers for your request." : "Make an offer for this exchange."}
          </DialogDescription>
        </DialogHeader>

        {confirmedMatch && (currentUser?.token === confirmedMatch.user.token || isOwner) ? (
            // View for the two matched parties
            <div className="space-y-4 py-4">
                 <div className="flex flex-col items-center justify-center text-center p-8 bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold">Transaction Confirmed!</h3>
                    <p className="text-muted-foreground">You are matched. Here are the details:</p>
                </div>
                 <div className="rounded-lg border p-4 space-y-3">
                    <p className="font-semibold text-sm text-muted-foreground mb-2">Contact Info for {isOwner ? confirmedMatch.user.name : request.user.name}:</p>
                     <div className="space-y-2">
                        <p className="flex items-center gap-2"><User className="w-4 h-4 text-primary"/>{isOwner ? confirmedMatch.user.realName : request.user.realName}</p>
                        <p className="flex items-center gap-2"><Home className="w-4 h-4 text-primary"/>{isOwner ? confirmedMatch.user.room : request.user.room}</p>
                        {(isOwner ? confirmedMatch.user.contact : request.user.contact) && 
                            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary"/>{isOwner ? confirmedMatch.user.contact : request.user.contact}</p>
                        }
                     </div>
                </div>
                <Button variant="outline" onClick={() => alert("Notification functionality to be implemented.")}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Secure Message
                </Button>
            </div>
        ) : isOwner ? (
            // Owner's view: list of offers
            <div className="py-4 space-y-4">
                {request.offers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No offers yet.</p>
                ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {request.offers.filter(o => o.status === 'pending').map(offer => (
                        <div key={offer.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="font-semibold">{offer.user.name}</p>
                                <p className="text-primary font-bold">{currencyFormatter.format(offer.amount)}</p>
                            </div>
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-400 hover:bg-red-900/50" onClick={() => handleRejectOffer(offer.id)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400 hover:text-green-400 hover:bg-green-900/50" onClick={() => handleAcceptOffer(offer.id)}>
                                        <Check className="w-5 h-5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                     {request.offers.filter(o => o.status !== 'pending').map(offer => (
                        <div key={offer.id} className="flex items-center justify-between rounded-lg border p-3 opacity-50">
                            <div>
                                <p className="font-semibold line-through">{offer.user.name}</p>
                                <p className="text-muted-foreground font-bold line-through">{currencyFormatter.format(offer.amount)}</p>
                            </div>
                            <Badge variant={offer.status === 'accepted' ? 'default' : 'destructive'} className="capitalize">{offer.status}</Badge>
                        </div>
                    ))}
                    </div>
                )}
            </div>
        ) : (
             // Non-owner's view
            <div className="py-4 space-y-4">
                {request.status === 'Fully Matched' ? (
                     <p className="text-center text-muted-foreground py-8">This request has been fully matched.</p>
                ) : request.offers.some(o => o.user.token === currentUser?.token) ? (
                    <p className="text-center text-muted-foreground py-8">You have already made an offer on this request.</p>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center text-center p-8 bg-secondary rounded-lg">
                            <Lock className="w-16 h-16 text-primary/80 mb-4"/>
                            <p className="text-muted-foreground max-w-xs">Real user details are hidden for privacy. They will be revealed upon confirmation from all parties.</p>
                        </div>
                         <div className="space-y-2">
                            <label htmlFor="offerAmount" className="text-sm font-medium">Your Offer Amount</label>
                            <Input 
                                id="offerAmount"
                                type="number"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(Number(e.target.value))}
                                max={request.amount}
                                min={1}
                            />
                        </div>
                    </div>
                )}
            </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {canMakeOffer && (
             <Button onClick={handleMakeOffer} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Offer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
