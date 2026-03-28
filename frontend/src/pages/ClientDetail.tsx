import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Check, X, Minus, Trash2, MessageCircle, Copy, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import ComplianceBar from '../components/ComplianceBar';
import { useToast } from '../components/Toast';
import { type ClientSummary, type ComplianceBlock } from '../lib/types';

interface TimelineEntry {
  date: string;
  workout: boolean | null;
  diet: boolean | null;
  status: string;
  note: string | null;
}

type Preset = '7d' | '30d' | 'all' | 'custom';

const PRESETS: { key: Preset; label: string }[] = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: 'all', label: 'All' },
  { key: 'custom', label: 'Custom' },
];

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function DayDot({ entry }: { entry: TimelineEntry }) {
  const d = new Date(entry.date);
  if (entry.status === 'missing') return <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/30">{DOW[d.getDay()]}</div>;
  if (entry.status === 'success') return <div className="w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center"><Check size={14} className="text-emerald-400" /></div>;
  if (entry.status === 'partial') return <div className="w-8 h-8 rounded-full bg-amber-500/25 border border-amber-500/40 flex items-center justify-center"><Minus size={14} className="text-amber-400" /></div>;
  return <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center"><X size={14} className="text-red-400" /></div>;
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<ClientSummary | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [notes, setNotes] = useState<{ date: string; note: string }[]>([]);
  const [photos, setPhotos] = useState<{ id: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [preset, setPreset] = useState<Preset>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/api/clients/${id}`),
      api.get(`/api/clients/${id}/timeline`),
      api.get(`/api/clients/${id}/photos`),
    ]).then(([c, t, p]) => {
      setClient(c.data);
      setTimeline(t.data.timeline);
      setNotes(t.data.notes);
      setPhotos(p.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const activeBlock = (): ComplianceBlock | null => {
    if (!client) return null;
    if (preset === '7d') return client.c7d;
    if (preset === '30d') return client.c30d;
    if (preset === 'custom') return client.c_custom ?? null;
    return client.c_all;
  };

  const applyCustom = async (e: FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) return;
    setCustomLoading(true);
    const res = await api.get(`/api/clients/${id}?from_date=${fromDate}&to_date=${toDate}`);
    setClient(res.data);
    setCustomLoading(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(client!.magic_link);
    setCopied(true);
    toast('Check-in link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteClient = async () => {
    if (!confirm(`Delete ${client?.name}? This cannot be undone.`)) return;
    await api.delete(`/api/clients/${id}`);
    toast(`${client?.name} removed`);
    navigate('/clients');
  };

  const chartData = timeline
    .filter((e) => e.status !== 'missing')
    .map((e) => ({
      date: e.date.slice(5),
      score: e.status === 'success' ? 100 : e.status === 'partial' ? 50 : 0,
    }));

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-20 animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  if (!client) return null;

  const block = activeBlock();

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="glass rounded-xl p-2 text-white/60 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className={`glass rounded-xl p-2 transition-colors ${copied ? 'text-emerald-400' : 'text-white/60 hover:text-white'}`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button onClick={deleteClient} className="glass rounded-xl p-2 text-red-400/60 hover:text-red-400">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">{client.name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <StatusBadge status={client.status} />
          {client.streak > 0 && (
            <span className="flex items-center gap-1 text-sm text-orange-400 font-semibold">
              <Flame size={16} />
              {client.streak} day streak
            </span>
          )}
        </div>
        {client.phone && (
          <a
            href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/30 transition-colors"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        )}
      </div>

      {/* Period filter */}
      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          {PRESETS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                preset === key
                  ? 'bg-violet-500/30 border border-violet-500/60 text-violet-300'
                  : 'glass text-white/40 hover:text-white/70'
              }`}
            >
              {key === 'custom' ? <Calendar size={14} className="mx-auto" /> : label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <form onSubmit={applyCustom} className="flex gap-2 items-end mb-3">
            <div className="flex-1">
              <label className="text-xs text-white/40 mb-1 block">From</label>
              <input
                type="date"
                className="glass-input py-2 text-sm"
                value={fromDate}
                min={client.created_at.split('T')[0]}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-white/40 mb-1 block">To</label>
              <input
                type="date"
                className="glass-input py-2 text-sm"
                value={toDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={customLoading}
              className="bg-violet-500/30 border border-violet-500/60 text-violet-300 px-3 py-2 rounded-xl text-sm font-semibold"
            >
              {customLoading ? '…' : 'Apply'}
            </button>
          </form>
        )}
      </div>

      {(client.goal || client.weight_kg || client.height_feet) && (
        <GlassCard className="p-4 mb-4">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Client Info</p>
          <div className="flex flex-wrap gap-4">
            {client.goal && (
              <div>
                <p className="text-xs text-white/40">Goal</p>
                <p className="text-sm text-white font-medium">{client.goal}</p>
              </div>
            )}
            {client.weight_kg && (
              <div>
                <p className="text-xs text-white/40">Weight</p>
                <p className="text-sm text-white font-medium">{client.weight_kg} kg</p>
              </div>
            )}
            {client.height_feet && (
              <div>
                <p className="text-xs text-white/40">Height</p>
                <p className="text-sm text-white font-medium">{client.height_feet} ft</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {block && <div className="mb-4"><ComplianceBar data={block} /></div>}

      {chartData.length > 2 && (
        <GlassCard className="p-4 mb-4">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Trend (last 30 days)</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,15,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
              />
              <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      <GlassCard className="p-4 mb-4">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Last 7 days</p>
        <div className="flex gap-2 flex-wrap">
          {timeline.slice(-7).map((entry) => (
            <DayDot key={entry.date} entry={entry} />
          ))}
        </div>
      </GlassCard>

      {photos.length > 0 && (
        <GlassCard className="p-4 mb-4">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Progress photos</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((p) => (
              <img key={p.id} src={p.image_url} alt="Progress" className="w-20 h-20 rounded-xl object-cover shrink-0" />
            ))}
          </div>
        </GlassCard>
      )}

      {notes.length > 0 && (
        <GlassCard className="p-4">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Notes</p>
          <div className="flex flex-col gap-3">
            {notes.map((n) => (
              <div key={n.date} className="glass rounded-xl p-3">
                <p className="text-xs text-white/40 mb-1">{n.date}</p>
                <p className="text-sm text-white/80">{n.note}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </Layout>
  );
}
