import { RefreshCw, X } from 'lucide-react'
import { usePWAUpdate } from '../../hooks/usePWAUpdate'
import { motion, AnimatePresence } from 'framer-motion'

export function UpdatePrompt() {
  const { needsRefresh, updateApp, dismissUpdate } = usePWAUpdate()

  return (
    <AnimatePresence>
      {needsRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-emerald-600 rounded-xl p-4 shadow-lg z-40"
        >
          <button 
            onClick={dismissUpdate} 
            className="absolute top-3 right-3 text-emerald-100 hover:text-white"
          >
            <X size={18} />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <RefreshCw size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white text-sm">Update Available</h3>
              <p className="text-xs text-emerald-100 mt-1">A new version of Mindful Gamer is ready</p>
              <button
                onClick={updateApp}
                className="mt-3 w-full py-2 bg-white text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Update Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
