import { type ComplianceBlock } from '../lib/types';

interface Props {
  data: ComplianceBlock;
  label?: string;
}

export default function ComplianceBar({ data, label }: Props) {
  return (
    <div className="glass rounded-2xl p-4">
      {label && <p className="text-xs text-white/40 uppercase tracking-wider mb-3">{label}</p>}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-3xl font-bold text-white">{data.overall}%</p>
          <p className="text-xs text-white/40 mt-0.5">overall</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/50">🏋️ Workout</span>
            <span className="text-violet-400 font-semibold">{data.workout}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${data.workout}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/50">🥗 Meals</span>
            <span className="text-emerald-400 font-semibold">{data.diet}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${data.diet}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
