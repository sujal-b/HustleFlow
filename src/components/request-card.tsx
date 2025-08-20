
"use client"

import type { ExchangeRequest } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Banknote, Clock, Wallet, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { TransactionDialog } from './transaction-dialog';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { getUserDetails } from '@/lib/user-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect, useTransition } from 'react';
import { RequestDialog } from './request-dialog';
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
import { useToast } from '@/hooks/use-toast';
import { deleteRequestAction } from '@/app/actions';
import { useRouter } from 'next/navigation';


interface RequestCardProps {
  request: ExchangeRequest;
  isHighlighted?: boolean;
}

const ADMIN_TOKEN = "admin_super_secret_token";

const statusColors: Record<ExchangeRequest['status'], string> = {
    "Open": "bg-blue-900/50 text-blue-300 border-blue-300/50",
    "Partially Matched": "bg-yellow-900/50 text-yellow-300 border-yellow-300/50",
    "Fully Matched": "bg-green-900/50 text-green-300 border-green-300/50",
}

export function RequestCard({ request, isHighlighted = false }: RequestCardProps) {
  const [canManage, setCanManage] = useState(false);
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  
  const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });

  useEffect(() => {
    const currentUser = getUserDetails();
    if (currentUser) {
        const isOwner = currentUser.token === request.user.token;
        const isAdmin = currentUser.token === ADMIN_TOKEN;
        setCanManage(isOwner || isAdmin);
    }
  }, [request.user.token]);

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  
  const handleDelete = () => {
    startTransition(async () => {
        const userDetails = getUserDetails();
        const result = await deleteRequestAction(request.id, userDetails);
        if (result.success) {
            toast({
                title: "Request Deleted",
                description: result.reasoning,
            });
            setDeleteAlertOpen(false);
            router.refresh();
        } else {
            toast({
                variant: "destructive",
                title: "Error Deleting Request",
                description: result.error,
            });
        }
    });
  }

  return (
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
    <Card className={cn(
      "flex flex-col hover:shadow-lg transition-shadow duration-300 bg-card hover:bg-card/90",
       isHighlighted && "relative ring-2 ring-accent/80 ring-offset-2 ring-offset-background animate-pulse"
    )}>
      <CardHeader className="flex-row items-start gap-4 pb-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={request.user.avatarUrl} alt={request.user.name} data-ai-hint="person abstract" />
          <AvatarFallback>{request.user.name ? request.user.name.charAt(0) : '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
          <CardTitle className="font-headline text-xl">{currencyFormatter.format(request.amount)}</CardTitle>
          <CardDescription className="flex items-center gap-2">
              <span>by User {request.user.name}</span>
          </CardDescription>
          </div>
          <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("capitalize", statusColors[request.status])}>
                  {request.status}
              </Badge>
              {canManage && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditSheetOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
              )}
          </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {request.type === 'cash' ? <Banknote className="w-4 h-4 text-primary"/> : <Wallet className="w-4 h-4 text-primary" />}
              <span className="capitalize">{request.type} Exchange</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span className="capitalize">{request.urgency}</span>
          </div>
      </CardContent>
      <CardFooter className="flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-2 pt-4">
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
          <TransactionDialog request={request}>
          <Button variant={request.status === 'Fully Matched' ? 'default' : 'secondary'} className="w-full sm:w-auto">
              View Details
          </Button>
          </TransactionDialog>
      </CardFooter>
      </Card>
        
      <RequestDialog open={isEditSheetOpen} setOpen={setEditSheetOpen} request={request} />

      <AlertDialogContent>
          <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your request
              and remove it from view.
          </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
          </AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
