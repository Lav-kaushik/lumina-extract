import { motion } from 'framer-motion';
import { Database, Sparkles, CheckCircle2, Plus, RefreshCcw, ChevronDown } from 'lucide-react';
import ConfidenceGauge from './ConfidenceGauge';
import DataField from './DataField';
import { useState } from 'react';

interface ExtractionData {
  thread_id: string;
  file_name: string;
  extracted_data: Record<string, any>;
  suggested_additional_data: Record<string, any>;
  template: Record<string, string>;
  confidence: number;
}

interface ResultsStageProps {
  data: ExtractionData;
  additionalData: Record<string, any> | null;
  stage: 2 | 3;
  onExtractMore: () => void;
  onStartOver: () => void;
}

const ResultsStage = ({ data, additionalData, stage, onExtractMore, onStartOver }: ResultsStageProps) => {
  const [showTemplate, setShowTemplate] = useState(false);

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <ConfidenceGauge score={data.confidence} />
        {stage === 2 ? (
          <button
            onClick={onExtractMore}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all glow-indigo active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Extract More Data
          </button>
        ) : (
          <button
            onClick={onStartOver}
            className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-surface-hover text-secondary-foreground rounded-xl font-bold text-sm transition-all ring-surface"
          >
            <RefreshCcw className="w-4 h-4" />
            Start New
          </button>
        )}
      </div>

      {/* Stage 2: Initial extraction results */}
      {stage === 2 && (
        <>
          <section>
            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-primary/30 to-accent/30">
              <div className="bg-background rounded-[15px] p-6">
                <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5" /> Core Extracted Entities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(data.extracted_data).map(([k, v]) => (
                    <DataField key={k} label={k} value={v} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20">
              <div className="bg-background rounded-[15px] p-6">
                <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> AI Suggested Context
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(data.suggested_additional_data).map(([k, v]) => (
                    <DataField key={k} label={k} value={v} isAiSuggested />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <button
              onClick={() => setShowTemplate(!showTemplate)}
              className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-colors"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showTemplate ? 'rotate-180' : ''}`} />
              View Schema Template
            </button>
            {showTemplate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 bg-muted/30 rounded-xl p-4 ring-surface overflow-hidden"
              >
                <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
                  {JSON.stringify(data.template, null, 2)}
                </pre>
              </motion.div>
            )}
          </section>
        </>
      )

      {/* Deep extraction results */}
      {stage === 3 && additionalData && (
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
        >
          <div className="p-[1px] rounded-2xl bg-gradient-to-r from-success/30 to-primary/30">
            <div className="bg-background rounded-[15px] p-6">
              <h3 className="text-[11px] font-bold text-success uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deep Extraction Results
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(additionalData).map(([k, v]) => (
                  <DataField key={k} label={k} value={v} />
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};

export default ResultsStage;
