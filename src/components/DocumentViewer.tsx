import { useEffect, useRef, useState } from 'react';
import { FileText, GripVertical, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentViewerProps {
  fileUrl: string | null;
  fileName: string | null;
  width: number;
  onResize: (width: number) => void;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const getMinMax = () => {
  const vw = window.innerWidth;
  return { min: Math.round(vw * 0.2), max: Math.round(vw * 0.5) };
};

const DocumentViewer = ({ fileUrl, fileName, width, onResize }: DocumentViewerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // All drag state lives in refs — never stale, never triggers re-renders mid-drag
  const dragRef = useRef<{ active: boolean; startX: number; startWidth: number }>({
    active: false,
    startX: 0,
    startWidth: 0,
  });

  // Keep a stable ref to the latest onResize so listeners never go stale
  const onResizeRef = useRef(onResize);
  useEffect(() => { onResizeRef.current = onResize; }, [onResize]);

  // Reset iframe loading state when file changes
  useEffect(() => { setIframeLoaded(false); }, [fileUrl]);

  // ── Attach document-level listeners once, forever ──────────────────────────
  // This avoids the classic bug where listeners added inside a mousedown handler
  // get duplicated or reference stale closures.
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      const { min, max } = getMinMax();
      // left edge: moving cursor left = increasing width, moving right = decreasing
      const delta = dragRef.current.startX - e.clientX;
      onResizeRef.current(clamp(dragRef.current.startWidth + delta, min, max));
    };

    const onMouseUp = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      setIsDragging(false);
      // Restore normal cursor on body
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []); // empty — intentional, listeners are permanent for the lifetime of the component

  // ── Touch (same approach) ──────────────────────────────────────────────────
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.active) return;
      const { min, max } = getMinMax();
      const delta = dragRef.current.startX - e.touches[0].clientX;
      onResizeRef.current(clamp(dragRef.current.startWidth + delta, min, max));
    };

    const onTouchEnd = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      setIsDragging(false);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // ── Grip mouse-down ────────────────────────────────────────────────────────
  const handleGripMouseDown = (e: React.MouseEvent) => {
    // Only react to primary button (left click)
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    dragRef.current = { active: true, startX: e.clientX, startWidth: width };
    setIsDragging(true);

    // Override cursor globally so it doesn't flicker when over other elements
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleGripTouchStart = (e: React.TouchEvent) => {
    dragRef.current = { active: true, startX: e.touches[0].clientX, startWidth: width };
    setIsDragging(true);
  };

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
      style={{ width, minWidth: width, maxWidth: width }}
      className="relative bg-card border-l border-border flex flex-col h-full overflow-hidden shrink-0"
    >
      {/* ── Drag grip (left edge) ────────────────────────────────────────────── */}
      <div
        onMouseDown={handleGripMouseDown}
        onTouchStart={handleGripTouchStart}
        className={`absolute left-0 top-0 bottom-0 w-3 z-30 flex items-center justify-center select-none group cursor-col-resize
          ${isDragging ? 'bg-primary/15' : 'hover:bg-primary/8'} transition-colors duration-150`}
        title="Drag to resize preview"
      >
        {/* pill indicator */}
        <div
          className={`w-[3px] h-10 rounded-full pointer-events-none transition-all duration-150
            ${isDragging
              ? 'bg-primary h-16 opacity-100'
              : 'bg-muted-foreground/30 group-hover:bg-primary/70 group-hover:h-14'
            }`}
        />
        <GripVertical
          className={`absolute w-3 h-3 pointer-events-none transition-opacity duration-150
            ${isDragging ? 'text-primary opacity-100' : 'text-muted-foreground/50 opacity-0 group-hover:opacity-100'}`}
        />
      </div>

      {/* Drag capture overlay — sits over the iframe during drag to block it swallowing events */}
      {isDragging && (
        <div className="absolute inset-0 z-20 cursor-col-resize" />
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="h-16 border-b border-border flex items-center px-6 pl-5 justify-between shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground pl-2">
          Document Preview
        </span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${fileUrl ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
          <span className="text-[10px] text-muted-foreground font-mono">
            {fileUrl ? 'LIVE_VIEW' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* ── Filename pill ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {fileName && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="px-5 py-2.5 border-b border-border/50 shrink-0"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs text-muted-foreground w-full truncate">
              <FileText className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="truncate font-medium">{fileName}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PDF iframe / placeholder ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden m-3 ml-4 rounded-xl ring-1 ring-border/50 bg-muted/20 relative">
        {fileUrl ? (
          <>
            {/* Loading skeleton */}
            <AnimatePresence>
              {!iframeLoaded && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/30 rounded-xl z-10"
                >
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground font-medium">Loading preview…</p>
                </motion.div>
              )}
            </AnimatePresence>

            <iframe
              key={fileUrl}
              src={fileUrl}
              onLoad={() => setIframeLoaded(true)}
              className="h-full w-full rounded-xl"
              title="PDF Viewer"
              style={{ display: 'block', pointerEvents: isDragging ? 'none' : 'auto' }}
            />
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <FileText className="w-12 h-12 opacity-20" />
            <p className="text-xs font-medium">No document uploaded yet</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default DocumentViewer;
