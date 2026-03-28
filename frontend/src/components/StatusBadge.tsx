import { getStatusColor } from '../lib/utils';

interface Props {
  status: string | undefined;
}

export default function StatusBadge({ status }: Props) {
  if (!status) return null;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}
