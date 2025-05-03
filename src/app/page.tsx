
'use client';

import * as React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PollDisplay } from '@/components/poll-display';
import { Leaderboard, LeaderboardSkeleton } from '@/components/leaderboard'; // Import Leaderboard and Skeleton
import { UserStats, UserStatsSkeleton } from '@/components/user-stats'; // Import UserStats and Skeleton
import { useToast } from '@/hooks/use-toast';
import type { Poll, PublicKeyString, LeaderboardEntry, VoteRecord } from '@/services/solana'; // Added VoteRecord
import { getAllPolls, getPollById, hasVoted, castVote, getVotersForPoll, getUserTotalVotes, subscribeToVotes, unsubscribeFromVotes } from '@/services/solana'; // Added subscribe/unsubscribe
import { SolanaIcon } from '@/components/icons/solana-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { List, BarChartHorizontal } from 'lucide-react'; // Added BarChartHorizontal
import { ConfettiEffect } from '@/components/confetti-effect'; // Import Confetti

// Default styles that can be overridden by your app
// require('@solana/wallet-adapter-react-ui/styles.css'); // Moved to layout.tsx

export default function Home() {
  // Solana Wallet Adapter Hook
  const { publicKey, connected, disconnecting, connecting, connect, disconnect, select } = useWallet();
  const walletAddress = publicKey?.toBase58() || null;

  // State Management
  const [allPolls, setAllPolls] = React.useState<Poll[]>([]);
  const [selectedPollId, setSelectedPollId] = React.useState<string | null>(null);
  const [currentPoll, setCurrentPoll] = React.useState<Poll | null>(null);
  const [isLoadingPolls, setIsLoadingPolls] = React.useState(true);
  const [pollsError, setPollsError] = React.useState<string | null>(null);

  const [userHasVotedInCurrent, setUserHasVotedInCurrent] = React.useState(false);
  const [isLoadingVoteStatus, setIsLoadingVoteStatus] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isVoting, setIsVoting] = React.useState(false);

  // Leaderboard State
  const [voters, setVoters] = React.useState<LeaderboardEntry[]>([]);
  const [isLoadingVoters, setIsLoadingVoters] = React.useState(true); // Start loading initially
  const [votersError, setVotersError] = React.useState<string | null>(null);

  // User Stats State
  const [userTotalVotes, setUserTotalVotes] = React.useState<number | null>(null);
  const [isLoadingUserStats, setIsLoadingUserStats] = React.useState(true); // Start loading initially
  const [userStatsError, setUserStatsError] = React.useState<string | null>(null);

  // Confetti State
  const [showConfetti, setShowConfetti] = React.useState(false);


  const { toast } = useToast();

  // --- Effects ---

  // Fetch All Polls on mount
  React.useEffect(() => {
    const fetchPolls = async () => {
      setIsLoadingPolls(true);
      setPollsError(null);
      try {
        const polls = await getAllPolls();
        setAllPolls(polls);
        // Automatically select the first active poll if available
        const firstActive = polls.find(p => Date.now() >= p.startTime && Date.now() <= p.endTime);
        if (firstActive) {
          setSelectedPollId(firstActive.id);
        } else if (polls.length > 0) {
          setSelectedPollId(polls[0].id); // Select the first one if no active polls
        }
      } catch (error) {
        console.error('Error fetching polls:', error);
        setPollsError('Failed to load polls. Please try again later.');
        toast({
          title: 'Error',
          description: 'Could not fetch polls list.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingPolls(false);
      }
    };
    fetchPolls();
  }, [toast]);

   // Fetch selected poll details AND initial voters when ID changes
   React.useEffect(() => {
     const fetchSelectedPollAndVoters = async () => {
       if (!selectedPollId) {
         setCurrentPoll(null);
         setVoters([]);
         setIsLoadingVoters(false); // Stop loading if no poll selected
         return;
       }
       // Set loading states for both poll and voters
       setIsLoadingPolls(true);
       setIsLoadingVoters(true);
       setPollsError(null);
       setVotersError(null);

       try {
         // Fetch poll details
         console.log(`Fetching details for poll: ${selectedPollId}`);
         const pollData = await getPollById(selectedPollId);
         setCurrentPoll(pollData);
         setSelectedOption(null); // Reset selection when changing poll

         // Fetch initial voters for the poll
         console.log(`Fetching initial voters for poll: ${selectedPollId}`);
         const voterData = await getVotersForPoll(selectedPollId);
         setVoters(voterData);

       } catch (error) {
         console.error(`Error fetching data for poll ${selectedPollId}:`, error);
         setPollsError(`Failed to load poll ${selectedPollId}.`);
         setVotersError(`Failed to load voters for poll ${selectedPollId}.`);
         toast({
           title: 'Error',
           description: `Could not fetch data for poll ${selectedPollId}.`,
           variant: 'destructive',
         });
         setCurrentPoll(null);
         setVoters([]);
       } finally {
         // Ensure both loading states are set to false
         setIsLoadingPolls(false);
         setIsLoadingVoters(false);
       }
     };
     fetchSelectedPollAndVoters();
   }, [selectedPollId, toast]);

    // Fetch User Stats when wallet connects or vote happens
    const fetchUserStats = React.useCallback(async () => {
        if (connected && walletAddress) {
            setIsLoadingUserStats(true);
            setUserStatsError(null);
            try {
                console.log(`Fetching user stats for: ${walletAddress}`);
                const totalVotes = await getUserTotalVotes(walletAddress);
                setUserTotalVotes(totalVotes);
            } catch (error) {
                console.error('Error fetching user stats:', error);
                setUserStatsError('Failed to load your voting stats.');
                toast({
                    title: 'Error',
                    description: 'Could not fetch your voting statistics.',
                    variant: 'destructive',
                });
                setUserTotalVotes(null);
            } finally {
                setIsLoadingUserStats(false);
            }
        } else {
            // Reset stats if disconnected
            setUserTotalVotes(null);
            setUserStatsError(null);
            setIsLoadingUserStats(false); // Stop loading if not connected
        }
    }, [connected, walletAddress, toast]);

    React.useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]); // Fetch initially and when dependencies change


  // Check vote status when wallet connects or poll changes
  React.useEffect(() => {
    const checkVote = async () => {
      if (connected && walletAddress && currentPoll) {
        setIsLoadingVoteStatus(true);
        try {
          console.log(`Checking vote status for ${walletAddress} in poll ${currentPoll.id}`);
          const voted = await hasVoted(walletAddress, currentPoll.id);
          setUserHasVotedInCurrent(voted);
          // Reset selection if user has voted
          if (voted) setSelectedOption(null);
        } catch (error) {
          console.error('Error checking vote status:', error);
          toast({
            title: 'Error',
            description: 'Could not verify your vote status for this poll.',
            variant: 'destructive',
          });
          setUserHasVotedInCurrent(false); // Assume not voted on error
        } finally {
          setIsLoadingVoteStatus(false);
        }
      } else {
        setUserHasVotedInCurrent(false); // Reset if disconnected or no poll
        setSelectedOption(null);
        setIsLoadingVoteStatus(false); // Stop loading if not connected or no poll
      }
    };
    checkVote();
  }, [connected, walletAddress, currentPoll, toast]);

   // --- Real-time Vote Subscription ---
   React.useEffect(() => {
     if (!selectedPollId) return;

     console.log(`Subscribing to votes for poll: ${selectedPollId}`);

     // Callback function to handle new votes
     const handleNewVote = (newVote: VoteRecord) => {
       console.log('Received new vote:', newVote);

       // Update Poll Display (increment vote count)
       setCurrentPoll((prevPoll) => {
         if (!prevPoll || prevPoll.id !== newVote.pollId) return prevPoll;
         const updatedOptions = prevPoll.options.map((option, index) =>
           index === newVote.optionIndex
             ? { ...option, votes: option.votes + 1 }
             : option
         );
         return { ...prevPoll, options: updatedOptions };
       });

       // Update Leaderboard (add new voter)
       setVoters((prevVoters) => {
         // Avoid adding duplicates if the subscription fires slightly delayed
         if (prevVoters.some(v => v.walletAddress === newVote.walletAddress && v.voteTimestamp === newVote.timestamp)) {
             return prevVoters;
         }
         const newEntry: LeaderboardEntry = {
             walletAddress: newVote.walletAddress,
             voteTimestamp: newVote.timestamp
         };
         // Add to the beginning and keep maybe last 50 or sort differently?
         // Simple approach: add to end, sort by timestamp descending (most recent first)
         const updatedVoters = [...prevVoters, newEntry].sort((a, b) => b.voteTimestamp - a.voteTimestamp);
         return updatedVoters;
       });

        // If the new vote is from the current user, update their total votes
       if (newVote.walletAddress === walletAddress) {
           setUserTotalVotes(prevTotal => (prevTotal === null ? 1 : prevTotal + 1));
           setUserHasVotedInCurrent(true); // Ensure vote status is updated
           setShowConfetti(true); // Trigger confetti for the user's own vote
       }
     };

     // Subscribe
     const unsubscribe = subscribeToVotes(selectedPollId, handleNewVote);

     // Cleanup function to unsubscribe when component unmounts or poll changes
     return () => {
       console.log(`Unsubscribing from votes for poll: ${selectedPollId}`);
       unsubscribe();
     };
   }, [selectedPollId, walletAddress]); // Re-subscribe if pollId or walletAddress changes


  // --- Handlers ---

  const handleVote = async (optionIndex: number) => {
    if (!connected || !walletAddress || !currentPoll || userHasVotedInCurrent || isVoting) {
      let description = "Please connect your wallet and select an active poll.";
      if (userHasVotedInCurrent) description = "You have already voted in this poll.";
       if (currentPoll && (Date.now() < currentPoll.startTime || Date.now() > currentPoll.endTime)) {
           description = "This poll is not currently active.";
       }
      toast({ title: "Cannot Vote", description: description, variant: "destructive"})
      return;
    }

    const now = Date.now();
    if(now < currentPoll.startTime || now > currentPoll.endTime) {
        toast({ title: "Poll Not Active", description: "This poll is not currently open for voting.", variant: "destructive"})
        return;
    }


    setIsVoting(true);
    setSelectedOption(optionIndex); // Visually select the option immediately

    console.log(`Attempting to cast vote for option ${optionIndex} by ${walletAddress} in poll ${currentPoll.id}`);

    try {
      // On-chain transaction (simulated)
      await castVote(walletAddress, currentPoll.id, optionIndex);

      // NOTE: UI updates are now handled optimistically AND by the real-time subscription.
      // We keep the optimistic update for immediate feedback, but the subscription ensures consistency.

       // Optimistic UI update for the user's own vote
      setUserHasVotedInCurrent(true); // Should be confirmed by subscription, but set immediately
      // Total votes will be updated by the subscription callback
      // Confetti will be triggered by the subscription callback


      toast({
        title: 'Vote Submitted!',
        description: `Your vote for "${currentPoll.options[optionIndex]?.text}" is being processed on Solana...`,
        variant: "default",
        className: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-600",
      });
       console.log('Vote submitted for processing.');

       // Trigger confetti immediately for better UX
       // setShowConfetti(true); // Moved to subscription handler

    } catch (error: any) {
      console.error('Error casting vote:', error);
       setSelectedOption(null); // Revert selection on error
       // Revert optimistic UI updates on error - maybe not needed if subscription corrects?
       // setUserHasVotedInCurrent(false); // Let subscription handle final state
       // Consider refetching user stats on error for definite consistency
       fetchUserStats();


      toast({
        title: 'Vote Failed',
        description: error.message || 'There was an error casting your vote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Important: Set isVoting to false AFTER the transaction attempt, regardless of success/failure
      // but let the subscription handle the final UI state changes.
      setIsVoting(false);
    }
  };

  const handlePollSelect = (pollId: string) => {
     setSelectedPollId(pollId);
     // Reset states related to the previous poll
     setCurrentPoll(null);
     setVoters([]);
     setUserHasVotedInCurrent(false);
     setSelectedOption(null);
     setIsLoadingPolls(true); // Indicate loading for the new poll
     setIsLoadingVoters(true);
     setIsLoadingVoteStatus(true);
   };

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-7xl mx-auto gap-10 px-4 py-10 min-h-screen">
       {showConfetti && <ConfettiEffect onComplete={() => setShowConfetti(false)} />}
       {/* Header Section */}
      <div className="text-center space-y-3 mb-8 w-full max-w-3xl mx-auto relative overflow-hidden py-4 rounded-lg ">
         {/* Animated Background Blobs */}
         <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob -z-10"></div>
         <div className="absolute top-0 right-1/4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 -z-10"></div>
         <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 -z-10"></div>

         <SolanaIcon className="w-24 h-24 mx-auto text-primary drop-shadow-lg animate-float" />
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary tracking-tight mb-2">
          SolanaVote
        </h1>
        <p className="text-xl text-muted-foreground">
          Decentralized polling on the Solana blockchain. Cast your vote securely!
        </p>
      </div>

       {/* Wallet Connect Button */}
       <div className="w-full flex justify-center mb-4">
          {/* Apply hover effect wrapper */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <WalletMultiButton className="!relative !bg-gradient-to-r !from-purple-600 !to-indigo-700 !text-primary-foreground !shadow-xl hover:!shadow-primary/40 transition-all text-lg px-8 py-3.5 font-semibold" />
          </div>
       </div>

        {/* Main Content Area - Grid Layout - Ensure alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-start"> {/* Ensure items start at the top */}

            {/* Left Column: Poll Selector & User Stats */}
            <div className="flex flex-col gap-8 lg:col-span-1">
                 {/* Poll Selector Card */}
                <Card className="w-full max-w-md floating-element bg-card/80 backdrop-blur-sm border-2 border-secondary/30 shadow-secondary/20 shadow-md hover:border-secondary/60 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                            <List className="text-secondary" />
                            Select a Poll
                        </CardTitle>
                        <CardDescription>Choose a poll to view details and vote.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingPolls && !allPolls.length ? (
                            <Skeleton className="h-10 w-full rounded-md bg-muted" />
                        ) : pollsError ? (
                            <Alert variant="destructive">
                                <AlertTitle>Error Loading Polls</AlertTitle>
                                <AlertDescription>{pollsError}</AlertDescription>
                            </Alert>
                        ) : allPolls.length === 0 ? (
                            <p className="text-muted-foreground text-center py-2">No polls found.</p>
                        ) : (
                            <Select onValueChange={handlePollSelect} value={selectedPollId || ''} disabled={isLoadingPolls}>
                                <SelectTrigger className="w-full text-base py-2.5 bg-input/50 hover:bg-input/80 transition-colors">
                                    <SelectValue placeholder={isLoadingPolls ? "Loading polls..." : "Select a poll..."} />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border backdrop-blur-md">
                                    {allPolls.map((poll) => (
                                    <SelectItem
                                        key={poll.id}
                                        value={poll.id}
                                        className="text-base cursor-pointer hover:bg-accent/80 focus:bg-accent/90"
                                    >
                                        <span className="truncate">{poll.title}</span>
                                        {Date.now() > poll.endTime ? <span className="ml-2 text-xs text-muted-foreground">(Closed)</span> : ''}
                                        {Date.now() < poll.startTime ? <span className="ml-2 text-xs text-amber-400">(Upcoming)</span> : ''}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </CardContent>
                </Card>


                {/* User Stats Card */}
                {isLoadingUserStats ? (
                   <UserStatsSkeleton />
                ) : (
                   <UserStats
                        walletAddress={walletAddress}
                        totalVotes={userTotalVotes}
                        isLoading={false} // Already handled loading state above
                        error={userStatsError}
                        isConnected={connected}
                    />
                )}
            </div>

            {/* Center Column: Poll Display */}
            <div className="lg:col-span-1 flex justify-center">
                 {selectedPollId && (
                     // Loading state handled within PollDisplay now
                     <PollDisplay
                        key={selectedPollId} // Force re-render when poll changes
                        poll={currentPoll}
                        isLoading={isLoadingPolls || isLoadingVoteStatus} // Combine relevant loading states
                        error={pollsError}
                        onVote={handleVote}
                        selectedOptionIndex={selectedOption}
                        hasVoted={userHasVotedInCurrent}
                        isVoting={isVoting}
                        isConnected={connected}
                     />
                 )}
                 {!selectedPollId && !isLoadingPolls && (
                     <Card className="w-full max-w-md h-full flex flex-col items-center justify-center text-center floating-element bg-card/80 backdrop-blur-sm border-2 border-primary/30 shadow-primary/20 shadow-xl p-8 min-h-[300px]">
                        <BarChartHorizontal className="w-16 h-16 mb-4 text-primary opacity-70" />
                        <CardTitle className="text-xl font-semibold">No Poll Selected</CardTitle>
                        <CardDescription>Please choose a poll from the list to start voting.</CardDescription>
                    </Card>
                 )}
                  {/* Skeleton for Poll Display while loading */}
                 {isLoadingPolls && !currentPoll && selectedPollId && (
                     <Card className="w-full max-w-md floating-element bg-card/80 backdrop-blur-sm border-2 border-primary/30 shadow-primary/20 shadow-xl">
                        <CardHeader className="text-center">
                          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3 bg-muted" />
                          <Skeleton className="h-8 w-3/4 mx-auto rounded-md bg-muted" />
                          <Skeleton className="h-4 w-1/2 mx-auto mt-2 rounded-md bg-muted" />
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                          <Skeleton className="h-20 w-full rounded-lg bg-muted" />
                          <Skeleton className="h-20 w-full rounded-lg bg-muted" />
                          <Skeleton className="h-20 w-full rounded-lg bg-muted" />
                        </CardContent>
                      </Card>
                 )}
            </div>

            {/* Right Column: Leaderboard */}
             <div className="lg:col-span-1 flex justify-center">
                 {isLoadingVoters ? (
                     <LeaderboardSkeleton />
                 ) : (
                     <Leaderboard
                        key={selectedPollId || 'no-poll'} // Re-render leaderboard on poll change
                        pollId={selectedPollId}
                        voters={voters}
                        isLoading={false} // Already handled loading state above
                        error={votersError}
                        currentWalletAddress={walletAddress} // Pass current user wallet
                     />
                 )}
             </div>

        </div>


        {/* Footer/Info */}
        <p className="text-xs text-muted-foreground mt-16 text-center max-w-2xl mx-auto">
           Powered by Solana. Each wallet can vote only once per poll. Results update in real-time after voting.
           Connect your wallet using the button above. <br />
           Leaderboard shows recent participants. Your stats reflect your total votes across all polls.
        </p>
         <style jsx global>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
              50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
            }
            .animate-bounce { animation: bounce 1.5s infinite; }

             @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
            .animate-float { animation: float 3s ease-in-out infinite; }


           /* Customizations for WalletMultiButton */
           .wallet-adapter-button {
              font-weight: 600 !important;
              border-radius: 0.75rem !important; /* Match theme radius */
              transition: all 0.3s ease !important;
           }
            .wallet-adapter-button:hover {
               opacity: 0.95 !important;
               transform: translateY(-2px); /* Slight lift on hover */
               box-shadow: 0 4px 15px rgba(var(--primary-hsl), 0.3); /* Softer shadow */
           }
           .wallet-adapter-button-trigger {
              padding: 0.85rem 2rem !important; /* Adjusted padding */
              font-size: 1.1rem !important; /* Slightly larger font */
              letter-spacing: 0.025em; /* Add subtle letter spacing */
           }

           /* Modal Styling */
           .wallet-adapter-modal-wrapper {
               background-color: rgba(10, 2, 20, 0.85) !important; /* Darker, slightly less transparent */
               backdrop-filter: blur(12px);
            }
            .wallet-adapter-modal {
                background: linear-gradient(145deg, hsl(var(--card) / 0.95), hsl(var(--background) / 0.95)) !important;
                border: 1px solid hsl(var(--border) / 0.5);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                border-radius: var(--radius) !important;
             }

             .wallet-adapter-modal-title {
               color: hsl(var(--foreground)) !important;
               font-size: 1.8rem !important;
               font-weight: 700 !important;
               margin-bottom: 1.5rem !important;
               text-align: center;
               background: -webkit-linear-gradient(45deg, hsl(var(--primary)), hsl(var(--accent)));
               -webkit-background-clip: text;
               -webkit-text-fill-color: transparent;
            }
            .wallet-adapter-modal-list {
              padding: 0.75rem !important;
              max-height: 65vh;
              overflow-y: auto;
              background: transparent !important; /* Let modal background show */
            }
             .wallet-adapter-modal-list li button,
             .wallet-adapter-modal-list .wallet-adapter-button {
                color: hsl(var(--card-foreground)) !important;
                transition: background-color 0.2s ease, transform 0.2s ease;
                border-radius: calc(var(--radius) - 4px) !important; /* Inner border radius */
                padding: 0.85rem 1.2rem !important;
                font-size: 1.05rem !important;
                background: hsl(var(--muted) / 0.3) !important;
                border: 1px solid hsl(var(--border) / 0.3) !important;
                margin-bottom: 0.5rem; /* Space between buttons */
                box-shadow: none !important;
                width: 100%;
                justify-content: flex-start;
                gap: 1rem !important;
            }
             .wallet-adapter-modal-list li button:hover,
              .wallet-adapter-modal-list .wallet-adapter-button:hover {
                background: hsl(var(--primary) / 0.2) !important;
                border-color: hsl(var(--primary) / 0.5) !important;
                transform: scale(1.02);
            }
             .wallet-adapter-modal-collapse-button svg {
               fill: hsl(var(--primary)) !important;
               transition: fill 0.2s ease;
             }
            .wallet-adapter-modal-collapse-button:hover svg {
                fill: hsl(var(--accent)) !important;
            }
            .wallet-adapter-modal-button-close {
                background: hsl(var(--muted) / 0.5) !important;
                border-radius: 50% !important;
                transition: background-color 0.2s ease, transform 0.2s ease;
                color: hsl(var(--muted-foreground)) !important;
            }
            .wallet-adapter-modal-button-close:hover {
                background: hsl(var(--destructive)) !important;
                 color: hsl(var(--destructive-foreground)) !important;
                 transform: rotate(90deg) scale(1.1);
            }

            /* Dropdown Styling */
            .wallet-adapter-dropdown-list {
                background: hsl(var(--popover)) !important;
                border-radius: var(--radius) !important;
                border: 1px solid hsl(var(--border));
                 padding: 0.5rem !important;
                 box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            .wallet-adapter-dropdown-list-item {
                color: hsl(var(--popover-foreground)) !important;
                padding: 0.6rem 1.1rem !important;
                border-radius: calc(var(--radius) - 4px) !important;
                font-size: 1rem !important;
                 transition: background-color 0.2s ease, color 0.2s ease;
            }
            .wallet-adapter-dropdown-list-item:hover {
                background: hsl(var(--accent)) !important;
                color: hsl(var(--accent-foreground)) !important;
            }

             /* Scrollbar Styling */
            .wallet-adapter-modal-list::-webkit-scrollbar { width: 8px; }
            .wallet-adapter-modal-list::-webkit-scrollbar-track { background: hsl(var(--muted) / 0.3); border-radius: 10px; }
            .wallet-adapter-modal-list::-webkit-scrollbar-thumb { background: hsl(var(--primary) / 0.6); border-radius: 10px; border: 2px solid transparent; background-clip: content-box;}
             .wallet-adapter-modal-list::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary)); }

            /* Animated Background Blobs */
            @keyframes blob {
              0% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
              100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob { animation: blob 8s infinite; }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }

             /* Animated Tilt for Button */
             @keyframes tilt {
               0%, 50%, 100% { transform: rotate(0deg); }
               25% { transform: rotate(0.5deg); }
               75% { transform: rotate(-0.5deg); }
            }
            .animate-tilt { animation: tilt 10s infinite linear; }

        `}</style>
    </div>
  );
}
