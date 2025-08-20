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
import { Banknote, MapPin, Star, Wallet } from 'lucide-react';
import { TransactionDialog } from './transaction-dialog';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: ExchangeRequest;
}

const statusColors: Record<ExchangeRequest['status'], string> = {
    "Open": "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300",
    "Partially Matched": "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300",
    "Fully Matched": "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300",
}

export function RequestCard({ request }: RequestCardProps) {
  const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: request.currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex-row items-start gap-4 pb-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={request.user.avatarUrl} alt={request.user.name} data-ai-hint="person portrait" />
          <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="font-headline text-xl">{currencyFormatter.format(request.amount)}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span>by {request.user.name}</span>
            <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-500 fill-yellow-400" /> {request.user.rating}</span>
          </CardDescription>
        </div>
        <Badge variant="outline" className={cn("capitalize", statusColors[request.status])}>
            {request.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {request.type === 'cash' ? <Banknote className="w-4 h-4 text-primary"/> : <Wallet className="w-4 h-4 text-primary" />}
            <span className="capitalize">{request.type} Exchange</span>
        </div>
        {request.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{request.location}</span>
            </div>
        )}
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
  );
}
