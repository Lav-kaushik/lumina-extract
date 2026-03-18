import { useState } from 'react';
import { FileText } from 'lucide-react';

interface DocumentViewerProps {
  fileUrl: string | null;
  fileName: string | null;
  width: number;
  onResize: (width: number) => void;
}

const DocumentViewer = ({ fileUrl, fileName, width, onResize }: DocumentViewerProps) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = width;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(280, Math.min(800, startWidth - (moveEvent.clientX - startX)));
      onResize(newWidth);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <aside style={{ width }} className="relative bg-card border-l border-muted flex flex-col">
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/40 transition-colors z-10 group"
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-muted-foreground/20 rounded-full group-hover:bg-primary/60 transition-colors" />
      </div>

      <div className="h-16 border-b border-muted flex items-center px-6 justify-between shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Document Source</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
          <span className="text-[10px] text-muted-foreground font-mono">LIVE_VIEW</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden m-4 rounded-xl ring-surface bg-background/50">
        {fileUrl ? (
          <iframe src={fileUrl} className="h-full w-full rounded-xl" title="PDF Viewer" />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <FileText className="w-12 h-12 opacity-20" />
            <p className="text-xs font-medium">No document active</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DocumentViewer;
