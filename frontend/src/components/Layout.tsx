import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import GlassNav from './GlassNav';

interface Props {
  children: ReactNode;
  showNav?: boolean;
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function Layout({ children, showNav = true }: Props) {
  return (
    <div className="min-h-dvh max-w-md mx-auto px-4">
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className={showNav ? 'pb-24 pt-6' : 'pt-6'}
      >
        {children}
      </motion.main>
      {showNav && <GlassNav />}
    </div>
  );
}
