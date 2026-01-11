import { motion, AnimatePresence } from 'framer-motion'

interface LiveTextProps {
  text: string
}

export function LiveText({ text }: LiveTextProps) {
  return (
    <div className="min-h-[60px] bg-gray-800/30 rounded-lg p-3">
      <AnimatePresence mode="wait">
        {text ? (
          <motion.p
            key={text.slice(-50)}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="text-sm text-gray-200"
          >
            {text}
            <span className="animate-pulse text-blue-400">|</span>
          </motion.p>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 italic"
          >
            Listening...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
