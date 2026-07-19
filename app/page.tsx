'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import { usePollStore } from '@/lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Vote, Calendar, CheckCircle2, AlertCircle, Plus, Sparkles, ChevronRight, BarChart3 } from 'lucide-react';
import { connectStellarWallet } from '@/lib/stellar';

export default function Home() {
  const { polls, publicKey, setPublicKey, addPoll } = usePollStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'closed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  
  // Custom Poll Creation Form State (Simple Inline Drawer / Collapsible)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Governance');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [newDuration, setNewDuration] = useState('7'); // days
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setCurrentTime(Date.now());
    }, 0);
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const categories = ['All', 'Governance', 'Tech Stack', 'Protocol', 'Community'];

  const filteredPolls = polls.filter((poll) => {
    const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          poll.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          poll.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === 'all' ? true : poll.status === activeTab;
    
    const matchesCategory = selectedCategory === 'All' ? true : poll.category === selectedCategory;

    return matchesSearch && matchesTab && matchesCategory;
  });

  const handleConnect = async () => {
    try {
      const address = await connectStellarWallet();
      setPublicKey(address);
    } catch (e) {
      console.error('Wallet connection failed:', e);
      // Fallback already handled in Header
    }
  };

  const handleAddOption = () => {
    setNewOptions([...newOptions, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (newOptions.length <= 2) return;
    setNewOptions(newOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const opts = [...newOptions];
    opts[index] = val;
    setNewOptions(opts);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newDesc.trim()) return;
    
    const finalOptions = newOptions.filter(o => o.trim() !== '').map((o, idx) => ({
      id: `opt-${idx}-${Date.now()}`,
      text: o,
      votes: 0
    }));

    if (finalOptions.length < 2) return;

    const endsAtDate = new Date();
    endsAtDate.setDate(endsAtDate.getDate() + parseInt(newDuration));

    addPoll({
      question: newQuestion,
      description: newDesc,
      category: newCategory,
      options: finalOptions,
      creator: publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : 'Anonymous',
      endsAt: endsAtDate.toISOString(),
      status: 'active',
      tags: newTags.split(',').map(t => t.trim()).filter(t => t !== '')
    });

    // Reset Form
    setNewQuestion('');
    setNewDesc('');
    setNewOptions(['', '']);
    setNewTags('');
    setShowCreateForm(false);
  };

  const getRemainingTime = (endsAtStr: string, status: 'active' | 'closed', current: number | null) => {
    if (status === 'closed' || !current) return 'Ended';
    const diff = new Date(endsAtStr).getTime() - current;
    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-transparent to-transparent py-20 text-center sm:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary/5),transparent)]"></div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Soroban-Powered Decentralized Polling
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl"
          >
            Shape the Future of <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Stellar</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
          >
            Secure, verifiable, and gas-efficient community governance polls built natively on the Stellar blockchain network.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            {publicKey ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/35 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Create Community Proposal</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/35 transition-all active:scale-95"
              >
                <Vote className="h-4 w-4" />
                <span>Connect Wallet to Vote</span>
              </button>
            )}
            <a
              href="#poll-explore"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-all"
            >
              <span>Explore Active Polls</span>
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Main content explore dashboard container */}
      <main id="poll-explore" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Dynamic Proposal Drawer / Creation Form Panel */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 shadow-xl shadow-primary/5"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Draft Community Proposal</h3>
                    <p className="text-xs text-muted-foreground">Propose a new governance or protocol standard directly to the community</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePoll} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Proposal Question ✍️</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Should we establish a Soroban security auditing pool?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Proposal Category 📂</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="Governance">Governance ⚖️</option>
                      <option value="Tech Stack">Tech Stack 💻</option>
                      <option value="Protocol">Protocol 🧬</option>
                      <option value="Community">Community 🤝</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Proposal Description / Background Detail 📜</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide a detailed explanation of your proposal. Why is it important? What is the expected timeline or outcome?"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                {/* Poll Options Repeater */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Voting Options 📊</label>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Option
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {newOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                        {newOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="text-red-500 hover:text-red-700 font-bold p-1 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Voting Duration ⏳</label>
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="3">3 Days</option>
                      <option value="7">7 Days (Default)</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Meta Tags 🏷️</label>
                    <input
                      type="text"
                      placeholder="e.g., SCF, Security, Audit (comma separated)"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-md shadow-primary/20"
                  >
                    Publish Proposal
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Filtering Controls */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
          
          {/* Categories Horizontal Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-md shadow-primary/10'
                    : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar and tabs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none sm:w-64"
              />
            </div>

            {/* Segmented active/closed tab selector */}
            <div className="flex rounded-xl border border-border bg-card p-1">
              {(['all', 'active', 'closed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Proposals Feed Grid */}
        {filteredPolls.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-16 text-center"
          >
            <div className="rounded-full bg-muted p-4 text-muted-foreground">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">No proposals found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              We couldn&apos;t find any proposals matching your filters. Try clearing search or category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setActiveTab('all');
              }}
              className="mt-6 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredPolls.map((poll) => {
                const totalVotes = poll.totalVotes;
                const timeRemaining = getRemainingTime(poll.endsAt, poll.status, currentTime);
                const hasVoted = publicKey ? !!poll.voters[publicKey] : false;

                return (
                  <motion.div
                    key={poll.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 transition-all hover:shadow-md cursor-pointer relative"
                    id={`poll-card-${poll.id}`}
                  >
                    {/* Top Meta info */}
                    <Link href={`/poll/${poll.id}`} className="absolute inset-0 z-0" aria-label={`View poll ${poll.question}`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          poll.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {poll.status}
                        </span>
                        
                        <span className="text-[10px] font-semibold text-muted-foreground font-mono">
                          Category: {poll.category}
                        </span>
                      </div>

                      {/* Question */}
                      <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 mb-2">
                        {poll.question}
                      </h3>

                      {/* Description preview */}
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                        {poll.description}
                      </p>
                    </div>

                    {/* Bottom stats and meta */}
                    <div className="relative z-10 mt-auto border-t border-border pt-4">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {poll.tags.map(tag => (
                          <span key={tag} className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3.5 w-3.5 text-primary" />
                          <span className="font-semibold text-foreground font-mono">{totalVotes}</span> votes
                        </div>

                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className={poll.status === 'active' ? 'text-primary font-medium' : 'text-muted-foreground'}>
                            {timeRemaining}
                          </span>
                        </div>
                      </div>

                      {/* Voter status flag overlay indicator */}
                      {hasVoted && (
                        <div className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-green-500/10 py-1.5 text-[10px] font-bold text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>YOU VOTED ON-CHAIN</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
