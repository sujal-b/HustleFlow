
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
import { Banknote, Clock, Wallet } from 'lucide-react';
import { TransactionDialog } from './transaction-dialog';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: ExchangeRequest;
}

const statusColors: Record<ExchangeRequest['status'], string> = {
    "Open": "bg-blue-900/50 text-blue-300 border-blue-300/50",
    "Partially Matched": "bg-yellow-900/50 text-yellow-300 border-yellow-300/50",
    "Fully Matched": "bg-green-900/50 text-green-300 border-green-300/50",
}

export function RequestCard({ request }: RequestCardProps) {
  const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 bg-card hover:bg-card/90">
      <CardHeader className="flex-row items-start gap-4 pb-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={request.user.avatarUrl} alt={request.user.name} data-ai-hint="person portrait" />
          <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="font-headline text-xl">{currencyFormatter.format(request.amount)}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span>by User {request.user.token}</span>
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
  );
}
