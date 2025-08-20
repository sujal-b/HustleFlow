
"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description: string;
    className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
    return (
        <div className={cn("mb-12 text-center", className)}>
            <h1 
                className="animate-fade-in-up font-headline text-4xl font-bold tracking-tight opacity-0 [--animation-delay:200ms] md:text-5xl"
            >
                {title}
            </h1>
            <p 
                className="text-md animate-fade-in-up text-muted-foreground opacity-0 [--animation-delay:400ms] md:text-lg"
            >
                {description}
            </p>
        </div>
    );
}
