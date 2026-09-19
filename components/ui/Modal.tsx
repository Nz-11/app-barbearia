"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg text-bone-50">{title}</h3>
              <button onClick={onClose} className="p-1 text-bone-200/60 hover:text-bone-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
