import { Poll } from '../types';
import { motion } from 'motion/react';
import { Calendar, Award, BarChart3, Users, Clock } from 'lucide-react';

interface PollCardProps {
  key?: string;
  poll: Poll;
  currentTime: number | null;
  onClick: () => void;
}

export default function PollCard({ poll, currentTime, onClick }: PollCardProps) {
  // Helper to compute remaining time elegantly
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Governance': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Tech Stack': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Protocol': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Community': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
    }
  };

  const isClosed = poll.status === 'closed' || getRemainingTime() === 'Ended';

  // Find leading option to show a crown or special check
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const leadingOptionId = poll.totalVotes > 0 ? sortedOptions[0].id : null;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40 p-5 sm:p-6 transition-all duration-300 hover:bg-neutral-900/70 hover:border-cyan-500/30"
    >
      {/* Background glow overlay on card hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-cyan-500/0 via-blue-500/0 to-indigo-500/0 opacity-0 transition-opacity duration-500 group-hover:from-cyan-500/5 group-hover:to-indigo-500/5 group-hover:opacity-100" />

      <div className="relative flex flex-col justify-between h-full gap-4">
        {/* Card Header Info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Category */}
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryColor(poll.category)}`}>
              {poll.category}
            </span>

            {/* Status countdown */}
            <div className={`flex items-center gap-1.5 text-xs font-mono ${isClosed ? 'text-neutral-500' : 'text-cyan-400 font-semibold'}`}>
              <Clock className="h-3 w-3" />
              <span>{getRemainingTime()}</span>
            </div>
          </div>

          {/* Proposal Title */}
          <h3 className="text-base sm:text-lg font-bold text-neutral-100 group-hover:text-cyan-300 transition-colors tracking-tight line-clamp-1.5 leading-snug mt-1">
            {poll.title}
          </h3>

          {/* Proposal Description snippet */}
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mt-1">
            {poll.description}
          </p>
        </div>

        {/* Dynamic Vote Results snippet */}
        <div className="space-y-2 mt-2">
          {poll.options.slice(0, 2).map((opt) => {
            const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
            const isLeading = opt.id === leadingOptionId && poll.totalVotes > 0;
            return (
              <div key={opt.id} className="space-y-1">
                <div className="flex justify-between text-xs text-neutral-300 font-mono">
                  <span className="flex items-center gap-1 truncate max-w-[80%]">
                    {opt.text}
                    {isLeading && <span title="Leading Option" className="text-amber-400">👑</span>}
                  </span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLeading ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-neutral-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {poll.options.length > 2 && (
            <p className="text-[10px] font-mono text-neutral-500 text-right">
              + {poll.options.length - 2} other options
            </p>
          )}
        </div>

        {/* Card Footer metadata */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-mono text-neutral-400 flex-wrap gap-2 mt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-neutral-500" />
              <span>{poll.totalVotes} voters</span>
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-neutral-500" />
              <span>{(poll.totalXlmWeight / 1000).toFixed(1)}k XLM weight</span>
            </span>
          </div>

          <span className="text-[10px] text-neutral-500 truncate max-w-[120px]" title={`Creator: ${poll.creator}`}>
            by {poll.creator.substring(0, 6)}...
          </span>
        </div>
      </div>
    </motion.div>
  );
}
