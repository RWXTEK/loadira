import { useState } from 'react'
import { X } from 'lucide-react'

export function FmcsaBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
        <p className="text-xs text-amber-300 leading-relaxed">
          <span className="font-semibold">Disclaimer:</span> Data sourced from FMCSA and may not reflect real-time changes. Always verify carrier information at{' '}
          <a href="https://safer.fmcsa.dot.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-200">safer.fmcsa.dot.gov</a>{' '}
          before making business decisions.
        </p>
        <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-200 flex-shrink-0 cursor-pointer p-1" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function DataDisclaimerFooter() {
  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 mt-6">
      <p className="text-xs text-amber-300/70 leading-relaxed">
        <span className="font-semibold text-amber-300">Data Disclaimer:</span> The carrier is solely responsible for the accuracy of all information displayed on this page. Loadira does not independently verify user-submitted data. FMCSA data is provided "as-is" from government sources and may contain errors or be outdated. See our{' '}
        <a href="/terms" className="underline hover:text-amber-200">Terms of Service</a>.
      </p>
    </div>
  )
}
