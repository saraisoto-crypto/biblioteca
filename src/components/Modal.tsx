'use client'

import { useEffect } from 'react'
import { IconClose } from './Icons'

type Props = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

// Panel lateral que se abre sobre la página (para los formularios)
export default function Modal({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 animate-fade bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative h-full w-full max-w-lg animate-drawer overflow-y-auto border-l border-edge bg-panel p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-xl border border-edge text-dust transition hover:text-parchment"
          aria-label="Cerrar"
        >
          <IconClose size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}