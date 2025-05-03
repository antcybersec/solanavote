
import type { PublicKey as SolanaPublicKey } from '@solana/web3.js';
import { EventEmitter } from 'events'; // Import EventEmitter

/**
 * Represents a Solana public key as a string.
 * We use a string type alias for simplicity in component props,
 * but actual interaction might use PublicKey from @solana/web3.js.
 */
export type PublicKeyString = string;

/**
 * Represents a poll option.
 */
export interface PollOption {
  /**
   * The text description of the poll option.
   */
  text: string;

  /**
   * The number of votes for this option.
   */
  votes: number;
}

/**
 * Represents a poll.
 */
export interface Poll {
  /**
   * The unique ID of the poll (e.g., Solana address of poll account)
   */
  id: string;
  /**
   * The title of the poll.
   */
  title: string;

  /**
   * The options for the poll.
   */
  options: PollOption[];

  /**
   * The start timestamp (milliseconds since epoch).
   */
  startTime: number;

  /**
   * The end timestamp (milliseconds since epoch).
   */
  endTime: number;
}

/**
 * Represents a recorded vote.
 */
export interface VoteRecord {
  pollId: string;
  walletAddress: PublicKeyString;
  optionIndex: number;
  timestamp: number; // Added timestamp for potential sorting
}

/**
 * Represents a voter entry for the leaderboard.
 */
export interface LeaderboardEntry {
    walletAddress: PublicKeyString;
    voteTimestamp: number;
}


// --- Mock Data Store ---
// In a real app, this would interact with the blockchain or a backend DB.

let mockPolls: Poll[] = [
    {
        id: 'poll123-framework',
        title: 'Favorite Solana Framework?',
        options: [
          { text: 'Anchor', votes: 105 },
          { text: 'Metaplex', votes: 53 },
          { text: 'Solana Native (Rust)', votes: 78 },
          { text: 'Seahorse (Python)', votes: 15 },
        ],
        startTime: Date.now() - 3600000 * 24 * 3, // Started 3 days ago
        endTime: Date.now() + 3600000 * 24 * 7, // Ends in 7 days
    },
    {
        id: 'poll456-feature',
        title: 'Next Solana Feature Priority?',
        options: [
            { text: 'Local Fee Markets', votes: 210 },
            { text: 'More Compute Units', votes: 180 },
            { text: 'State Compression Enhancements', votes: 150 },
            { text: 'Better Cross-Chain Bridges', votes: 95 },
        ],
        startTime: Date.now() - 3600000 * 6, // Started 6 hours ago
        endTime: Date.now() + 3600000 * 24 * 3, // Ends in 3 days
    },
     {
        id: 'poll789-closed',
        title: 'Best Solana Wallet (Closed Poll)?',
        options: [
            { text: 'Phantom', votes: 500 },
            { text: 'Solflare', votes: 350 },
            { text: 'Backpack', votes: 200 },
        ],
        startTime: Date.now() - 3600000 * 24 * 10, // Started 10 days ago
        endTime: Date.now() - 3600000 * 24 * 1, // Ended yesterday
    },
    {
        id: 'poll-chain-choice',
        title: 'Primary Use Case for Solana?',
        options: [
          { text: 'DeFi', votes: 450 },
          { text: 'NFTs / Gaming', votes: 380 },
          { text: 'Payments / DePIN', votes: 220 },
          { text: 'Infrastructure', votes: 90 },
        ],
        startTime: Date.now() - 3600000 * 24 * 1, // Started 1 day ago
        endTime: Date.now() + 3600000 * 24 * 5, // Ends in 5 days
    },
     {
        id: 'poll-future-outlook',
        title: 'Solana Price Prediction End of Year?',
        options: [
          { text: '$100 - $150', votes: 150 },
          { text: '$151 - $250', votes: 400 },
          { text: '$251 - $500', votes: 350 },
          { text: '$500+', votes: 100 },
        ],
        startTime: Date.now() - 3600000 * 2, // Started 2 hours ago
        endTime: Date.now() + 3600000 * 24 * 14, // Ends in 14 days
      }
];

const mockVotes: VoteRecord[] = []; // Use VoteRecord interface

// --- Mock Real-time Subscription ---
// Using Node.js EventEmitter for simple simulation
const voteEmitter = new EventEmitter();
const VOTE_EVENT_PREFIX = 'newVote_'; // Prefix to avoid event name collisions

// Function to emit a new vote event for a specific poll
function emitNewVote(voteRecord: VoteRecord) {
  voteEmitter.emit(`${VOTE_EVENT_PREFIX}${voteRecord.pollId}`, voteRecord);
}

/**
 * Subscribes to new votes for a specific poll.
 * In a real app, this would use WebSockets, Solana RPC subscriptions, etc.
 * @param pollId The ID of the poll to subscribe to.
 * @param callback The function to call when a new vote occurs.
 * @returns A function to unsubscribe.
 */
export function subscribeToVotes(pollId: string, callback: (vote: VoteRecord) => void): () => void {
    const eventName = `${VOTE_EVENT_PREFIX}${pollId}`;
    console.log(`[Subscription Mock] Subscribing to ${eventName}`);
    voteEmitter.on(eventName, callback);

    // Return an unsubscribe function
    return () => {
        console.log(`[Subscription Mock] Unsubscribing from ${eventName}`);
        voteEmitter.off(eventName, callback);
    };
}

/**
 * Unsubscribes a specific callback from new votes for a poll.
 * Note: This is less commonly needed if the unsubscribe function returned by subscribeToVotes is used.
 * @param pollId The ID of the poll.
 * @param callback The callback function to remove.
 */
export function unsubscribeFromVotes(pollId: string, callback: (vote: VoteRecord) => void): void {
    const eventName = `${VOTE_EVENT_PREFIX}${pollId}`;
    console.log(`[Subscription Mock] Explicitly unsubscribing callback from ${eventName}`);
    voteEmitter.off(eventName, callback);
}

// --- End Mock Real-time Subscription ---


// --- API Functions ---

/**
 * Retrieves all polls (active and inactive).
 * @returns A promise that resolves to an array of all polls.
 */
export async function getAllPolls(): Promise<Poll[]> {
  console.log("Fetching all polls (mock)...");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  // Return a deep copy to prevent accidental modification of the mock source
  return JSON.parse(JSON.stringify(mockPolls));
}


/**
 * Retrieves a specific poll by its ID.
 * @param pollId The ID of the poll to retrieve.
 * @returns A promise that resolves to the poll, or null if not found.
 */
export async function getPollById(pollId: string): Promise<Poll | null> {
  console.log(`Fetching poll with ID: ${pollId} (mock)...`);
  await new Promise(resolve => setTimeout(resolve, 150));
  const poll = mockPolls.find(p => p.id === pollId);
  return poll ? JSON.parse(JSON.stringify(poll)) : null;
}

/**
 * Checks if a wallet has already voted in a specific poll.
 * @param walletAddress The public key string of the wallet to check.
 * @param pollId The ID of the poll to check against.
 * @returns A promise that resolves to true if the wallet has voted in the specified poll, false otherwise.
 */
export async function hasVoted(walletAddress: PublicKeyString, pollId: string): Promise<boolean> {
   console.log(`Checking if ${walletAddress} has voted in poll ${pollId} (mock)...`);
   // Simulate network delay
   await new Promise(resolve => setTimeout(resolve, 200));
   const hasVoted = mockVotes.some(vote => vote.pollId === pollId && vote.walletAddress === walletAddress);
   console.log(`Vote status for ${walletAddress} in poll ${pollId}: ${hasVoted}`);
  return hasVoted;
}

/**
 * Casts a vote for a given option in a specific poll.
 * @param walletAddress The public key string of the wallet casting the vote.
 * @param pollId The ID of the poll to vote in.
 * @param optionIndex The index of the option to vote for.
 * @returns A promise that resolves when the vote has been successfully cast.
 * @throws Error if the wallet has already voted or the option index is invalid.
 */
export async function castVote(walletAddress: PublicKeyString, pollId: string, optionIndex: number): Promise<void> {
   console.log(`Attempting to cast vote for option ${optionIndex} by ${walletAddress} in poll ${pollId} (mock)...`);

   const pollIndex = mockPolls.findIndex(p => p.id === pollId);
   if (pollIndex === -1) {
     console.error(`Vote rejected: Poll with ID ${pollId} not found.`);
     throw new Error("Poll not found.");
   }
   const targetPoll = mockPolls[pollIndex];

   // Simulate network delay / transaction time
   await new Promise(resolve => setTimeout(resolve, 800));

  // Check if already voted (important check before proceeding)
  if (mockVotes.some(vote => vote.pollId === pollId && vote.walletAddress === walletAddress)) {
    console.warn(`Vote rejected: ${walletAddress} has already voted in poll ${pollId}.`);
    throw new Error("Wallet has already voted in this poll.");
  }

  // Check if poll is active
  const voteTimestamp = Date.now(); // Capture timestamp before checking
  if (voteTimestamp < targetPoll.startTime || voteTimestamp > targetPoll.endTime) {
      console.warn(`Vote rejected: Poll ${pollId} is not active.`);
      throw new Error("This poll is currently not active.");
  }

  // Check if option index is valid
  if (optionIndex < 0 || optionIndex >= targetPoll.options.length) {
     console.error(`Vote rejected: Invalid option index ${optionIndex} for poll ${pollId}.`);
     throw new Error("Invalid poll option selected.");
  }

   // **Critical Modification Order:**
   // 1. Create the vote record.
   const newVoteRecord: VoteRecord = { pollId, walletAddress, optionIndex, timestamp: voteTimestamp };

   // 2. Add the vote record to the mock storage.
   mockVotes.push(newVoteRecord);

   // 3. *Then* update the poll vote count (modifying the original mock object).
   targetPoll.options[optionIndex].votes += 1;

   // 4. *After* storing and updating, emit the event for real-time updates.
   emitNewVote(newVoteRecord); // Emit the event *after* state is updated

  console.log(`Vote successful: Wallet ${walletAddress} voted for option ${optionIndex} in poll ${pollId}. New count: ${targetPoll.options[optionIndex].votes}`);
  console.log(`Total votes recorded for poll ${pollId}: ${mockVotes.filter(v => v.pollId === pollId).length}`);
}


/**
 * Retrieves the list of voters for a specific poll, ordered by vote time (most recent first).
 * @param pollId The ID of the poll.
 * @returns A promise that resolves to an array of LeaderboardEntry objects.
 */
export async function getVotersForPoll(pollId: string): Promise<LeaderboardEntry[]> {
  console.log(`Fetching voters for poll ${pollId} (mock)...`);
  await new Promise(resolve => setTimeout(resolve, 250)); // Simulate delay

  const voters = mockVotes
    .filter(vote => vote.pollId === pollId)
    // Sort by most recent vote first for leaderboard display
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(vote => ({
        walletAddress: vote.walletAddress,
        voteTimestamp: vote.timestamp
    }));

  console.log(`Found ${voters.length} voters for poll ${pollId}.`);
  return voters;
}


/**
 * Retrieves the total number of votes cast by a specific wallet across all polls.
 * @param walletAddress The public key string of the wallet.
 * @returns A promise that resolves to the total vote count for the wallet.
 */
export async function getUserTotalVotes(walletAddress: PublicKeyString): Promise<number> {
    console.log(`Fetching total votes for ${walletAddress} (mock)...`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay

    const totalVotes = mockVotes.filter(vote => vote.walletAddress === walletAddress).length;
    console.log(`Wallet ${walletAddress} has cast ${totalVotes} total votes.`);
    return totalVotes;
}
