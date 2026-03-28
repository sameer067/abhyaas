import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Flame, MessageCircle } from 'lucide-react';
import api from '../api/client';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../lib/utils';

import { type ClientSummary } from '../lib/types';
type Client = ClientSummary;

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/clients').then((r) => setClients(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <h1 className="text-xl font-bold text-white mb-4">Clients</h1>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          className="glass-input pl-10"
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-white/40 mt-16">
          {search ? 'No clients match your search' : 'No clients yet — add one!'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard
                className="p-4"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{client.name}</p>
                      {client.streak > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-orange-400">
                          <Flame size={12} />
                          {client.streak}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      Last: {formatDate(client.last_checkin)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {client.phone && (
                      <a
                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      >
                        <MessageCircle size={16} />
                      </a>
                    )}
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={client.status} />
                      <div className="flex gap-2 text-xs">
                        <span className="text-violet-400">🏋️ {client.c7d.workout}%</span>
                        <span className="text-emerald-400">🥗 {client.c7d.diet}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
