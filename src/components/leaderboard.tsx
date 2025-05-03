
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Award, Clock, AlertCircle, UserCheck } from 'lucide-react'; // Updated icons
import type { LeaderboardEntry, PublicKeyString } from '@/services/solana';
import { shortenAddress } from '@/lib/solana-utils';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils'; // Import cn for conditional classes

interface LeaderboardProps {
  pollId: string | null;
  voters: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  currentWalletAddress: PublicKeyString | null; // Add current user's wallet address
}

export function Leaderboard({ pollId, voters, isLoading, error, currentWalletAddress }: LeaderboardProps) {

   // Sort voters by timestamp descending (most recent first)
   const sortedVoters = React.useMemo(() => {
     return [...voters].sort((a, b) => b.voteTimestamp - a.voteTimestamp);
   }, [voters]);

  const renderContent = () => {
    // isLoading is handled by the parent via LeaderboardSkeleton
    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Voters</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!pollId && !isLoading) { // Added !isLoading check
        return <p className="text-center text-muted-foreground py-6 text-sm">Select a poll to view the live leaderboard.</p>;
    }

    if (voters.length === 0 && !isLoading) { // Added !isLoading check
      return <p className="text-center text-muted-foreground py-6 text-sm">No votes cast yet. Be the first!</p>;
    }

    // Only render list if not loading and there are voters
    if (voters.length > 0 && !isLoading) {
        return (
          <ScrollArea className="h-[300px] pr-3 -mr-3"> {/* Adjust height and padding */}
            <ul className="space-y-2.5">
              {sortedVoters.map((voter, index) => {
                const isCurrentUser = voter.walletAddress === currentWalletAddress;
                const rank = index + 1;
                let rankColor = 'text-muted-foreground';
                if (rank === 1) rankColor = 'text-yellow-400';
                else if (rank === 2) rankColor = 'text-slate-400';
                else if (rank === 3) rankColor = 'text-orange-400';

                return (
                    <li
                        key={`${voter.walletAddress}-${voter.voteTimestamp}`} // Use timestamp for unique key
                        className={cn(
                            "flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md",
                            isCurrentUser
                            ? "bg-gradient-to-r from-primary/20 to-accent/20 border-l-4 border-accent scale-[1.01]" // Highlight current user
                            : "bg-card/70 hover:bg-muted/50",
                            "border border-border/20"
                        )}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <span className={cn("font-bold text-sm w-6 text-right shrink-0", rankColor)}>
                                {rank <= 3 ? <Award size={16} className="inline-block mr-1 -mt-0.5" /> : `#${rank}`}
                            </span>
                            <span className="font-semibold text-primary truncate flex-grow text-sm" title={voter.walletAddress}>
                                {shortenAddress(voter.walletAddress, isCurrentUser ? 8 : 5)} {/* Show more chars for current user */}
                                {isCurrentUser && <UserCheck size={14} className="inline-block ml-1.5 text-accent" />}
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 whitespace-nowrap">
                            <Clock size={12} />
                            {formatDistanceToNow(new Date(voter.voteTimestamp), { addSuffix: true })}
                        </span>
                    </li>
                );
              })}
            </ul>
          </ScrollArea>
        );
    }

    // Fallback for loading state (should be covered by skeleton, but good practice)
    return null;
  };

  return (
    <Card className="w-full max-w-md floating-element bg-card/80 backdrop-blur-sm border-2 border-accent/30 shadow-accent/20 shadow-lg hover:border-accent/60 transition-colors">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
          <Award className="text-accent" /> {/* Changed icon */}
          Live Leaderboard
        </CardTitle>
        <CardDescription className="text-center text-sm">Most recent voters in the selected poll.</CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

// Skeleton Loader Component for Leaderboard
export function LeaderboardSkeleton() {
  return (
    <Card className="w-full max-w-md floating-element bg-card/80 backdrop-blur-sm border-2 border-accent/30 shadow-accent/20 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
          <Award className="text-accent" />
          Live Leaderboard
        </CardTitle>
        <CardDescription className="text-center text-sm">Loading recent voters...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 h-[300px] pr-3 -mr-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50 animate-pulse">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-6 rounded-md" />
                <Skeleton className="h-5 w-28 rounded-md" />
              </div>
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
