import { useEffect, useState } from 'react';
import { PollStore } from '../store';
import { Wallet, Coins, RefreshCw, Zap } from 'lucide-react';

export default function Header() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [ledger, setLedger] = useState<number>(54891024);
  const [isFunding, setIsFunding] = useState(false);

  useEffect(() => {
    // Initial fetch
    setPublicKey(PollStore.getPublicKey());
    setBalance(PollStore.getXlmBalance());

    // Sync with store changes
    const unsubscribe = PollStore.subscribe(() => {
      setPublicKey(PollStore.getPublicKey());
      setBalance(PollStore.getXlmBalance());
    });

    // Simulate Stellar ledger ticking every 5 seconds
    const interval = setInterval(() => {
      setLedger(prev => prev + 1);
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleConnect = () => {
    PollStore.connectWallet();
  };

  const handleDisconnect = () => {
    PollStore.disconnectWallet();
  };

  const handleFaucet = () => {
    setIsFunding(true);
    PollStore.faucetFund();
    setTimeout(() => {
      setIsFunding(false);
    }, 800);
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(50)}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/80 backdrop-blur-md px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20">
          <Zap className="h-5 w-5 text-white" />
          <div className="absolute -inset-0.5 rounded-xl bg-cyan-400 opacity-20 blur group-hover:opacity-100" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-sans tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            StellarVote
          </h1>
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Stellar Governance Platform
          </p>
        </div>
      </div>

      {/* Network Stats & Wallet Controls */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between sm:justify-end">
        {/* Ledger number ticker */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-neutral-400">
          <RefreshCw className="h-3 w-3 text-cyan-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Ledger #{ledger.toLocaleString()}</span>
        </div>

        {publicKey ? (
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* XLM Balance display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-white flex-1 sm:flex-none justify-center">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-neutral-200">{balance.toLocaleString()} XLM</span>
              <button
                onClick={handleFaucet}
                disabled={isFunding}
                className="ml-2 hover:bg-neutral-800 p-1 rounded transition-colors text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50"
                title="Fund 10,000 simulated XLM"
              >
                💧 <span className="text-[10px] font-mono uppercase">Faucet</span>
              </button>
            </div>

            {/* Address & Disconnect */}
            <div className="flex items-center gap-1">
              <div className="px-3 py-1.5 rounded-l-lg bg-neutral-900 border-y border-l border-white/10 text-xs font-mono text-neutral-300 hidden sm:block">
                {formatAddress(publicKey)}
              </div>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded-lg sm:rounded-l-none sm:rounded-r-lg bg-red-950/30 border border-red-500/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-95 flex items-center justify-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            <span>Connect Stellar Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
}
