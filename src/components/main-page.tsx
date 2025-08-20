"use client";

import type { ExchangeRequest } from "@/lib/types";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { RequestDialog } from "@/components/request-dialog";
import { RequestCard } from "./request-card";
import { Button } from "./ui/button";

export function MainPage({ requests }: { requests: ExchangeRequest[] }) {
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader setRequestSheetOpen={setRequestSheetOpen} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h2 className="font-headline text-3xl font-bold tracking-tight">Active Requests</h2>
            <p className="text-muted-foreground">Browse opportunities or create your own request.</p>
          </div>
          {requests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <h3 className="text-xl font-semibold">No active requests</h3>
                <p className="text-muted-foreground mt-2">Be the first to create one!</p>
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
