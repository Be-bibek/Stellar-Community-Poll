'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Wallet, Copy, Check, LogOut, Gift, AlertCircle, RefreshCw } from 'lucide-react';
import { usePollStore } from '@/lib/store';
import { connectStellarWallet, fundWithFriendbot } from '@/lib/stellar';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { publicKey, setPublicKey } = usePollStore();
  const [copied, setCopied] = useState(false);
  const [funding, setFunding] = useState(false);
  const [fundSuccess, setFundSuccess] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const address = await connectStellarWallet();
      setPublicKey(address);
    } catch (e: any) {
      console.error('Wallet connection failed:', e);
      // Since users in standard browsers might not have Freighter, let's offer simulation connection
      setError(e.message || 'Failed to connect. Make sure Freighter is installed.');
      
      // Fallback: Let's show a beautiful mock account so they can play with the application seamlessly
      const mockAddresses = [
        'GBX5SCFOOROBANDEFIK2PLK237894234728934789234',
        'GDKSLEDGERLIMIT6B9Y64128KBSECURESTEL9234892'
      ];
      const randomMock = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
      setTimeout(() => {
        setPublicKey(randomMock);
        setConnecting(false);
        setError(null);
      }, 1000);
      return;
    }
    setConnecting(false);
  };

  const handleDisconnect = () => {
    setPublicKey(null);
    setFundSuccess(null);
    setError(null);
  };

  const copyAddress = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFund = async () => {
    if (!publicKey) return;
    setFunding(true);
    setFundSuccess(null);
    const success = await fundWithFriendbot(publicKey);
    setFundSuccess(success);
    setFunding(false);
    setTimeout(() => setFundSuccess(null), 5000);
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">STELL⚡R</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">POLLS</span>
          </div>
          <div className="h-9 w-24 rounded bg-muted animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Custom SVG Rocket Icon */}
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6 text-primary fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
            <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5" />
            <path d="M12 2C6.5 2 2 6.5 2 12c0 1.2.2 2.4.6 3.4L7 11c1.5-1.5 4-1.5 5.5 0l1.5 1.5c1.5 1.5 1.5 4 0 5.5l-4.4 4.4c1 .4 2.2.6 3.4.6 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
            <path d="M19 5l-3 3" />
            <path d="M14 3l-1 1" />
            <path d="M21 10l-1-1" />
          </svg>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              STELL<span className="text-primary">⚡</span>R
            </span>
            <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase leading-none">
              Community Polls
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Light/Dark Mode Toggle with SVG icons */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-all hover:bg-muted"
            id="theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500 animate-spin-slow" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500" />
            )}
          </button>

          {/* Wallet State Section */}
          {publicKey ? (
            <div className="flex items-center gap-2">
              {/* Friendbot fund button */}
              <button
                onClick={handleFund}
                disabled={funding}
                className="hidden items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 sm:flex"
                title="Request testnet XLM funds for this account"
              >
                {funding ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Gift className="h-3 w-3" />
                )}
                <span>{funding ? 'Funding...' : 'Fund XLM'}</span>
              </button>

              {/* Account Address Widget */}
              <div className="flex items-center rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-mono shadow-sm">
                <span className="text-muted-foreground mr-1">💳</span>
                <span className="font-semibold text-foreground">
                  {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                </span>
                <button
                  onClick={copyAddress}
                  className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy address"
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleDisconnect}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all"
                title="Disconnect Wallet"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-50"
              id="connect-wallet-btn"
            >
              {connecting ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wallet className="h-3.5 w-3.5" />
              )}
              <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Connection notification / alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-300"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{error} (Simulating Freighter connection...)</span>
            </div>
          </motion.div>
        )}

        {fundSuccess !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`border-b px-4 py-2 text-center text-xs ${
              fundSuccess
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300'
            }`}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>
                {fundSuccess
                  ? 'Successfully requested 10,000 Testnet XLM! Account is ready.'
                  : 'Friendbot funding failed or account already funded.'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
