import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2 } from 'lucide-react';

interface CheckInDot {
  date: string;
  workout: boolean | null;
  diet: boolean | null;
}

const MESSAGES = [
  'Consistency beats perfection.',
  'One day at a time.',
  'Small steps, big results.',
  'You showed up today. That matters.',
  'Progress, not perfection.',
  'Your future self will thank you.',
];

function dotColor(dot: CheckInDot) {
  if (dot.workout === null && dot.diet === null) return 'bg-white/[0.07]';
  if (dot.workout && dot.diet) return 'bg-violet-500';
  if (dot.workout) return 'bg-violet-500/45';
  if (dot.diet) return 'bg-emerald-500/45';
  return 'bg-red-500/25';
}

function ActivityGrid({ timeline }: { timeline: CheckInDot[] }) {
  if (timeline.length === 0) return null;
  const startDay = new Date(timeline[0].date + 'T00:00:00').getDay();
  const padded: (CheckInDot | null)[] = [...Array(startDay).fill(null), ...timeline];
  const weeks: (CheckInDot | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
  const last = weeks[weeks.length - 1];
  while (last.length < 7) last.push(null);

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((dot, di) => (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + (wi * 7 + di) * 0.003, duration: 0.2 }}
                  className={`w-[11px] h-[11px] rounded-[2px] ${dot ? dotColor(dot) : 'bg-transparent'}`}
                  title={dot?.date ?? ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 text-[10px] text-white/35">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-violet-500 inline-block" /> Both</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-violet-500/45 inline-block" /> Workout</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500/45 inline-block" /> Diet</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-red-500/25 inline-block" /> Missed</span>
      </div>
    </div>
  );
}

export default function CheckInSuccess() {
  const [params] = useSearchParams();
  const streak = parseInt(params.get('streak') || '0');
  const name = params.get('name') || 'there';
  const [timeline, setTimeline] = useState<CheckInDot[]>([]);
  const [motivationalMsg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  useEffect(() => {
    const raw = sessionStorage.getItem('checkin_timeline');
    if (raw) {
      try {
        setTimeline(JSON.parse(raw));
        sessionStorage.removeItem('checkin_timeline');
      } catch { /* ignore */ }
    }
  }, []);

  return (
    <div className="min-h-dvh max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center client-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="glass rounded-3xl p-10 text-center w-full mb-4"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
          className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 size={40} className="text-emerald-400" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Great work, {name.split(' ')[0]}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-white/50 text-sm mb-6"
        >
          Your check-in has been recorded.
        </motion.p>

        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-4 flex items-center justify-center gap-3"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Flame size={28} className="text-orange-400" />
            </motion.div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{streak}</p>
              <p className="text-xs text-white/40">day streak</p>
            </div>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-white/25 text-xs mt-8 italic"
        >
          "{motivationalMsg}"
        </motion.p>
      </motion.div>

      {timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-4 w-full"
        >
          <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Your activity</p>
          <ActivityGrid timeline={timeline} />
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-white/20 text-xs mt-6"
      >
        See you tomorrow! 💪
      </motion.p>
    </div>
  );
}
