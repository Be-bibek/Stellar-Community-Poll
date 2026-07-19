import { Poll, StellarTransaction, VoterInfo } from './types';
import { generateStellarAddress, simulateStellarTx } from './lib/stellar';

const LOCAL_STORAGE_KEY = 'stellar_community_polls_v2';
const WALLET_KEY = 'stellar_wallet_pubkey';
const BALANCE_KEY = 'stellar_wallet_balance';
const SEQ_KEY = 'stellar_wallet_sequence';
const TXS_KEY = 'stellar_wallet_transactions';

const DEFAULT_POLLS: Poll[] = [
  {
    id: 'GP-2026-01',
    title: 'GP-2026-01: Upgrade Soroban Smart Contract Engine to v21.2.0',
    description: 'This proposal upgrades the Soroban virtual machine on the Stellar Mainnet to version 21.2.0. This release includes significant performance optimizations for state access, lower gas fees for complex cryptographic verification, and security patches for cross-contract calls. Upgrading ensures contract execution continues safely and efficiently.',
    creator: 'GBA2K7YPQN6MZ4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWR',
    category: 'Tech Stack',
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
    tags: ['Soroban', 'Upgrade', 'Protocol-v21'],
    options: [
      { id: '1', text: 'Approve Upgrade', votes: 45 },
      { id: '2', text: 'Reject Upgrade', votes: 3 },
      { id: '3', text: 'Abstain / Wait for Testnet Audit', votes: 8 },
    ],
    totalVotes: 56,
    totalXlmWeight: 452800,
    voters: {
      'GBX7A2K7YPQN6MZ4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWR': {
        publicKey: 'GBX7A2K7YPQN6MZ4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWR',
        balance: 250000,
        votedOptionId: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        txHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      },
      'GBC4H2K7YPQN6MZ4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWR': {
        publicKey: 'GBC4H2K7YPQN6MZ4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWR',
        balance: 150000,
        votedOptionId: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        txHash: 'a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      }
    },
  },
  {
    id: 'GP-2026-02',
    title: 'GP-2026-02: Allocate 150,000 XLM from Community Pool for Hackathon Rewards',
    description: 'We propose allocating 150,000 XLM from the Community Treasury to sponsor the upcoming Stellar Meridian Developers Hackathon. Funds will be locked in a multi-sig smart escrow and distributed dynamically to outstanding projects in DeFi, Decentralized Identity, and Real World Asset (RWA) tokenization. Administered by the Stellar Foundation Dev Committee.',
    creator: 'GBX7A2K7YPQN6MZ4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWR',
    category: 'Community',
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
    tags: ['Hackathon', 'Community-Pool', 'Grants', 'Meridian'],
    options: [
      { id: '1', text: 'Yes, sponsor with 150K XLM', votes: 122 },
      { id: '2', text: 'No, reduce to 75K XLM', votes: 34 },
      { id: '3', text: 'Reject sponsorship entirely', votes: 5 },
    ],
    totalVotes: 161,
    totalXlmWeight: 890500,
    voters: {},
  },
  {
    id: 'GP-2026-03',
    title: 'GP-2026-03: Transition Community Treasury Multi-Sig from 3/5 to 4/7 Threshold',
    description: 'To enhance security for the community treasury vault, this proposal requests a network-wide multi-sig reconfiguration. We propose adding two reputable regional institutional validators (AnchorAsia and StellarEuro) as co-signers, upgrading the signing threshold from 3-of-5 to 4-of-7. This mitigates single points of failure.',
    creator: 'GBC4H2K7YPQN6MZ4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWR',
    category: 'Governance',
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days from now
    tags: ['Treasury', 'Multi-sig', 'Security'],
    options: [
      { id: '1', text: 'Support 4/7 Multi-Sig Upgrade', votes: 62 },
      { id: '2', text: 'Keep 3/5 Multi-Sig', votes: 4 },
      { id: '3', text: 'Abstain', votes: 12 },
    ],
    totalVotes: 78,
    totalXlmWeight: 671000,
    voters: {},
  },
  {
    id: 'GP-2026-04',
    title: 'GP-2026-04: Implement Liquidity Pool Fee Incentives for XLM/USDC Pairs',
    description: 'A proposal to enable extra liquidity mining payouts (0.05% bonus) for standard Automated Market Maker (AMM) pools trading the XLM/USDC pair. Designed to increase stablecoin liquidity depth on the built-in Stellar Decentralized Exchange (DEX). This proposal has officially finished voting.',
    creator: 'GBA2K7YPQN6MZ4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWR',
    category: 'Protocol',
    status: 'closed',
    endsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // Ended 2 days ago
    tags: ['AMM', 'Liquidity', 'DEX', 'USDC'],
    options: [
      { id: '1', text: 'Approve Liquidity Incentives', votes: 245 },
      { id: '2', text: 'Reject Liquidity Incentives', votes: 12 },
    ],
    totalVotes: 257,
    totalXlmWeight: 2405000,
    voters: {},
  },
  {
    id: 'GP-2026-05',
    title: 'GP-2026-05: Adopt Decentralized Identity (DID) Standards for KYC Integrations',
    description: 'We propose the formalization of a standardized SEP (Stellar Ecosystem Proposal) for W3C-compliant Decentralized Identifiers (DIDs). This would allow Stellar anchor nodes and regulated asset issuers to leverage on-chain identity credentials, speeding up cross-border KYC check times and lowering compliance fees.',
    creator: 'GBX7A2K7YPQN6MZ4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWRD6N4VWR',
    category: 'Protocol',
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    tags: ['DID', 'Standards', 'SEP', 'Compliance'],
    options: [
      { id: '1', text: 'Support Standard Proposal', votes: 89 },
      { id: '2', text: 'Request Re-Draft / Delay', votes: 42 },
      { id: '3', text: 'Oppose DID on public ledger', votes: 11 },
    ],
    totalVotes: 142,
    totalXlmWeight: 912000,
    voters: {},
  }
];

export class PollStore {
  private static listeners: Set<() => void> = new Set();
  
  static getPolls(): Poll[] {
    if (typeof window === 'undefined') return DEFAULT_POLLS;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_POLLS));
      return DEFAULT_POLLS;
    }
    try {
      // Sync active/closed status dynamically based on current time
      const polls: Poll[] = JSON.parse(stored);
      let changed = false;
      const now = new Date().toISOString();
      const updatedPolls = polls.map(p => {
        if (p.status === 'active' && new Date(p.endsAt).getTime() < Date.now()) {
          changed = true;
          return { ...p, status: 'closed' as const };
        }
        return p;
      });
      if (changed) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPolls));
        return updatedPolls;
      }
      return polls;
    } catch {
      return DEFAULT_POLLS;
    }
  }

  static getPublicKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(WALLET_KEY);
  }

  static getXlmBalance(): number {
    if (typeof window === 'undefined') return 0;
    const balance = localStorage.getItem(BALANCE_KEY);
    return balance ? Number(balance) : 0;
  }

  static getSequenceNumber(): number {
    if (typeof window === 'undefined') return 0;
    const seq = localStorage.getItem(SEQ_KEY);
    return seq ? Number(seq) : 100000;
  }

  static getTransactions(): StellarTransaction[] {
    if (typeof window === 'undefined') return [];
    const txs = localStorage.getItem(TXS_KEY);
    if (!txs) return [];
    try {
      return JSON.parse(txs);
    } catch {
      return [];
    }
  }

  static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify() {
    this.listeners.forEach(listener => listener());
  }

  static connectWallet(customKey?: string) {
    if (typeof window === 'undefined') return;
    const key = customKey && customKey.trim().length === 56 ? customKey.trim() : generateStellarAddress();
    localStorage.setItem(WALLET_KEY, key);
    // Initialize standard balance for testing
    if (!localStorage.getItem(BALANCE_KEY)) {
      localStorage.setItem(BALANCE_KEY, '5000'); // Default 5,000 XLM voting weight!
    }
    if (!localStorage.getItem(SEQ_KEY)) {
      localStorage.setItem(SEQ_KEY, '34918290'); // Random high starting sequence
    }
    this.notify();
  }

  static disconnectWallet() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(WALLET_KEY);
    localStorage.removeItem(BALANCE_KEY);
    localStorage.removeItem(SEQ_KEY);
    this.notify();
  }

  static faucetFund() {
    if (typeof window === 'undefined') return;
    const current = this.getXlmBalance();
    localStorage.setItem(BALANCE_KEY, (current + 10000).toString());
    
    // Add a tx log for funding!
    const pubKey = this.getPublicKey() || 'G_ANONYMOUS';
    const tx = {
      hash: Math.random().toString(16).substring(2, 10) + '...faucet',
      sequenceNumber: this.getSequenceNumber(),
      memo: 'Simulated Testnet Faucet Fund',
      fee: 0,
      sourceAccount: 'G_STELLAR_TESTNET_FAUCET',
      ledger: Math.floor(Math.random() * 5000) + 49000000,
      timestamp: new Date().toISOString(),
      xdr: 'FAUCET_XDR_FUNDING_10000_XLM',
      status: 'success' as const
    };
    const txs = this.getTransactions();
    localStorage.setItem(TXS_KEY, JSON.stringify([tx, ...txs].slice(0, 50)));

    this.notify();
  }

  static createPoll(
    title: string,
    description: string,
    category: 'Governance' | 'Tech Stack' | 'Protocol' | 'Community',
    durationDays: number,
    optionsTexts: string[],
    tagsString: string
  ): string {
    const polls = this.getPolls();
    const id = `GP-2026-0${polls.length + 1}`;
    const endsAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * durationDays).toISOString();
    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    const options = optionsTexts
      .filter(o => o.trim().length > 0)
      .map((text, idx) => ({
        id: (idx + 1).toString(),
        text,
        votes: 0,
      }));

    const newPoll: Poll = {
      id,
      title: `${id}: ${title}`,
      description,
      creator: this.getPublicKey() || 'G_ANONYMOUS',
      category,
      status: 'active',
      endsAt,
      tags,
      options,
      totalVotes: 0,
      totalXlmWeight: 0,
      voters: {},
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newPoll, ...polls]));
    this.notify();
    return id;
  }

  static votePoll(pollId: string, optionId: string): Promise<StellarTransaction> {
    return new Promise((resolve, reject) => {
      // Simulate build, sign, submit times
      setTimeout(() => {
        const polls = this.getPolls();
        const pollIndex = polls.findIndex(p => p.id === pollId);
        if (pollIndex === -1) {
          reject(new Error('Poll not found'));
          return;
        }

        const poll = polls[pollIndex];
        const publicKey = this.getPublicKey();
        const balance = this.getXlmBalance();
        const sequence = this.getSequenceNumber();

        if (!publicKey) {
          reject(new Error('Wallet not connected'));
          return;
        }

        if (poll.status === 'closed') {
          reject(new Error('Voting is closed for this proposal'));
          return;
        }

        if (poll.voters[publicKey]) {
          reject(new Error('This Stellar account has already casted a ballot on this proposal'));
          return;
        }

        const option = poll.options.find(o => o.id === optionId);
        if (!option) {
          reject(new Error('Option not found'));
          return;
        }

        // Build simulated transaction
        const memo = `VOTE:${pollId}:${optionId}`;
        const tx = simulateStellarTx(publicKey, sequence + 1, memo, option.text);

        // Record the transaction
        const txs = this.getTransactions();
        localStorage.setItem(TXS_KEY, JSON.stringify([tx, ...txs].slice(0, 50)));

        // Increment sequence
        localStorage.setItem(SEQ_KEY, (sequence + 1).toString());

        // Update the poll ballot
        const updatedOptions = poll.options.map(o => {
          if (o.id === optionId) {
            return { ...o, votes: o.votes + 1 };
          }
          return o;
        });

        const newVoterInfo: VoterInfo = {
          publicKey,
          balance,
          votedOptionId: optionId,
          timestamp: new Date().toISOString(),
          txHash: tx.hash,
        };

        const updatedPoll: Poll = {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1,
          totalXlmWeight: poll.totalXlmWeight + balance,
          voters: {
            ...poll.voters,
            [publicKey]: newVoterInfo,
          },
        };

        const updatedPolls = [...polls];
        updatedPolls[pollIndex] = updatedPoll;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPolls));

        this.notify();
        resolve(tx);
      }, 1500); // realistic network delay!
    });
  }
}
