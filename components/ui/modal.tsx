'use client'

import { clsx } from 'clsx'
import { HTMLAttributes, forwardRef, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, className, children, ...props }, ref) => {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }

      if (open) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    }, [open, onClose])

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    }

    if (!open) return null

    return createPortal(
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-calm-900/50 p-4 backdrop-blur-sm"
      >
        <div
          ref={ref}
          className={clsx(
            'w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-slide-in',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>,
      document.body
    )
  }
)

Modal.displayName = 'Modal'

export const ModalHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('mb-4', className)}
    {...props}
  />
))

ModalHeader.displayName = 'ModalHeader'

export const ModalTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={clsx('text-lg font-semibold text-calm-800', className)}
    {...props}
  />
))

ModalTitle.displayName = 'ModalTitle'

export const ModalFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('mt-6 flex justify-end gap-3', className)}
    {...props}
  />
))

ModalFooter.displayName = 'ModalFooter'
