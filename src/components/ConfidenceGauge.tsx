import { motion } from 'framer-motion';

interface ConfidenceGaugeProps {
  score: number;
}

const ConfidenceGauge = ({ score }: ConfidenceGaugeProps) => {
  const percentage = Math.round(score * 100);
  const colorClass = score > 0.9 ? 'text-success' : score > 0.7 ? 'text-warning' : 'text-destructive';
  const label = score > 0.9 ? 'High confidence' : score > 0.7 ? 'Moderate confidence' : 'Low confidence';

  return (
    <div className="flex items-center gap-4 surface-card ring-surface p-4">
      <div className="relative h-16 w-16 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
          <path
            className="stroke-muted"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <motion.path
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${percentage}, 100` }}
            transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
            className={`${colorClass} stroke-current`}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold">
          {percentage}%
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">AI Confidence</p>
        <p className="text-sm text-secondary-foreground">{label}</p>
      </div>
    </div>
  );
};

export default ConfidenceGauge;
