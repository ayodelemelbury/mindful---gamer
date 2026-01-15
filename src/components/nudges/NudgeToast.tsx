import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface NudgeToastProps {
  message: string
  visible: boolean
  onDismiss: () => void
}

export function NudgeToast({ message, visible, onDismiss }: NudgeToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-4 right-4 mx-auto max-w-md bg-white rounded-xl p-4 shadow-lg border border-slate-200 flex items-start gap-3"
        >
          <div className="flex-1">
            <p className="text-sm text-slate-700">{message}</p>
          </div>
          <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
