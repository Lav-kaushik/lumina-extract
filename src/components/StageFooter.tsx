import { motion } from 'framer-motion';

type Stage = 1 | 2 | 2.5 | 3;

interface StepDef {
  label: string;
  value: number;   // numeric stage value this step corresponds to
}

const STEPS: StepDef[] = [
  { label: 'Upload',  value: 1 },
  { label: 'Review',  value: 2 },
  { label: 'Approve', value: 2.5 },
  { label: 'Extract', value: 3 },
];

const StageFooter = ({ stage }: { stage: Stage }) => (
  <footer className="absolute bottom-0 left-0 right-0 h-20 glass flex items-center justify-center px-8 z-20">
    <div className="flex items-center gap-4">
      {STEPS.map((step, idx) => {
        const isActive  = stage >= step.value;
        const isCurrent = stage === step.value;

        return (
          <div key={step.value} className="flex items-center gap-4">
            {/* Step dot */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={isCurrent ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  isActive
                    ? 'bg-primary text-primary-foreground glow-indigo'
                    : 'bg-muted text-muted-foreground ring-surface'
                }`}
              >
                {idx + 1}
              </motion.div>
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-500 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {idx < STEPS.length - 1 && (
              <div
                className={`w-8 h-[2px] rounded-full mb-4 transition-colors duration-500 ${
                  stage > step.value ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  </footer>
);

export default StageFooter;
