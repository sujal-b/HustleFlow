"use client";

import type { ExchangeRequest } from "@/lib/types";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { RequestDialog } from "@/components/request-dialog";
import { RequestCard } from "./request-card";
import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export function MainPage({ requests }: { requests: ExchangeRequest[] }) {
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'cash' | 'digital'>('all');

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.type === filter;
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader setRequestSheetOpen={setRequestSheetOpen} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
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
    </div>
  );
}
