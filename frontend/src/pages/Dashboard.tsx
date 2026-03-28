import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, XCircle, Moon, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { formatDate, getGreeting } from '../lib/utils';
import { type ClientSummary, type ComplianceBlock } from '../lib/types';

interface Summary {
  total_clients: number;
  on_track: number;
  needs_attention: number;
  at_risk: number;
  inactive: number;
}

type Preset = '7d' | '14d' | '30d' | 'custom';

const PRESETS: { key: Preset; label: string }[] = [
  { key: '7d', label: '7d' },
  { key: '14d', label: '14d' },
  { key: '30d', label: '30d' },
  { key: 'custom', label: 'Custom' },
];

function presetBlock(client: ClientSummary, preset: Preset): ComplianceBlock {
  if (preset === '14d') return client.c14d;
  if (preset === '30d') return client.c30d;
  if (preset === 'custom') return client.c_custom ?? client.c7d;
  return client.c7d;
}

const statCards = [
  { key: 'on_track', label: 'On Track', icon: TrendingUp, color: 'text-emerald-400' },
  { key: 'needs_attention', label: 'Needs Attention', icon: AlertTriangle, color: 'text-amber-400' },
  { key: 'at_risk', label: 'At Risk', icon: XCircle, color: 'text-red-400' },
  { key: 'inactive', label: 'Inactive', icon: Moon, color: 'text-slate-400' },
];

export default function Dashboard() {
  const { coach, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<Preset>('7d');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [customLoading, setCustomLoading] = useState(false);

  const fetchClients = async (params?: { from_date: string; to_date: string }) => {
    const url = params
      ? `/api/clients?from_date=${params.from_date}&to_date=${params.to_date}`
      : '/api/clients';
    const res = await api.get(url);
    setClients(res.data);
  };

  useEffect(() => {
    Promise.all([
      api.get('/api/dashboard/summary'),
      api.get('/api/clients'),
    ]).then(([s, c]) => {
      setSummary(s.data);
      setClients(c.data);
    }).finally(() => setLoading(false));
  }, []);

  const applyCustom = async (e: FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) return;
    setCustomLoading(true);
    await fetchClients({ from_date: fromDate, to_date: toDate });
    setCustomLoading(false);
  };

  const needsAttention = clients.filter(
    (c) => c.status === 'Needs Attention' || c.status === 'At Risk' || c.status === 'Inactive'
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/50 text-sm">{getGreeting()},</p>
          <h1 className="text-xl font-bold text-white">Coach {coach?.name?.split(' ')[0]}</h1>
        </div>
        <button onClick={logout} className="glass rounded-xl p-2 text-white/40 hover:text-white/70 transition-colors">
          <LogOut size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {statCards.map(({ key, label, icon: Icon, color }) => (
              <GlassCard key={key} className="p-4">
                <Icon size={20} className={`${color} mb-2`} />
                <p className="text-2xl font-bold text-white">{(summary as any)?.[key] ?? 0}</p>
                <p className="text-xs text-white/50">{label}</p>
              </GlassCard>
            ))}
          </div>

          <div className="glass rounded-2xl p-4 mb-4">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Total clients</p>
            <p className="text-3xl font-bold text-white">{summary?.total_clients ?? 0}</p>
          </div>

          {/* Timeframe selector */}
          <div className="mb-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Compliance period</p>
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
              <form onSubmit={applyCustom} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">From</label>
                  <input
                    type="date"
                    className="glass-input py-2 text-sm"
                    value={fromDate}
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
                  className="bg-violet-500/30 border border-violet-500/60 text-violet-300 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
                >
                  {customLoading ? '…' : 'Apply'}
                </button>
              </form>
            )}
          </div>

          {needsAttention.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                Needs Attention
              </h2>
              <div className="flex flex-col gap-3">
                {needsAttention.map((client, i) => {
                  const block = presetBlock(client, preset);
                  return (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <GlassCard className="p-4" onClick={() => navigate(`/clients/${client.id}`)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white">{client.name}</p>
                            <p className="text-xs text-white/40 mt-0.5">
                              Last: {formatDate(client.last_checkin)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <StatusBadge status={client.status} />
                            <div className="flex gap-2 text-xs">
                              <span className="text-violet-400">🏋️ {block.workout}%</span>
                              <span className="text-emerald-400">🥗 {block.diet}%</span>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
}
