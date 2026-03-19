import { Sparkles } from 'lucide-react';

interface DataFieldProps {
  label: string;
  value: any;
  isAiSuggested?: boolean;
}

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return 'Not Found';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length === 0 ? 'Not Found' : value.join(', ');
    }
    return JSON.stringify(value);
  }
  return String(value);
};

const DataField = ({ label, value, isAiSuggested = false }: DataFieldProps) => {
  const displayValue = formatValue(value);
  const isMissing = displayValue === 'Not Found';

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/50 ring-surface hover:ring-surface-hover transition-all duration-200">
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-muted-foreground capitalize">
          {label.replace(/_/g, ' ')}
        </span>
        {isAiSuggested && <Sparkles className="w-4 h-4 text-primary" />}
      </div>
      <span className={`text-base font-mono font-semibold ${isMissing ? 'text-muted-foreground italic' : 'text-foreground'}`}>
        {displayValue}
      </span>
    </div>
  );
};

export default DataField;
