import { useState, useEffect } from 'react';
import { PollStore } from '../store';
import { Poll, StellarTransaction, VoterInfo } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, Calendar, User, Tag, Check, Award, Users, 
  Clock, Share2, Copy, ShieldAlert, Cpu, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface PollDetailsProps {
  pollId: string;
  onBack: () => void;
  currentTime: number | null;
}

export default function PollDetails({ pollId, onBack, currentTime }: PollDetailsProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  
  // Voting interaction states
  const [voteState, setVoteState] = useState<'idle' | 'building' | 'signing' | 'submitting' | 'success' | 'failed'>('idle');
  const [lastTx, setLastTx] = useState<StellarTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Share & QR code states
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state with store
  useEffect(() => {
    const fetchPoll = () => {
      const polls = PollStore.getPolls();
      const found = polls.find(p => p.id === pollId);
      if (found) {
        setPoll(found);
      }
      setPublicKey(PollStore.getPublicKey());
      setBalance(PollStore.getXlmBalance());
    };

    fetchPoll();
    const unsubscribe = PollStore.subscribe(fetchPoll);
    return () => unsubscribe();
  }, [pollId]);

  const handleCopyLink = () => {
    const shareUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}${window.location.pathname}?poll=${poll?.id}`
      : '';
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = async () => {
    if (!poll) return;
    if (!selectedOptionId) {
      setError('Please select an option to register your vote.');
      return;
    }
    if (!publicKey) {
      setError('Please connect your Stellar Wallet in the header first.');
      return;
    }

    setError(null);
    setVoteState('building');
    
    try {
      // Step 1: Building transaction
      await new Promise(r => setTimeout(r, 600));
      setVoteState('signing');
      
      // Step 2: Signing envelope
      await new Promise(r => setTimeout(r, 500));
      setVoteState('submitting');
      
      // Step 3: Broadcast transaction
      const tx = await PollStore.votePoll(poll.id, selectedOptionId);
      setLastTx(tx);
      setVoteState('success');
      setSelectedOptionId('');
    } catch (err: any) {
      setError(err?.message || 'Transaction submission failed.');
      setVoteState('failed');
    }
  };

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-400">
        <ShieldAlert className="h-10 w-10 text-red-500 mb-2" />
        <p>Governance Proposal not found.</p>
        <button onClick={onBack} className="mt-4 text-cyan-400 flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  // Calculate stats
  const getRemainingTime = () => {
    if (poll.status === 'closed') return 'Ended';
    if (!currentTime) return 'Calculating...';
    
    const diff = new Date(poll.endsAt).getTime() - currentTime;
    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const isClosed = poll.status === 'closed' || getRemainingTime() === 'Ended';
  const hasVoted = publicKey ? !!poll.voters[publicKey] : false;
  const userVoteInfo = publicKey ? poll.voters[publicKey] : null;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?poll=${poll.id}`
    : `https://stellarvote.io/poll/${poll.id}`;

  return (
    <div className="relative space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white bg-white/5 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg transition-all"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to proposals</span>
      </button>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Proposal details and vote interface */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main proposal card */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/30 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/10">
                  {poll.category}
                </span>
                <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isClosed ? 'bg-red-500/10 text-red-400 border-red-500/10' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10 animate-pulse'
                }`}>
                  {isClosed ? 'Ended 🔴' : 'Active 🟢'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-neutral-400">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>{getRemainingTime()}</span>
              </div>
            </div>

            {/* Proposal description */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                {poll.title}
              </h2>
              
              <div className="flex flex-wrap gap-2 pt-1">
                {poll.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-mono uppercase text-neutral-400 mb-2">Proposal Overview</h4>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                  {poll.description}
                </p>
              </div>
            </div>

            {/* Proposal metadata */}
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4 text-xs font-mono text-neutral-400">
              <div>
                <span className="block text-[10px] text-neutral-500 uppercase">Created By</span>
                <span className="text-neutral-300 truncate block max-w-xs">{poll.creator}</span>
              </div>
              <div>
                <span className="block text-[10px] text-neutral-500 uppercase">Voting Deadline</span>
                <span className="text-neutral-300 block">{new Date(poll.endsAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Voting ballot panel */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/30 p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-mono uppercase text-neutral-400 border-b border-white/5 pb-2">
              Ballot Voting Choices
            </h3>

            {voteState !== 'idle' && voteState !== 'failed' && voteState !== 'success' ? (
              // Voting Blockchain Simulation Interface
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" />
                  <Cpu className="absolute inset-0 m-auto h-5 w-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {voteState === 'building' && 'Building Soroban Tx... 🔨'}
                    {voteState === 'signing' && 'Awaiting cryptographic signature... 🔑'}
                    {voteState === 'submitting' && 'Casting ballot transaction envelope... 🚀'}
                  </h4>
                  <p className="text-[10px] font-mono text-neutral-500 max-w-sm mt-1 mx-auto leading-relaxed">
                    {voteState === 'building' && 'Generating Soroban contract invocation transaction with account parameters, sequence number, and memo values.'}
                    {voteState === 'signing' && 'Validating keys inside simulated wallet and cryptographically signing the transaction envelope.'}
                    {voteState === 'submitting' && 'Broadcasting transaction envelope XDR to the Stellar consensus validator cluster. Ledger registration in progress.'}
                  </p>
                </div>
              </div>
            ) : voteState === 'success' ? (
              // Transaction Success Card
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-5 flex flex-col items-center text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400">Ballot Cast Successfully! 🎉</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Your ballot has been parsed and permanently validated inside the Stellar ledger state. Your voting weight was proportional to your XLM balance.
                  </p>
                </div>
                {lastTx && (
                  <div className="w-full rounded-lg bg-black/50 p-3 text-left font-mono text-[10px] space-y-1 text-neutral-400 border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">LEDGER</span>
                      <span className="text-white">#{lastTx.ledger}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">TX HASH</span>
                      <span className="text-white truncate max-w-[150px]" title={lastTx.hash}>{lastTx.hash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">SEQUENCE</span>
                      <span className="text-white">#{lastTx.sequenceNumber}</span>
                    </div>
                    <div className="flex flex-col pt-1.5 border-t border-white/5">
                      <span className="text-neutral-500 mb-0.5">XDR ENV</span>
                      <span className="text-cyan-500 font-mono text-[9px] break-all leading-normal">{lastTx.xdr}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setVoteState('idle')}
                  className="px-4 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-200 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              // Option selection
              <div className="space-y-3">
                {error && (
                  <div className="rounded-xl bg-red-950/20 border border-red-500/20 p-3 flex items-start gap-2 text-red-400 text-xs">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {hasVoted ? (
                  // User already voted message
                  <div className="rounded-xl bg-cyan-950/20 border border-cyan-500/20 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>This Account has Casted a Ballot 🗳️</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      You already casted a vote for <strong className="text-white">"{poll.options.find(o => o.id === userVoteInfo?.votedOptionId)?.text}"</strong> with an active voting power weight of <strong className="text-cyan-400">{userVoteInfo?.balance?.toLocaleString()} XLM</strong> on {new Date(userVoteInfo?.timestamp || '').toLocaleDateString()}.
                    </p>
                    {userVoteInfo?.txHash && (
                      <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono text-neutral-500">
                        <span>Ledger Tx Hash</span>
                        <span className="text-neutral-400 truncate max-w-[200px]" title={userVoteInfo.txHash}>{userVoteInfo.txHash}</span>
                      </div>
                    )}
                  </div>
                ) : isClosed ? (
                  // Poll closed message
                  <div className="rounded-xl bg-neutral-900 border border-white/5 p-4 text-center text-xs text-neutral-400">
                    🔒 Voting has concluded. Ballots are finalized.
                  </div>
                ) : !publicKey ? (
                  // Wallet not connected
                  <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center text-xs text-neutral-400 space-y-2">
                    <p>Connect your simulated Stellar Wallet in the header to participate in this poll.</p>
                  </div>
                ) : (
                  // Active selection interface
                  <div className="space-y-3">
                    {poll.options.map((option) => {
                      const isSelected = selectedOptionId === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedOptionId(option.id)}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                            isSelected 
                              ? 'bg-cyan-950/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/5' 
                              : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="text-sm font-medium">{option.text}</span>
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-neutral-500'
                          }`}>
                            {isSelected && <div className="h-1.5 w-1.5 bg-neutral-950 rounded-full" />}
                          </div>
                        </button>
                      );
                    })}

                    <div className="flex justify-between items-center pt-3 text-xs font-mono text-neutral-400 flex-wrap gap-2">
                      <span>Casting address weight: <strong className="text-cyan-400">{balance.toLocaleString()} XLM</strong></span>
                      <button
                        onClick={handleVote}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md hover:shadow-cyan-500/10 active:scale-95 flex items-center gap-1.5"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>Sign & Broadcast Ballot</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Vote share panel & voter list */}
        <div className="space-y-6">
          
          {/* QR Code and Share Panel */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/30 p-5 sm:p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-cyan-500/5 blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-mono uppercase text-neutral-400 flex items-center gap-1.5">
                <Share2 className="h-4 w-4 text-cyan-400" />
                <span>Share Proposal</span>
              </h3>
            </div>

            {/* Render beautifully styled QR code */}
            <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white text-black max-w-[200px] mx-auto shadow-md">
              <QRCodeSVG 
                value={shareUrl} 
                size={160} 
                bgColor="#ffffff" 
                fgColor="#000000" 
                includeMargin={true}
              />
              <p className="text-[9px] font-mono font-bold uppercase text-neutral-500 mt-2 text-center tracking-wider">
                Scan with Mobile
              </p>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed text-center font-mono">
              Scan QR above to seamlessly read and vote on this proposal directly on your smartphone.
            </p>

            {/* Copyable link bar */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl p-1.5 pl-3">
              <span className="text-[10px] font-mono text-neutral-500 truncate flex-1 select-all">
                {shareUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/10 text-neutral-400 hover:text-cyan-400 transition-all flex items-center gap-1 text-[11px] font-mono"
                title="Copy share link"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Aggregated Vote tally & progress */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/30 p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-mono uppercase text-neutral-400 border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>Ballot Metrics</span>
            </h3>

            <div className="space-y-4 pt-1">
              {poll.options.map((opt) => {
                const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                return (
                  <div key={opt.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-300 font-medium truncate max-w-[70%]">{opt.text}</span>
                      <span className="text-neutral-400 font-bold">{opt.votes} ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="block text-[10px] text-neutral-500">TOTAL VOTERS</span>
                  <strong className="text-white font-sans text-base">{poll.totalVotes}</strong>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="block text-[10px] text-neutral-500">XLM STAKED</span>
                  <strong className="text-white font-sans text-base">{(poll.totalXlmWeight / 1000).toFixed(1)}k</strong>
                </div>
              </div>
            </div>
          </div>

          {/* On-chain Voter History Logs */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/30 p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-mono uppercase text-neutral-400 border-b border-white/5 pb-2 flex items-center gap-1.5">
              <span>On-Chain Ballots ({Object.keys(poll.voters).length})</span>
            </h3>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {Object.keys(poll.voters).length === 0 ? (
                <p className="text-xs text-neutral-500 font-mono text-center py-4">No votes logged on-chain yet.</p>
              ) : (
                (Object.values(poll.voters) as VoterInfo[])
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((voter: VoterInfo, idx) => (
                    <div key={idx} className="bg-black/20 p-2.5 rounded-lg border border-white/5 space-y-1.5 font-mono text-[11px] text-neutral-300">
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-400 font-bold" title={voter.publicKey}>
                          {voter.publicKey.substring(0, 6)}...{voter.publicKey.substring(50)}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(voter.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span className="truncate max-w-[120px]">
                          Voted: "{poll.options.find(o => o.id === voter.votedOptionId)?.text}"
                        </span>
                        <span className="text-neutral-300 font-bold">{voter.balance.toLocaleString()} XLM</span>
                      </div>
                      <div className="text-[9px] text-neutral-500 flex justify-between">
                        <span>Ledger Tx Hash</span>
                        <span className="text-neutral-400 truncate max-w-[120px]" title={voter.txHash}>{voter.txHash}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
