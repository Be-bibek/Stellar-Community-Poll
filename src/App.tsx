import { useState, useEffect } from 'react';
import { PollStore } from './store';
import { Poll, StellarTransaction } from './types';
import Header from './components/Header';
import PollCard from './components/PollCard';
import CreatePollModal from './components/CreatePollModal';
import PollDetails from './components/PollDetails';
import { 
  Plus, Search, SlidersHorizontal, BookOpen, AlertCircle, 
  HelpCircle, History, ExternalLink, RefreshCw, Cpu 
} from 'lucide-react';

export default function App() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  // Modal and Router States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentPollId, setCurrentPollId] = useState<string | null>(null);

  // Simulated live wallet logs
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<StellarTransaction[]>([]);

  // Sync state with the store and handle query routing
  useEffect(() => {
    // 1. Initial State Load
    setPolls(PollStore.getPolls());
    setPublicKey(PollStore.getPublicKey());
    setBalance(PollStore.getXlmBalance());
    setTransactions(PollStore.getTransactions());
    setCurrentTime(Date.now());

    // 2. Client Parameter URL Router sync
    const handleUrlRouting = () => {
      const params = new URLSearchParams(window.location.search);
      const pollId = params.get('poll');
      if (pollId) {
        setCurrentPollId(pollId);
      } else {
        setCurrentPollId(null);
      }
    };
    handleUrlRouting();

    // 3. Store subscriptions
    const unsubscribe = PollStore.subscribe(() => {
      setPolls(PollStore.getPolls());
      setPublicKey(PollStore.getPublicKey());
      setBalance(PollStore.getXlmBalance());
      setTransactions(PollStore.getTransactions());
    });

    // 4. Timer intervals (time calculations & popstate listeners)
    window.addEventListener('popstate', handleUrlRouting);
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);

    return () => {
      unsubscribe();
      window.removeEventListener('popstate', handleUrlRouting);
      clearInterval(interval);
    };
  }, []);

  const handleOpenPoll = (id: string) => {
    setCurrentPollId(id);
    const params = new URLSearchParams(window.location.search);
    params.set('poll', id);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleClosePoll = () => {
    setCurrentPollId(null);
    const params = new URLSearchParams(window.location.search);
    params.delete('poll');
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.pushState({}, '', newUrl);
  };

  const handleCreateSuccess = (newPollId: string) => {
    setIsCreateOpen(false);
    handleOpenPoll(newPollId);
  };

  // Filtering Logic
  const categories = ['All', 'Governance', 'Tech Stack', 'Protocol', 'Community'];

  const filteredPolls = polls.filter((poll) => {
    // Category match
    const matchesCategory = selectedCategory === 'All' || poll.category === selectedCategory;

    // Status match
    let matchesStatus = true;
    if (activeTab === 'active') {
      matchesStatus = poll.status === 'active';
    } else if (activeTab === 'closed') {
      matchesStatus = poll.status === 'closed';
    }

    // Search query match
    const matchesSearch = 
      poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background Ambient Stars Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-950/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-950/20 blur-[100px]" />
      </div>

      {/* Primary Header */}
      <Header />

      {/* Main Body */}
      <main className="relative z-10 py-6 max-w-7xl mx-auto">
        {currentPollId ? (
          // Single Poll Detail Page (includes the QR Code generator!)
          <PollDetails 
            pollId={currentPollId} 
            onBack={handleClosePoll} 
            currentTime={currentTime} 
          />
        ) : (
          // Main Dashboard Page
          <div className="space-y-6 px-4 sm:px-6">
            
            {/* Hero Banner Section */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />
              <div className="space-y-2 max-w-2xl">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/15">
                  🛡️ Decentralized Consensus
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white leading-tight">
                  Stellar Ecosystem DAO Governance
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl">
                  Connect your keypair to cast weighted ballots on network upgrades, treasury grants, and protocol updates. Your voting power is calculated directly from your simulated XLM holdings.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    if (!publicKey) {
                      PollStore.connectWallet();
                    }
                    setIsCreateOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all duration-300 shadow-lg hover:shadow-white/5 flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>Propose Change</span>
                </button>
              </div>
            </section>

            {/* Main content split dashboard layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Left Column filters (1 part on desktop, full-width on mobile) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Search and Filters Hub */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-950/60 border border-white/10 p-4 rounded-2xl">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search proposals, contract upgrades, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-cyan-500/40 focus:outline-none placeholder:text-neutral-500 transition-all"
                    />
                  </div>

                  {/* Status toggle tabs */}
                  <div className="flex border border-white/10 rounded-xl p-1 bg-black/40 self-start sm:self-auto">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'all' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveTab('active')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'active' ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setActiveTab('closed')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'closed' ? 'bg-red-500/10 text-red-400 font-semibold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Ended
                    </button>
                  </div>
                </div>

                {/* Categories filtering tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium font-sans border transition-all duration-200 whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-semibold shadow-lg shadow-cyan-500/5'
                          : 'bg-neutral-900/40 border-white/5 text-neutral-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Proposals listing layout */}
                {filteredPolls.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center space-y-3">
                    <HelpCircle className="h-8 w-8 text-neutral-600 mx-auto" />
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-300">No Proposals Found</h4>
                      <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                        No proposals matches the active category or query search selection. Try broadening your criteria.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {filteredPolls.map((poll) => (
                      <PollCard
                        key={poll.id}
                        poll={poll}
                        currentTime={currentTime}
                        onClick={() => handleOpenPoll(poll.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column sidebar: Stats logs and guide */}
              <div className="space-y-6">
                
                {/* Simulated Ledger & Network telemetry info */}
                <div className="rounded-2xl border border-white/10 bg-neutral-900/20 p-5 space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Cpu className="h-4 w-4 text-cyan-500" />
                    <span>Stellar Consensus Network</span>
                  </h3>
                  
                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">NETWORK STATE</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        ● ONLINE (TESTNET)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">BASE FEES</span>
                      <span className="text-neutral-300">100 Stroops</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">TX SPEED</span>
                      <span className="text-neutral-300">1.4s (avg ledger sync)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">VOTING ALGORITHM</span>
                      <span className="text-neutral-300">Soroban State Weight</span>
                    </div>
                  </div>
                </div>

                {/* Simulated wallet recent transactions logs list */}
                <div className="rounded-2xl border border-white/10 bg-neutral-900/20 p-5 space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <History className="h-4 w-4 text-cyan-500" />
                    <span>Your Ledger Logs</span>
                  </h3>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {!publicKey ? (
                      <p className="text-xs text-neutral-500 text-center py-4 font-mono leading-relaxed">
                        Connect wallet to load simulated transaction logging records.
                      </p>
                    ) : transactions.length === 0 ? (
                      <p className="text-xs text-neutral-500 text-center py-4 font-mono leading-relaxed">
                        No transactions found. Casting a ballot or using the Faucet generates detailed ledger records!
                      </p>
                    ) : (
                      transactions.map((tx, idx) => (
                        <div key={idx} className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1.5 font-mono text-[10px]">
                          <div className="flex justify-between items-center text-neutral-400">
                            <span className="text-cyan-400 font-bold uppercase truncate max-w-[110px]" title={tx.memo}>
                              {tx.memo}
                            </span>
                            <span>{new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
                          </div>
                          
                          <div className="flex justify-between text-neutral-500">
                            <span>TX HASH</span>
                            <span className="text-neutral-300 truncate max-w-[120px]" title={tx.hash}>
                              {tx.hash}
                            </span>
                          </div>

                          <div className="flex justify-between text-neutral-500">
                            <span>LEDGER / FEE</span>
                            <span className="text-neutral-300">
                              #{tx.ledger} / {tx.fee} stroops
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* FAQ & Guidelines card */}
                <div className="rounded-2xl border border-white/10 bg-neutral-900/20 p-5 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Quick FAQ</span>
                  </h4>
                  <ul className="text-[11px] text-neutral-400 space-y-2 leading-relaxed">
                    <li>
                      <strong className="text-neutral-200 block mb-0.5">How is voting weight calculated?</strong>
                      Weight is proportional to your connected account's XLM balance. 1 XLM = 1 vote power weight unit.
                    </li>
                    <li>
                      <strong className="text-neutral-200 block mb-0.5">How can I test with more voting weight?</strong>
                      Click the <span className="text-cyan-400 font-bold">💧 Faucet</span> button in the header wallet panel. It instantly deposits 10,000 simulated XLM!
                    </li>
                  </ul>
                </div>

              </div>

            </div>

          </div>
        )}
      </main>

      {/* Proposal Creation Dialog */}
      <CreatePollModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
