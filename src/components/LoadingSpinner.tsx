import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Processing Neural Layers...' }: { message?: string }) => (
  <motion.div
    key="loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="h-full flex flex-col items-center justify-center gap-5"
  >
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full ring-2 ring-primary/20" />
      <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin-slow" />
    </div>
    <p className="text-sm font-mono text-muted-foreground animate-pulse-glow uppercase tracking-[0.2em]">
      {message}
    </p>
  </motion.div>
);

export default LoadingSpinner;
