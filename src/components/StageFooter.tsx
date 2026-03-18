type Stage = 1 | 2 | 3;

const labels = ['Upload', 'Review', 'Finalize'] as const;

const StageFooter = ({ stage, onNavigate }: { stage: Stage; onNavigate?: (s: Stage) => void }) => (
  <footer className="absolute bottom-0 left-0 right-0 h-20 glass flex items-center justify-center px-8 z-20">
    <div className="flex items-center gap-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-3">
          <button
            onClick={() => s <= stage && onNavigate?.(s as Stage)}
            disabled={s > stage}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              stage >= s
                ? 'bg-primary text-primary-foreground glow-indigo cursor-pointer hover:scale-110'
                : 'bg-muted text-muted-foreground ring-surface cursor-not-allowed'
            }`}
          >
            {s}
          </button>
          <span
            className={`text-[11px] font-bold uppercase tracking-[0.15em] ${
              stage >= s ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {labels[s - 1]}
          </span>
          {s < 3 && (
            <div
              className={`w-10 h-[2px] rounded-full transition-colors duration-500 ${
                stage > s ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  </footer>
);

export default StageFooter;
