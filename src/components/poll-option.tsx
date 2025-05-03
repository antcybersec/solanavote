'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface PollOptionProps {
  text: string;
  votes: number;
  totalVotes: number;
  isSelected: boolean;
  hasVoted: boolean;
  disabled: boolean;
  onVote: () => void;
}

export function PollOption({
  text,
  votes,
  totalVotes,
  isSelected,
  hasVoted,
  disabled,
  onVote,
}: PollOptionProps) {
  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

  return (
    <Button
      variant="outline"
      className={cn(
        'relative flex h-auto w-full flex-col items-start justify-between gap-2 overflow-hidden rounded-lg border-2 p-4 text-left transition-all duration-300 ease-out floating-element',
        isSelected && hasVoted ? 'border-accent ring-2 ring-accent/80 bg-accent/10' : 'border-border hover:border-primary/50',
        disabled && !isSelected ? 'opacity-60 cursor-not-allowed' : '',
        hasVoted ? 'cursor-default' : 'hover:scale-[1.02] hover:shadow-lg',
         'bg-card/80 backdrop-blur-sm' // Frosted glass effect
      )}
      onClick={onVote}
      disabled={disabled || hasVoted} // Disable after voting or if globally disabled
      aria-label={`Vote for ${text}${isSelected && hasVoted ? ' (Your Vote)' : ''}`}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-lg font-semibold text-foreground">{text}</span>
        {isSelected && hasVoted && (
          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
        )}
      </div>

      {hasVoted && ( // Only show results after the user has voted
        <div className="mt-2 w-full space-y-1">
           <Progress value={percentage} className="h-3 w-full bg-muted [&>*]:bg-gradient-to-r [&>*]:from-secondary [&>*]:to-primary" />
           <div className="flex justify-between text-xs text-muted-foreground">
             <span>{votes} Votes</span>
             <span>{percentage.toFixed(1)}%</span>
           </div>
        </div>
      )}
       {/* Animated selection border */}
       {isSelected && hasVoted && (
         <div className="absolute inset-0 rounded-lg border-2 border-accent opacity-0 animate-pulse-border"></div>
       )}
       <style jsx>{`
         @keyframes pulse-border {
           0%, 100% { opacity: 0; transform: scale(1); }
           50% { opacity: 0.5; transform: scale(1.03); }
         }
         .animate-pulse-border {
           animation: pulse-border 2s infinite ease-in-out;
         }
       `}</style>
    </Button>
  );
}
