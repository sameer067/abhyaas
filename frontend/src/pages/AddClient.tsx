import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, UserPlus } from 'lucide-react';
import api from '../api/client';
import Layout from '../components/Layout';
import { useToast } from '../components/Toast';

export default function AddClient() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLink, setMagicLink] = useState('');
  const [copied, setCopied] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/clients', {
        name,
        phone: phone || null,
        goal: goal || null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        height_feet: heightFeet ? parseFloat(heightFeet) : null,
      });
      setMagicLink(data.magic_link);
      toast(`${data.name} added successfully!`);
      setName('');
      setPhone('');
      setGoal('');
      setWeightKg('');
      setHeightFeet('');
    } catch (err: any) {
      toast(err?.response?.data?.detail || 'Failed to add client', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(magicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast('Link copied!');
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold text-white mb-6">Add Client</h1>

      <div className="glass rounded-3xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="glass rounded-xl p-2.5 purple-glow">
            <UserPlus size={20} className="text-violet-400" />
          </div>
          <p className="text-white/60 text-sm">Enter client details to generate their check-in link</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Client Name *</label>
            <input
              type="text"
              className="glass-input"
              placeholder="Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Whatsapp Number (optional)</label>
            <input
              type="tel"
              className="glass-input"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Goal (optional)</label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g. Weight loss, Build muscle"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="glass-input"
                placeholder="72.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Height (ft)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="glass-input"
                placeholder="5.8"
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? 'Adding…' : 'Add Client & Generate Link'}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {magicLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass rounded-3xl p-6"
          >
            <p className="text-sm font-semibold text-white mb-2">Check-in link ready!</p>
            <p className="text-xs text-white/50 mb-4">
              Send this link to your client. They can check in daily without logging in.
            </p>
            <div className="glass rounded-xl p-3 mb-3 break-all text-xs text-violet-300 font-mono">
              {magicLink}
            </div>
            <button
              onClick={copy}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all ${copied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'btn-primary'
                }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
