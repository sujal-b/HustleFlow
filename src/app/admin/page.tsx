
import { getRequests } from "@/lib/requests-store";
import { getUserDetails } from "@/lib/user-store";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

const ADMIN_TOKEN = "admin_super_secret_token";

export default function AdminPage() {
    const user = getUserDetails();

    if (user?.token !== ADMIN_TOKEN) {
        // In a real app, you might redirect to a login page
        // For now, we'll just show an access denied message, but redirecting is better.
        redirect('/');
    }

    const requests = getRequests();
    
    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Comprehensive view of all active requests and user data.</p>
                </div>
                 <Button variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to App
                    </Link>
                 </Button>
            </div>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Requester</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Offers</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        )}
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell className="font-mono text-xs">{request.id}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{request.user.realName}</div>
                                    <div className="text-xs text-muted-foreground">Room: {request.user.room}</div>
                                    {request.user.contact && <div className="text-xs text-muted-foreground">Contact: {request.user.contact}</div>}
                                </TableCell>
                                <TableCell>{currencyFormatter.format(request.amount)}</TableCell>
                                <TableCell><Badge variant="outline">{request.type}</Badge></TableCell>
                                <TableCell><Badge variant={request.status === "Fully Matched" ? "default" : "secondary"}>{request.status}</Badge></TableCell>
                                <TableCell>
                                    {request.offers.length === 0 ? "None" : (
                                        <ul className="space-y-2">
                                            {request.offers.map(offer => (
                                                <li key={offer.id} className="text-xs border-l-2 pl-2 border-dashed">
                                                    <div className="font-medium">{currencyFormatter.format(offer.amount)} by {offer.user.realName}</div>
                                                    <div className="text-muted-foreground">Room: {offer.user.room}</div>
                                                    {offer.user.contact && <div className="text-muted-foreground">Contact: {offer.user.contact}</div>}
                                                    <div>Status: <Badge variant="outline" className="text-xs">{offer.status}</Badge></div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
