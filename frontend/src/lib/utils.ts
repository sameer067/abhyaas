export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function getStatusColor(status: string | undefined): string {
  switch (status) {
    case 'On Track': return 'text-emerald-400 bg-emerald-400/15 border-emerald-400/30';
    case 'Needs Attention': return 'text-amber-400 bg-amber-400/15 border-amber-400/30';
    case 'At Risk': return 'text-red-400 bg-red-400/15 border-red-400/30';
    case 'Inactive': return 'text-slate-400 bg-slate-400/15 border-slate-400/30';
    default: return 'text-slate-400 bg-slate-400/15 border-slate-400/30';
  }
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
