import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Salad, Flame, MessageCircle, CheckCircle2, Camera } from 'lucide-react';
import api from '../api/client';

type Choice = true | false | null;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

function PillPair({
  label,
  icon: Icon,
  value,
  onChange,
  delay,
}: {
  label: string;
  icon: typeof Dumbbell;
  value: Choice;
  onChange: (v: boolean) => void;
  delay: number;
}) {
  return (
    <motion.div {...fadeUp(delay)} className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="glass rounded-lg p-1.5">
          <Icon size={18} className="text-violet-400" />
        </div>
        <span className="font-semibold text-white text-[15px]">{label}</span>
      </div>
      <div className="flex gap-3">
        {[true, false].map((opt) => (
          <motion.button
            key={String(opt)}
            onClick={() => onChange(opt)}
            whileTap={{ scale: 0.96 }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              value === opt
                ? opt
                  ? 'bg-emerald-500/30 border border-emerald-500/60 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]'
                : 'glass text-white/40 hover:text-white/70'
            }`}
          >
            {opt ? 'Yes' : 'No'}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ProgressDots({ workout, diet }: { workout: Choice; diet: Choice }) {
  const answered = (workout !== null ? 1 : 0) + (diet !== null ? 1 : 0);
  return (
    <div className="flex items-center justify-center gap-2 mt-5">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: i < answered ? 1 : 0.8,
            backgroundColor: i < answered ? 'rgba(139, 92, 246, 0.7)' : 'rgba(255, 255, 255, 0.1)',
          }}
          className="w-2 h-2 rounded-full"
        />
      ))}
      <span className="text-[11px] text-white/30 ml-1">{answered}/2</span>
    </div>
  );
}

function TodayDate() {
  const now = new Date();
  const formatted = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return (
    <p className="text-white/30 text-xs tracking-wide">{formatted}</p>
  );
}

export default function CheckIn() {
  const { clientId, token } = useParams<{ clientId: string; token: string }>();
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [streak, setStreak] = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [coachPhone, setCoachPhone] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [timeline, setTimeline] = useState<unknown[]>([]);
  const [workout, setWorkout] = useState<Choice>(null);
  const [diet, setDiet] = useState<Choice>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/checkin/${clientId}/${token}`)
      .then((r) => {
        setClientName(r.data.client_name);
        setStreak(r.data.streak);
        setAlreadyDone(r.data.already_checked_in);
        setCoachPhone(r.data.coach_phone || '');
        setBroadcastMessage(r.data.broadcast_message || '');
        setTimeline(r.data.timeline || []);
      })
      .catch(() => setError('Invalid or expired link.'))
      .finally(() => setLoading(false));
  }, [clientId, token]);

  const submit = async () => {
    if (workout === null || diet === null) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/checkin/${clientId}/${token}`, {
        workout_done: workout,
        diet_followed: diet,
        note: note || null,
      });
      const today = new Date().toISOString().split('T')[0];
      const updatedTimeline = [
        ...timeline.filter((d: any) => d.date !== today),
        { date: today, workout, diet },
      ].sort((a: any, b: any) => a.date.localeCompare(b.date));
      sessionStorage.setItem('checkin_timeline', JSON.stringify(updatedTimeline));
      navigate(`/checkin-success?streak=${data.streak}&name=${encodeURIComponent(clientName)}`);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    setPhotoUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post(`/api/checkin/${clientId}/${token}/photo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotoUploaded(true);
    } finally {
      setPhotoUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center client-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 flex flex-col items-center gap-3"
        >
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading your check-in...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 client-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-lg font-bold text-white mb-2">Oops!</h2>
          <p className="text-white/50 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 client-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
            className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle2 size={32} className="text-emerald-400" />
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-2">You're all set!</h2>
          <p className="text-white/50 text-sm">
            Already checked in today. Come back tomorrow, {clientName.split(' ')[0]}!
          </p>
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5 glass rounded-2xl p-3 inline-flex items-center gap-2"
            >
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <Flame size={20} className="text-orange-400" />
              </motion.div>
              <span className="text-orange-400 font-bold text-lg">{streak}</span>
              <span className="text-white/40 text-sm">day streak</span>
            </motion.div>
          )}
          <p className="text-white/25 text-xs mt-6">See you tomorrow! 💪</p>
        </motion.div>
      </div>
    );
  }

  const ready = workout !== null && diet !== null;

  return (
    <div className="min-h-dvh max-w-md mx-auto px-4 py-8 client-bg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Broadcast message */}
        <AnimatePresence>
          {broadcastMessage && (
            <motion.div
              {...fadeUp(0)}
              className="glass rounded-2xl p-4 mb-6 border-l-4 border-violet-500/60"
            >
              <p className="text-sm text-white/80">{broadcastMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div {...fadeUp(0.05)} className="text-center mb-8">
          <TodayDate />
          <h1 className="text-2xl font-bold text-white mt-2">
            Hey {clientName.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">How did today go?</p>
          {streak > 0 && (
            <motion.div
              {...fadeUp(0.15)}
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full glass text-sm"
            >
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <Flame size={15} className="text-orange-400" />
              </motion.div>
              <span className="text-orange-400 font-semibold">{streak}</span>
              <span className="text-white/35 text-xs">day streak</span>
            </motion.div>
          )}
        </motion.div>

        {/* Questions */}
        <div className="flex flex-col gap-3 mb-3">
          <PillPair label="Workout done?" icon={Dumbbell} value={workout} onChange={setWorkout} delay={0.1} />
          <PillPair label="Diet followed?" icon={Salad} value={diet} onChange={setDiet} delay={0.18} />
        </div>

        <ProgressDots workout={workout} diet={diet} />

        {/* Note */}
        <motion.div {...fadeUp(0.25)} className="glass rounded-2xl p-4 mt-4 mb-4">
          <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">
            Note (optional)
          </label>
          <textarea
            className="glass-input resize-none"
            rows={3}
            placeholder="How are you feeling? Any obstacles?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </motion.div>

        {/* Photo upload */}
        <motion.label
          {...fadeUp(0.3)}
          className={`glass rounded-2xl p-4 flex items-center gap-3 cursor-pointer mb-5 transition-colors ${
            photoUploaded
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'hover:bg-white/5'
          }`}
        >
          {photoUploaded ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <Camera size={18} className="text-violet-400" />
          )}
          <span className={`text-sm ${photoUploaded ? 'text-emerald-400' : 'text-white/60'}`}>
            {photoUploading
              ? 'Uploading...'
              : photoUploaded
              ? 'Photo uploaded!'
              : 'Add progress photo (optional)'}
          </span>
          {!photoUploaded && (
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
            />
          )}
        </motion.label>

        {/* Submit */}
        <motion.div {...fadeUp(0.35)}>
          <motion.button
            onClick={submit}
            disabled={!ready || submitting}
            whileTap={ready && !submitting ? { scale: 0.98 } : undefined}
            className="btn-primary"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit Check-In'
            )}
          </motion.button>

          <AnimatePresence>
            {!ready && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-center text-xs text-white/30 mt-3"
              >
                Answer both questions to continue
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* WhatsApp */}
        {coachPhone && (
          <motion.a
            {...fadeUp(0.4)}
            href={`https://wa.me/${coachPhone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-colors"
          >
            <MessageCircle size={16} />
            Message your coach on WhatsApp
          </motion.a>
        )}
      </motion.div>
    </div>
  );
}
