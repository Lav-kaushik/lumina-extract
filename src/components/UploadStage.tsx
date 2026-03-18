import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { useState, useCallback } from 'react';

interface UploadStageProps {
  onFileSelected: (file: File) => void;
}

const UploadStage = ({ onFileSelected }: UploadStageProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') onFileSelected(file);
  }, [onFileSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  return (
    <motion.div
      key="stage1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      className="h-full flex items-center justify-center"
    >
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        className={`group relative w-full max-w-2xl aspect-video flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(243_75%_59%_/_0.08),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
        >
          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.div>
        <div className="text-center relative z-10">
          <p className="text-lg font-semibold text-foreground">Drop document to begin</p>
          <p className="text-sm text-muted-foreground mt-1">Support for high-res PDF documents</p>
        </div>
        <input type="file" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }} accept=".pdf" />
      </label>
    </motion.div>
  );
};

export default UploadStage;
