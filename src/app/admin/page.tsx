
"use client";

import { useEffect, useState } from "react";
import { getRequests } from "@/lib/requests-store";
import { getUserDetails } from "@/lib/user-store";
import type { UserDetails } from "@/lib/user-store";
import type { ExchangeRequest, UserInfo } from "@/lib/types";
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
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ADMIN_TOKEN = "admin_super_secret_token";

export default function AdminPage() {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [requests, setRequests] = useState<ExchangeRequest[]>([]);
    const [todaysUsers, setTodaysUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userDetails = getUserDetails();
        setUser(userDetails);

        if (userDetails?.token !== ADMIN_TOKEN) {
            redirect('/');
        } else {
            const allRequests = getRequests();
            setRequests(allRequests);

            // --- Logic for Today's Users ---
            const uniqueUsers = new Map<string, UserInfo>();
            const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000);

            allRequests.forEach(request => {
                const requestCreatedAt = new Date(request.createdAt).getTime();
                if (requestCreatedAt >= twentyFourHoursAgo) {
                    if (!uniqueUsers.has(request.user.token)) {
                        uniqueUsers.set(request.user.token, request.user);
                    }
                }
                request.offers.forEach(offer => {
                     const offerCreatedAt = new Date(offer.createdAt).getTime();
                     if(offerCreatedAt >= twentyFourHoursAgo) {
                        if (!uniqueUsers.has(offer.user.token)) {
                            uniqueUsers.set(offer.user.token, offer.user);
                        }
                     }
                });
            });
            setTodaysUsers(Array.from(uniqueUsers.values()));
        }
        setLoading(false);
    }, []);

    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
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

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        Today's Users ({todaysUsers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Real Name</TableHead>
                                    <TableHead>Anonymous Name</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Contact</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {todaysUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No new users today.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {todaysUsers.map(u => (
                                    <TableRow key={u.token}>
                                        <TableCell className="font-medium">{u.realName}</TableCell>
                                        <TableCell>{u.name}</TableCell>
                                        <TableCell>{u.room}</TableCell>
                                        <TableCell>{u.contact || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </div>
                </CardContent>
             </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>All Active Requests ({requests.length})</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </div>
    );
}
