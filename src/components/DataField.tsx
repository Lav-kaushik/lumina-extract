import { useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

interface DataFieldProps {
  label: string;
  value: any;
  isAiSuggested?: boolean;
}

const MAX_VISIBLE_ITEMS = 3;

const formatValue = (value: any): string | string[] => {
  if (value === null || value === undefined || value === '') return 'Not Found';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length === 0 ? 'Not Found' : value.map(String);
    }
    return JSON.stringify(value);
  }
  return String(value);
};

const DataField = ({ label, value, isAiSuggested = false }: DataFieldProps) => {
  const [expanded, setExpanded] = useState(false);
  const formatted = formatValue(value);
  const isArray = Array.isArray(formatted);
  const isMissing = formatted === 'Not Found';

  const visibleItems = isArray
    ? expanded ? formatted : formatted.slice(0, MAX_VISIBLE_ITEMS)
    : null;
  const hasMore = isArray && formatted.length > MAX_VISIBLE_ITEMS;

  return (
    <div className="flex items-start gap-3 py-2">
      {/* Key box */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 min-w-[180px] shrink-0">
        <span className="text-base font-semibold text-primary capitalize">
          {label.replace(/_/g, ' ')}
        </span>
        {isAiSuggested && <Sparkles className="w-4 h-4 text-primary" />}
      </div>

      {/* Value box */}
      <div className="flex-1 px-4 py-3 rounded-xl bg-muted/60 ring-surface">
        {isArray ? (
          <div className="space-y-1">
            {visibleItems!.map((item, i) => (
              <span key={i} className="block text-base font-mono font-semibold text-foreground">
                {item}
              </span>
            ))}
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mt-1"
              >
                {expanded ? 'Show less' : `+${formatted.length - MAX_VISIBLE_ITEMS} more`}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        ) : (
          <span className={`text-base font-mono font-semibold ${isMissing ? 'text-muted-foreground italic' : 'text-foreground'}`}>
            {formatted}
          </span>
        )}
      </div>
    </div>
  );
};

export default DataField;
