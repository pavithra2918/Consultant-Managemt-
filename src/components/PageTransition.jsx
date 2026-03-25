import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: 'circOut' }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
