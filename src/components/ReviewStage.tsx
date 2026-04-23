import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3, CheckCircle, LayoutTemplate, MessageSquareText,
  Tag, Hash, ChevronDown, RefreshCw, Loader2, Zap,
} from 'lucide-react';
import DataField from './DataField';
import ConfidenceGauge from './ConfidenceGauge';

interface PreviewData {
  extracted_additional_data: Record<string, any>;
  additonal_extracted_info: string | null;
  confidence: number;
}

interface ReviewStageProps {
  /** Current staged template (field → type) */
  stagedTemplate: Record<string, string>;
  /** Latest preview extraction result from the LLM */
  previewData: PreviewData;
  /** Additional prompt the user entered */
  additionalPrompt: string;
  /** True while a preview re-run is in flight */
  isLoading?: boolean;
  onEdit: () => void;
  onApprove: () => void;
}

// Type badge colours
const TYPE_COLORS: Record<string, string> = {
  str:        'bg-blue-500/15 text-blue-400 ring-blue-500/20',
  int:        'bg-orange-500/15 text-orange-400 ring-orange-500/20',
  float:      'bg-yellow-500/15 text-yellow-400 ring-yellow-500/20',
  dict:       'bg-purple-500/15 text-purple-400 ring-purple-500/20',
  'list[str]':'bg-teal-500/15 text-teal-400 ring-teal-500/20',
};

const ReviewStage = ({
  stagedTemplate,
  previewData,
  additionalPrompt,
  isLoading = false,
  onEdit,
  onApprove,
}: ReviewStageProps) => {
  const [showTemplate, setShowTemplate] = useState(false);
  const fieldCount = Object.keys(stagedTemplate).length;

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <ConfidenceGauge score={previewData.confidence} />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-muted hover:bg-surface-hover text-secondary-foreground rounded-xl font-bold text-sm transition-all ring-surface disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit3 className="w-4 h-4" />
            Edit Template
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all glow-indigo active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            Approve & Finish
          </button>
        </div>
      </div>

      {/* ── Preview status banner ─────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
        isLoading
          ? 'border-primary/30 bg-primary/5 text-primary'
          : 'border-amber-500/30 bg-amber-500/5 text-amber-400'
      }`}>
        {isLoading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Running extraction preview…</>
          : <><div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Preview result — not satisfied? Edit the template and re-run, or approve to finalise.</>
        }
      </div>

      {/* ── Extracted preview results ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.section
            key="preview-results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20">
              <div className="bg-background rounded-[15px] p-6">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Extraction Preview
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(previewData.extracted_additional_data).map(([k, v]) => (
                    <DataField key={k} label={k} value={v} />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── AI Analysis card ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isLoading && previewData.additonal_extracted_info && (
          <motion.section
            key="ai-analysis"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-accent/20 to-primary/15">
              <div className="bg-background rounded-[15px] p-6 space-y-2">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-primary" />
                  AI Analysis
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {previewData.additonal_extracted_info}
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Collapsible template viewer ───────────────────────────────────── */}
      <section>
        <button
          onClick={() => setShowTemplate(!showTemplate)}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showTemplate ? 'rotate-180' : ''}`} />
          <LayoutTemplate className="w-4 h-4" />
          View Current Template ({fieldCount} fields)
        </button>

        <AnimatePresence>
          {showTemplate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3 overflow-hidden"
            >
              <div className="bg-muted/30 rounded-xl p-4 ring-surface space-y-2">
                {Object.entries(stagedTemplate).map(([field, type]) => (
                  <div
                    key={field}
                    className="flex items-center gap-3 px-3 py-2 bg-background/60 rounded-lg ring-1 ring-border/30"
                  >
                    {type === 'int' || type === 'float'
                      ? <Hash className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      : <Tag className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                    }
                    <span className="flex-1 text-sm text-foreground font-medium font-mono">{field}</span>
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ring-1 shrink-0
                      ${TYPE_COLORS[type] ?? 'bg-muted text-muted-foreground ring-muted-foreground/20'}`}>
                      {type}
                    </span>
                  </div>
                ))}

                {additionalPrompt && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <MessageSquareText className="w-3 h-3" /> Additional Prompt
                    </p>
                    <p className="text-xs text-foreground/70 italic">"{additionalPrompt}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Edit hint ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 text-xs text-muted-foreground/55 pl-1"
      >
        <RefreshCw className="w-3 h-3 shrink-0" />
        Not what you expected? Click{' '}
        <span className="text-foreground/75 font-semibold mx-0.5">Edit Template</span>
        to refine and re-run — iterate as many times as needed before approving.
      </motion.div>
    </motion.div>
  );
};

export default ReviewStage;
