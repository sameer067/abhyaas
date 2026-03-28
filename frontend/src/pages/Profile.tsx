import { useState, type FormEvent } from 'react';
import { LogOut, User, Phone, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';

export default function Profile() {
  const { coach, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(coach?.name || '');
  const [phone, setPhone] = useState(coach?.phone || '');
  const [broadcastMessage, setBroadcastMessage] = useState(coach?.broadcast_message || '');
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        phone: phone || '',
        broadcast_message: broadcastMessage || '',
      });
      toast('Profile updated!');
    } catch {
      toast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <div
          onClick={logout}
          className="glass rounded-xl p-2 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <User size={18} className="text-violet-400" />
            <span className="text-sm font-semibold text-white">Basic Info</span>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Name</label>
              <input
                type="text"
                className="glass-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Email</label>
              <input
                type="email"
                className="glass-input opacity-50"
                value={coach?.email || ''}
                disabled
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Phone size={18} className="text-emerald-400" />
            <span className="text-sm font-semibold text-white">WhatsApp Number</span>
          </div>
          <p className="text-xs text-white/40 mb-3">
            Your clients will see a button to message you on WhatsApp. Include country code.
          </p>
          <input
            type="tel"
            className="glass-input"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Megaphone size={18} className="text-amber-400" />
            <span className="text-sm font-semibold text-white">Broadcast Message</span>
          </div>
          <p className="text-xs text-white/40 mb-3">
            This message is shown to all your clients on their check-in page. Use it for announcements, motivation, or reminders.
          </p>
          <textarea
            className="glass-input resize-none"
            rows={3}
            placeholder="e.g. No cheat meals this week! Stay strong 💪"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
          />
        </GlassCard>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </Layout>
  );
}
