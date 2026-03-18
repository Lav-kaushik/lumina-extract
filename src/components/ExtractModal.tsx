import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface FieldRow {
  name: string;
  type: string;
}

interface ExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fields: Record<string, string>) => void;
}

const DATA_TYPES = ['str', 'int', 'float', 'dict', 'list[str]'];

const ExtractModal = ({ isOpen, onClose, onSubmit }: ExtractModalProps) => {
  const [fields, setFields] = useState<FieldRow[]>([{ name: '', type: 'str' }]);

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
      onSubmit(template);
      setFields([{ name: '', type: 'str' }]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="relative w-full max-w-xl surface-card ring-surface overflow-hidden"
          >
            <div className="p-8 border-b border-muted flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Define Extraction Schema</h2>
                <p className="text-sm text-muted-foreground mt-1">Add custom fields for the AI to locate</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-8 space-y-3 max-h-[400px] overflow-y-auto">
              {fields.map((field, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <div className="flex-1">
                    {i === 0 && (
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5 ml-1 tracking-wider">
                        Field Name
                      </label>
                    )}
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(i, 'name', e.target.value)}
                      placeholder="e.g. shipping_method"
                      className="w-full bg-muted border-0 ring-surface focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="w-36">
                    {i === 0 && (
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5 ml-1 tracking-wider">
                        Type
                      </label>
                    )}
                    <select
                      value={field.type}
                      onChange={(e) => updateField(i, 'type', e.target.value)}
                      className="w-full bg-muted border-0 ring-surface focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-foreground transition-all outline-none appearance-none cursor-pointer"
                    >
                      {DATA_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  {fields.length > 1 && (
                    <button
                      onClick={() => removeRow(i)}
                      className="p-3 hover:bg-destructive/10 rounded-xl transition-colors shrink-0"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addRow}
                className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors py-2"
              >
                <Plus className="w-3.5 h-3.5" /> Add another field
              </button>
            </div>

            <div className="p-8 bg-muted/30 border-t border-muted flex justify-end">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all glow-indigo active:scale-[0.98]"
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
