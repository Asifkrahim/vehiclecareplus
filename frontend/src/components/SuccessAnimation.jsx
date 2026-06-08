import { motion } from 'framer-motion';

// Animated SVG checkmark for success state
export default function SuccessAnimation({ message = 'Success!' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '32px',
      }}
    >
      {/* Pulsing circle background */}
      <div style={{ position: 'relative' }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: -12,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.2), transparent)',
          }}
        />
        <motion.svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          initial="hidden"
          animate="visible"
        >
          {/* Circle */}
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
          {/* Checkmark */}
          <motion.path
            d="M24 40 L35 51 L56 29"
            fill="none"
            stroke="#22c55e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5, ease: 'easeInOut' }}
          />
        </motion.svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ textAlign: 'center' }}
      >
        <p style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#22c55e',
          margin: 0,
          fontFamily: 'Outfit, sans-serif',
        }}>
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
}
