
"use client";

import type { ExchangeRequest } from "@/lib/types";
import { useState, useEffect, useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { RequestDialog } from "@/components/request-dialog";
import { RequestCard } from "./request-card";
import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { UserDetailsDialog } from "./user-details-dialog";
import { getUserDetails } from "@/lib/user-store";
import type { UserDetails } from "@/lib/user-store";
import { PageHeader } from "./page-header";

export function MainPage({ requests }: { requests: ExchangeRequest[] }) {
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [filter, setFilter] = useState<'all' | 'cash' | 'digital'>('all');

  useEffect(() => {
    // This check runs on the client after hydration
    const userDetails = getUserDetails();
    if (userDetails?.name) {
      setCurrentUser(userDetails);
    } else {
      setUserDetailsDialogOpen(true);
    }
  }, []);

  const onUserDetailsSave = () => {
    setCurrentUser(getUserDetails());
    setUserDetailsDialogOpen(false);
  };

  const { myActivityRequests, otherRequests } = useMemo(() => {
    if (!currentUser) {
      return { myActivityRequests: [], otherRequests: requests };
    }
    
    const myActivity = new Set<string>();
    const myRequests = requests.filter(r => {
      const isMine = r.user.token === currentUser.token;
      if (isMine) myActivity.add(r.id);
      return isMine;
    });

    const myOffersOnRequests = requests.filter(r => {
      const hasMyOffer = r.offers.some(o => o.user.token === currentUser.token);
       if (hasMyOffer) myActivity.add(r.id);
      return hasMyOffer;
    });

    // Combine and remove duplicates
    const combinedActivity = [...myRequests, ...myOffersOnRequests];
    const uniqueMyActivityRequests = combinedActivity.filter((request, index, self) =>
        index === self.findIndex((r) => r.id === request.id)
    );

    const otherRequests = requests.filter(r => !myActivity.has(r.id));

    return { myActivityRequests: uniqueMyActivityRequests, otherRequests };

  }, [requests, currentUser]);
  
  const filteredRequests = useMemo(() => {
     if (filter === 'all') return otherRequests;
     return otherRequests.filter(request => request.type === filter);
  }, [filter, otherRequests]);
  
  const isHighlighted = (request: ExchangeRequest): boolean => {
    if (!currentUser) return false;

    // Highlight for the request owner if there's a new pending offer.
    const isOwner = request.user.token === currentUser.token;
    if (isOwner) {
      return request.offers.some(o => o.status === 'pending');
    }

    // Highlight for the offer maker if their offer was accepted.
    const myOffer = request.offers.find(o => o.user.token === currentUser.token);
    if (myOffer && myOffer.status === 'accepted') {
      return true;
    }

    return false;
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader setRequestSheetOpen={() => setRequestSheetOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-5xl">

          <PageHeader
            title="HustleFlow"
            description="Seamlessly exchange currencies with trusted peers."
          />
          
          {myActivityRequests.length > 0 && (
             <div className="mb-12">
                <div className="mb-6">
                    <h2 className="font-headline text-3xl font-bold tracking-tight">My Activity</h2>
                    <p className="text-muted-foreground">Requests you've created or made offers on. Highlights indicate an action is needed.</p>
                </div>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {myActivityRequests.map((request) => (
                        <RequestCard 
                          key={request.id} 
                          request={request}
                          isHighlighted={isHighlighted(request)} 
                        />
                    ))}
                </div>
             </div>
          )}

          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight">Active Requests</h2>
              <p className="text-muted-foreground">Browse opportunities or create your own request.</p>
            </div>
            <ToggleGroup 
              type="single" 
              value={filter}
              onValueChange={(value: 'all' | 'cash' | 'digital') => value && setFilter(value)}
              className="bg-card p-1 rounded-lg"
            >
              <ToggleGroupItem value="all" aria-label="Toggle all">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="cash" aria-label="Toggle cash">
                Cash
              </ToggleGroupItem>
              <ToggleGroupItem value="digital" aria-label="Toggle digital">
                Digital
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <h3 className="text-xl font-semibold">No active requests</h3>
                <p className="text-muted-foreground mt-2">
                  {filter === 'all' 
                    ? "Be the first to create one!" 
                    : `There are no active '${filter}' requests. Try a different filter or create a new one.`
                  }
                </p>
                <Button 
                  onClick={() => setRequestSheetOpen(true)}
                  className="mt-4"
                >
                  Create Request
                </Button>
            </div>
          )}
        </div>
      </main>
      <RequestDialog open={requestSheetOpen} setOpen={setRequestSheetOpen} />
      <UserDetailsDialog 
        open={userDetailsDialogOpen} 
        setOpen={setUserDetailsDialogOpen} 
        onSave={onUserDetailsSave}
      />
    </div>
  );
}
