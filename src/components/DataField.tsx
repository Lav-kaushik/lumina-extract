import { Sparkles } from 'lucide-react';

interface DataFieldProps {
  label: string;
  value: any;
  isAiSuggested?: boolean;
}

const DataField = ({ label, value, isAiSuggested = false }: DataFieldProps) => (
  <div className="group relative bg-muted/50 p-4 rounded-xl ring-surface hover:ring-surface-hover transition-all duration-200">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
        {label.replace(/_/g, ' ')}
      </span>
      {isAiSuggested && <Sparkles className="w-3 h-3 text-primary" />}
    </div>
    <div className="text-sm font-medium text-foreground font-mono">
      {typeof value === 'object' ? (Array.isArray(value) ? value.join(', ') : JSON.stringify(value, null, 2)) : String(value)}
    </div>
  </div>
);

export default DataField;
