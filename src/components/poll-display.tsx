'use client';

import * as React from 'react';
import type { Poll, PollOption as PollOptionType } from '@/services/solana';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PollOption } from './poll-option';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SolanaIcon } from './icons/solana-icon';

interface PollDisplayProps {
  poll: Poll | null;
  isLoading: boolean;
  error: string | null;
  onVote: (optionIndex: number) => Promise<void>; // Make async
  selectedOptionIndex: number | null;
  hasVoted: boolean;
  isVoting: boolean; // Add loading state for voting
  isConnected: boolean; // Add connection status
}

export function PollDisplay({
  poll,
  isLoading,
  error,
  onVote,
  selectedOptionIndex,
  hasVoted,
  isVoting, // Use loading state
  isConnected,
}: PollDisplayProps) {
  const totalVotes = React.useMemo(() => {
    if (!poll) return 0;
    return poll.options.reduce((sum, option) => sum + option.votes, 0);
  }, [poll]);

  const handleVote = async (index: number) => {
     if (!isVoting && !hasVoted && isConnected) {
      await onVote(index);
    }
  };

  if (isLoading) {
    return (
       <Card className="w-full max-w-md floating-element bg-card/80 backdrop-blur-sm border-2 border-primary/30 shadow-primary/20 shadow-xl">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 rounded-md bg-muted" />
          <Skeleton className="h-4 w-1/2 rounded-md bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg bg-muted" />
          <Skeleton className="h-16 w-full rounded-lg bg-muted" />
          <Skeleton className="h-16 w-full rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="w-full max-w-md floating-element">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error Loading Poll</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!poll) {
    return (
       <Card className="w-full max-w-md floating-element bg-card/80 backdrop-blur-sm border-2 border-secondary/30 shadow-secondary/20 shadow-xl">
         <CardHeader className="items-center text-center">
            <SolanaIcon className="w-12 h-12 mb-2 text-secondary" />
           <CardTitle>No Active Poll</CardTitle>
           <CardDescription>Check back later for the next poll!</CardDescription>
         </CardHeader>
       </Card>
    );
  }

  const now = Date.now();
  const isPollActive = now >= poll.startTime && now <= poll.endTime;
  const canVote = isConnected && !hasVoted && isPollActive && !isVoting;

  return (
    <Card className="w-full max-w-md floating-element bg-card/80 backdrop-blur-sm border-2 border-primary/30 shadow-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="text-center bg-gradient-to-b from-primary/20 to-transparent pb-4">
         <SolanaIcon className="w-16 h-16 mx-auto mb-3 text-primary animate-pulse" />
        <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
          {poll.title}
        </CardTitle>
        {!isPollActive && (
           <CardDescription className="text-amber-400 font-semibold">
             This poll is {now < poll.startTime ? 'not yet active' : 'closed'}.
           </CardDescription>
         )}
        {hasVoted && (
           <CardDescription className="text-teal-400 font-semibold">
             You have already voted! View results below.
           </CardDescription>
        )}
        {!isConnected && (
          <CardDescription className="text-pink-400 font-semibold">
            Connect your wallet to vote.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3 p-4 md:p-6">
        {poll.options.map((option, index) => (
          <PollOption
            key={index}
            text={option.text}
            votes={option.votes}
            totalVotes={totalVotes}
            isSelected={selectedOptionIndex === index || (hasVoted && option.votes > 0 && selectedOptionIndex === index)} // Keep selection highlighted
            hasVoted={hasVoted}
            disabled={!canVote || isVoting} // Disable while voting
            onVote={() => handleVote(index)}
          />
        ))}
         {isVoting && (
           <div className="flex items-center justify-center text-sm text-muted-foreground pt-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Casting your vote on Solana...
           </div>
         )}
      </CardContent>
    </Card>
  );
}
