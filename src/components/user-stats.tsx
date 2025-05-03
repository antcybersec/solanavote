
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, BarChartHorizontal, AlertCircle, Medal, Star, ShieldCheck, Coffee } from 'lucide-react'; // Added more icons
import { shortenAddress } from '@/lib/solana-utils';
import type { PublicKeyString } from '@/services/solana';
import { cn } from '@/lib/utils';

interface UserStatsProps {
  walletAddress: PublicKeyString | null;
  totalVotes: number | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

export function UserStats({ walletAddress, totalVotes, isLoading, error, isConnected }: UserStatsProps) {

  const renderContent = () => {
    // isLoading is handled by the parent via UserStatsSkeleton
    if (!isConnected && !isLoading) { // Added !isLoading check
        return (
          <div className="text-center py-4">
            <User size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-sm">Connect wallet to view stats.</p>
          </div>
        );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-2">
           <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Stats</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    // Only render stats if connected, not loading, and no error
    if (isConnected && !isLoading && !error) {
        const getVotingTier = (votes: number | null) => {
            const v = votes ?? 0;
            if (v === 0) return { name: "Newcomer", icon: <Coffee size={18} className="text-gray-400" />, color: "text-gray-400", description: "Cast your first vote!" };
            if (v >= 1 && v <= 3) return { name: "Active Voter", icon: <BarChartHorizontal size={18} className="text-teal-400" />, color: "text-teal-400", description: "Getting started!" };
            if (v >= 4 && v <= 7) return { name: "Engaged Participant", icon: <Star size={18} className="text-yellow-400" />, color: "text-yellow-400", description: "Making your voice heard!" };
            if (v >= 8 && v <= 15) return { name: "Seasoned Contributor", icon: <ShieldCheck size={18} className="text-primary" />, color: "text-primary", description: "A regular voter!" };
            return { name: "Voting Veteran", icon: <Medal size={18} className="text-accent animate-pulse" />, color: "text-accent", description: "Leading the way!" }; // Add pulse for top tier
        };

        const tier = getVotingTier(totalVotes);

        return (
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold text-foreground truncate" title={walletAddress ?? ''}>
               {shortenAddress(walletAddress ?? '', 8)} {/* Show more chars */}
            </p>
            <div className="flex items-center justify-center gap-2">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-accent">
                  {totalVotes ?? 0}
                </p>
                <span className="text-base font-medium text-muted-foreground -mb-1">Total Votes</span>
            </div>
             <div className={cn("flex items-center justify-center gap-1.5 text-sm font-medium p-2 rounded-md bg-muted/30 border border-border/30", tier.color)}>
                {tier.icon}
                <span>{tier.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">{tier.description}</p>
          </div>
        );
    }

    // Fallback for loading state (should be covered by skeleton, but good practice)
    return null;
  };

  return (
    <Card className="w-full max-w-md floating-element bg-card/80 backdrop-blur-sm border-2 border-primary/30 shadow-primary/20 shadow-lg hover:border-primary/60 transition-colors">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
          <User className="text-primary" />
          Your Voting Stats
        </CardTitle>
         {/* Optional: <CardDescription className="text-center text-sm">Your participation summary.</CardDescription> */}
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

// Skeleton Loader Component for UserStats
export function UserStatsSkeleton() {
  return (
    <Card className="w-full max-w-md floating-element bg-card/80 backdrop-blur-sm border-2 border-primary/30 shadow-primary/20 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
          <User className="text-primary" />
          Your Voting Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-center animate-pulse">
          <Skeleton className="h-6 w-3/4 mx-auto rounded-md bg-muted" />
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-8 w-12 rounded-md bg-muted" />
            <Skeleton className="h-4 w-20 rounded-md bg-muted" />
          </div>
          <Skeleton className="h-8 w-1/2 mx-auto rounded-md bg-muted" />
          <Skeleton className="h-3 w-1/3 mx-auto rounded-md bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
