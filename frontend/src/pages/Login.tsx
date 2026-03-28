import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Dither from '../components/Dither';

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      toast('Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* FULLSCREEN DITHER BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <Dither
          waveColor={[0.55, 0.2, 0.85]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.2}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>

      {/* CONTENT CONTAINER */}
      <div className="max-w-md mx-auto flex flex-col min-h-screen">

        {/* Hero spacer */}
        <div className="flex-1 min-h-[38vh]" />

        {/* Brand */}
        <motion.div {...fade(0.3)} className="px-6 mb-6 relative z-10">
          <h1 className="text-3xl font-bold text-white">Abhyaas</h1>
          <p className="text-white/60 text-sm mt-1">
            Sign in to your coaching dashboard
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={submit}
          className="flex flex-col gap-5 px-6 pb-6 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <motion.div {...fade(0.35)}>
            <label className="text-xs text-white/60 uppercase tracking-wider mb-2 block">
              Email
            </label>
            <input
              type="email"
              className="glass-input"
              placeholder="coach@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <motion.div {...fade(0.4)}>
            <label className="text-xs text-white/60 uppercase tracking-wider mb-2 block">
              Password
            </label>
            <input
              type="password"
              className="glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </motion.div>

          <motion.button
            {...fade(0.45)}
            type="submit"
            disabled={loading}
            whileTap={!loading ? { scale: 0.98 } : undefined}
            className="btn-primary mt-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Bottom link */}
        <motion.div {...fade(0.5)} className="pb-10 pt-2 px-6 relative z-10">
          <p className="text-center text-white/55 text-sm">
            New coach?{' '}
            <Link
              to="/register"
              className="text-violet-400 font-medium hover:text-violet-300 transition-colors"
            >
              Create account
            </Link>
          </p>
        </motion.div>

      </div>
    </div>
  );
}

