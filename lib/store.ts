import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  description: string;
  creator: string;
  createdAt: string;
  endsAt: string;
  options: PollOption[];
  totalVotes: number;
  tags: string[];
  category: string;
  status: 'active' | 'closed';
  voters: Record<string, string>; // publicKey -> optionId
}

interface PollState {
  publicKey: string | null;
  setPublicKey: (key: string | null) => void;
  polls: Poll[];
  addPoll: (poll: Omit<Poll, 'id' | 'createdAt' | 'voters' | 'totalVotes'>) => void;
  votePoll: (pollId: string, optionId: string, voterKey: string) => void;
  resetVotes: () => void;
}

// Pre-populated community polls centered around Stellar and Soroban
const INITIAL_POLLS: Poll[] = [
  {
    id: 'stellar-scf-allocation',
    question: 'Should the Stellar Community Fund (SCF) allocate 15% of annual funding directly to Soroban DeFi protocols?',
    description: 'This proposal aims to supercharge decentralized finance on Stellar by establishing a dedicated pool of SCF funds specifically earmarked for Soroban DeFi dApps, automated market makers (AMMs), and lending protocols.',
    creator: 'GBX5...K2PL',
    createdAt: '2026-07-15T12:00:00Z',
    endsAt: '2026-07-25T12:00:00Z',
    options: [
      { id: 'opt-yes', text: 'Yes, absolutely - DeFi is our highest ecosystem priority', votes: 842 },
      { id: 'opt-no', text: 'No, keep current diversified allocation across all verticals', votes: 412 },
      { id: 'opt-neutral', text: 'Neutral / Abstain and observe', votes: 166 }
    ],
    totalVotes: 1420,
    tags: ['SCF', 'Soroban', 'DeFi'],
    category: 'Governance',
    status: 'active',
    voters: {}
  },
  {
    id: 'soroban-lang-preference',
    question: 'Which programming language do you prefer for writing smart contracts on Soroban?',
    description: 'With Soroban fully live, we are compiling community developer preferences to guide educational grants, tooling, and tutorial development. Your feedback directly shapes our developer ecosystem strategy.',
    creator: 'GA7R...F5N6',
    createdAt: '2026-07-10T10:00:00Z',
    endsAt: '2026-07-30T10:00:00Z',
    options: [
      { id: 'opt-rust', text: 'Rust (Native & Recommended)', votes: 610 },
      { id: 'opt-as', text: 'AssemblyScript (Via SDK)', votes: 145 },
      { id: 'opt-zig', text: 'Zig (Experimental / Other)', votes: 85 }
    ],
    totalVotes: 840,
    tags: ['Soroban', 'Smart Contracts', 'Dev Tooling'],
    category: 'Tech Stack',
    status: 'active',
    voters: {}
  },
  {
    id: 'stellar-ledger-limit',
    question: 'Proposal to increase the Soroban smart contract ledger entry size limit from 64KB to 128KB.',
    description: 'Protocol upgrade proposal to expand contract ledger limits. This will support larger state storage for complex smart contracts but may marginally increase validator storage requirements.',
    creator: 'GDKS...6B9Y',
    createdAt: '2026-07-01T08:00:00Z',
    endsAt: '2026-07-16T08:00:00Z',
    options: [
      { id: 'opt-support', text: 'Support - Highly needed for enterprise-grade dApps', votes: 1890 },
      { id: 'opt-oppose', text: 'Oppose - Might degrade validator performance', votes: 450 },
      { id: 'opt-abstain', text: 'Abstain', votes: 190 }
    ],
    totalVotes: 2530,
    tags: ['Protocol Upgrade', 'Soroban', 'Limits'],
    category: 'Protocol',
    status: 'closed',
    voters: {}
  }
];

export const usePollStore = create<PollState>()(
  persist(
    (set) => ({
      publicKey: null,
      setPublicKey: (key) => set({ publicKey: key }),
      polls: INITIAL_POLLS,
      addPoll: (pollData) => set((state) => {
        const newPoll: Poll = {
          ...pollData,
          id: `poll-${Date.now()}`,
          createdAt: new Date().toISOString(),
          voters: {},
          totalVotes: 0,
          options: pollData.options.map(o => ({ ...o, votes: 0 }))
        };
        return { polls: [newPoll, ...state.polls] };
      }),
      votePoll: (pollId, optionId, voterKey) => set((state) => {
        const updatedPolls = state.polls.map((poll) => {
          if (poll.id !== pollId) return poll;

          // Check if voter has already voted
          const previousVote = poll.voters[voterKey];
          if (previousVote === optionId) return poll; // double click same option

          let updatedOptions = poll.options.map((opt) => {
            let votes = opt.votes;
            if (opt.id === optionId) {
              votes += 1;
            }
            if (previousVote && opt.id === previousVote) {
              votes = Math.max(0, votes - 1);
            }
            return { ...opt, votes };
          });

          const newVoters = { ...poll.voters, [voterKey]: optionId };
          const newTotalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);

          return {
            ...poll,
            options: updatedOptions,
            totalVotes: newTotalVotes,
            voters: newVoters,
          };
        });

        return { polls: updatedPolls };
      }),
      resetVotes: () => set({ polls: INITIAL_POLLS })
    }),
    {
      name: 'stellar-community-polls',
      partialize: (state) => ({
        publicKey: state.publicKey,
        polls: state.polls,
      }),
    }
  )
);
