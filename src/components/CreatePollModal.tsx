import { useState, FormEvent } from 'react';
import { PollStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPollId: string) => void;
}

export default function CreatePollModal({ isOpen, onClose, onSuccess }: CreatePollModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Governance' | 'Tech Stack' | 'Protocol' | 'Community'>('Governance');
  const [duration, setDuration] = useState(7);
  const [options, setOptions] = useState<string[]>(['Approve Proposal', 'Reject Proposal']);
  const [tags, setTags] = useState('');
  
  // Deployment simulation states
  const [deployStep, setDeployStep] = useState<'idle' | 'validating' | 'compiling' | 'submitting' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOpts = [...options];
      newOpts.splice(index, 1);
      setOptions(newOpts);
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const newOpts = [...options];
    newOpts[index] = val;
    setOptions(newOpts);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    
    const validOptions = options.map(o => o.trim()).filter(o => o.length > 0);
    if (validOptions.length < 2) {
      setError('At least two options are required');
      return;
    }

    const pubKey = PollStore.getPublicKey();
    if (!pubKey) {
      setError('Please connect your Stellar Wallet first in order to publish a proposal.');
      return;
    }

    // Begin simulated blockchain publishing
    try {
      setDeployStep('validating');
      await new Promise(r => setTimeout(r, 600));
      
      setDeployStep('compiling');
      await new Promise(r => setTimeout(r, 800));
      
      setDeployStep('submitting');
      await new Promise(r => setTimeout(r, 1000));

      const newId = PollStore.createPoll(
        title,
        description,
        category,
        duration,
        validOptions,
        tags
      );

      setDeployStep('done');
      await new Promise(r => setTimeout(r, 500));
      
      // Complete! Reset form
      setTitle('');
      setDescription('');
      setCategory('Governance');
      setDuration(7);
      setOptions(['Approve Proposal', 'Reject Proposal']);
      setTags('');
      setDeployStep('idle');
      onSuccess(newId);
    } catch (err: any) {
      setError(err?.message || 'Transaction compilation failed.');
      setDeployStep('idle');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white font-sans tracking-tight">Create Proposal</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content / Form */}
            {deployStep !== 'idle' && deployStep !== 'done' ? (
              // Publishing Blockchain State
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center flex-1">
                <Loader2 className="h-12 w-12 text-cyan-500 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-white font-sans">
                  {deployStep === 'validating' && 'Validating Smart Signatures...'}
                  {deployStep === 'compiling' && 'Compiling Proposal XDR Metadata...'}
                  {deployStep === 'submitting' && 'Broadcasting Ledger Transaction...'}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-2 max-w-md">
                  {deployStep === 'validating' && 'Confirming account sequence, fee margins, and proposal validation keys on local sandbox.'}
                  {deployStep === 'compiling' && 'Packaging description text, choice indices, duration values, and tags into custom-formatted Soroban storage bytes.'}
                  {deployStep === 'submitting' && 'Broadcasting signed transaction envelopes to validator pools. Waiting for consensus validation ledger block confirmation.'}
                </p>
              </div>
            ) : (
              // Standard Form Fields
              <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-4 flex-1">
                {error && (
                  <div className="rounded-xl bg-red-950/20 border border-red-500/20 p-3 flex items-start gap-2.5 text-red-400 text-xs">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Proposal Title */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Proposal Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Transition Community Treasury to a Multi-Sig Vault"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500/40 focus:outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>

                {/* Category & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm focus:border-cyan-500/40 focus:outline-none transition-all"
                    >
                      <option value="Governance">Governance</option>
                      <option value="Tech Stack">Tech Stack</option>
                      <option value="Protocol">Protocol</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex justify-between">
                      <span>Duration</span>
                      <span className="text-cyan-400 font-bold">{duration} Days</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500 my-4"
                    />
                  </div>
                </div>

                {/* Proposal Description */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Detailed Proposal Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a comprehensive breakdown of the proposal, what it changes, and how it impacts the Stellar network community treasury and ecosystem."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500/40 focus:outline-none transition-all placeholder:text-neutral-600 resize-none"
                  />
                </div>

                {/* Options list */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                      Ballot Voting Choices
                    </label>
                    {options.length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-mono uppercase flex items-center gap-1 font-semibold"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Option</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="text-xs font-mono text-neutral-500 w-6">#{idx + 1}</div>
                        <input
                          type="text"
                          required
                          placeholder={`Option text ${idx + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500/40 focus:outline-none transition-all placeholder:text-neutral-600"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-neutral-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex justify-between">
                    <span>Tags</span>
                    <span className="text-[10px] text-neutral-500">Comma-separated values</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Multi-sig, Security, Treasury"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500/40 focus:outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-500/10 active:scale-95"
                  >
                    Broadcast Proposal
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
