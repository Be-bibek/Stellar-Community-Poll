export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface VoterInfo {
  publicKey: string;
  balance: number;
  votedOptionId: string;
  timestamp: string;
  txHash: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  creator: string;
  category: 'Governance' | 'Tech Stack' | 'Protocol' | 'Community';
  status: 'active' | 'closed';
  endsAt: string;
  tags: string[];
  options: PollOption[];
  totalVotes: number;
  totalXlmWeight: number;
  voters: Record<string, VoterInfo>; // Map of publicKey -> VoterInfo
}

export interface StellarTransaction {
  hash: string;
  sequenceNumber: number;
  memo: string;
  fee: number;
  sourceAccount: string;
  ledger: number;
  timestamp: string;
  xdr: string;
  status: 'success' | 'failed';
}
