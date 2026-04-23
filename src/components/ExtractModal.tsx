import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FileText, Sparkles, LayoutTemplate } from 'lucide-react';

interface FieldRow {
  name: string;
  type: string;
}

interface ExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fields: Record<string, string>, additionalPrompt: string) => void;
  currentTemplate?: Record<string, string>;
}

const DATA_TYPES = ['str', 'int', 'float', 'dict', 'list[str]'];

const templateToRows = (template: Record<string, string>): FieldRow[] =>
  Object.entries(template).map(([name, type]) => ({ name, type }));

const ExtractModal = ({ isOpen, onClose, onSubmit, currentTemplate = {} }: ExtractModalProps) => {
  const [fields, setFields] = useState<FieldRow[]>([{ name: '', type: 'str' }]);
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  // When the modal opens, initialise with the current template (if any)
  useEffect(() => {
    if (isOpen) {
      const initial =
        Object.keys(currentTemplate).length > 0
          ? templateToRows(currentTemplate)
          : [{ name: '', type: 'str' }];
      setFields(initial);
      setAdditionalPrompt('');
    }
  }, [isOpen]);

  const addRow = () => setFields((prev) => [...prev, { name: '', type: 'str' }]);

  const updateField = (i: number, key: keyof FieldRow, val: string) => {
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));
  };

  const removeRow = (i: number) => {
    if (fields.length > 1) setFields((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = () => {
    const template: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.name.trim()) template[f.name.trim()] = f.type;
    });
    if (Object.keys(template).length > 0) {
      onSubmit(template, additionalPrompt.trim());
      setFields([{ name: '', type: 'str' }]);
      setAdditionalPrompt('');
    }
  };

  const hasTemplate = Object.keys(currentTemplate).length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="relative w-full max-w-2xl surface-card ring-surface overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-7 border-b border-muted flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-primary" />
                  Extraction Schema
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasTemplate
                    ? 'Current template pre-loaded — edit, add or remove fields as needed.'
                    : 'Define a custom schema for the AI to extract.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors mt-0.5"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1">
              {/* ── Template badge ── */}
              {hasTemplate && (
                <div className="px-7 pt-5">
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl ring-1 ring-primary/20 text-xs text-primary font-semibold w-fit">
                    <FileText className="w-3.5 h-3.5" />
                    Current template loaded ({Object.keys(currentTemplate).length} fields)
                  </div>
                </div>
              )}

              {/* ── Field rows ── */}
              <div className="p-7 space-y-3">
                {/* Column headers */}
                <div className="flex gap-3 items-center mb-1">
                  <span className="flex-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    Field Name
                  </span>
                  <span className="w-36 text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    Type
                  </span>
                  {/* remove button spacer */}
                  <span className="w-10" />
                </div>

                {fields.map((field, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex gap-3 items-center"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(i, 'name', e.target.value)}
                        placeholder="e.g. shipping_method"
                        className="w-full bg-muted border-0 ring-surface focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="w-36">
                      <select
                        value={field.type}
                        onChange={(e) => updateField(i, 'type', e.target.value)}
                        className="w-full bg-primary/10 border-0 ring-1 ring-primary/20 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-foreground transition-all outline-none appearance-none cursor-pointer"
                      >
                        {DATA_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeRow(i)}
                      disabled={fields.length === 1}
                      className="p-2.5 hover:bg-destructive/10 rounded-xl transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </motion.div>
                ))}

                <button
                  onClick={addRow}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors py-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add another field
                </button>
              </div>

              {/* Divider */}
              <div className="mx-7 border-t border-muted" />

              {/* ── Additional prompt ── */}
              <div className="p-7 space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Additional Prompt
                    <span className="normal-case font-normal text-muted-foreground/60 tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    rows={3}
                    placeholder="e.g. Focus on the financial summary section and highlight any risk factors…"
                    className="w-full bg-muted border-0 ring-surface focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-foreground transition-all outline-none resize-none placeholder:text-muted-foreground/50"
                  />
                  <p className="text-[11px] text-muted-foreground/60 mt-1.5 ml-1">
                    Extra instructions for summary extraction or specialised response formatting.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-7 bg-muted/30 border-t border-muted flex items-center justify-between shrink-0">
              <span className="text-xs text-muted-foreground">
                {fields.filter((f) => f.name.trim()).length} field
                {fields.filter((f) => f.name.trim()).length !== 1 ? 's' : ''} defined
              </span>
              <button
                onClick={handleSubmit}
                disabled={fields.filter((f) => f.name.trim()).length === 0}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all glow-indigo active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:glow-none"
              >
                Submit Deep Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExtractModal;
