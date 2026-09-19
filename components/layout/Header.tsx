"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Scissors } from "lucide-react";
import { useScrolled } from "@/hooks/useScrolled";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

export function Header() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/5 bg-ink-950/70 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:h-20">
        <Link href="/#hero" className="flex items-center gap-2 text-bone-50">
          <Scissors className="h-5 w-5 text-brass-400" strokeWidth={1.5} />
          <span className="font-display text-lg tracking-wide">{siteConfig.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-bone-200/80 transition-colors hover:text-brass-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/agendamento"
            className="rounded-full border border-brass-400/50 px-5 py-2.5 text-sm text-brass-400 transition-all hover:bg-brass-400 hover:text-ink-950"
          >
            Agendar agora
          </Link>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="p-2 text-bone-50 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-[82%] max-w-sm flex-col bg-ink-900 px-6 py-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-bone-50">{siteConfig.shortName}</span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-bone-50"
                  aria-label="Fechar menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="mt-10 flex flex-col gap-2">
                {siteConfig.nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-4 text-base text-bone-100 transition-colors active:bg-white/5"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Link
                href="/agendamento"
                onClick={() => setOpen(false)}
                className="mt-auto rounded-full bg-brass-500 px-5 py-4 text-center text-sm font-medium text-ink-950"
              >
                Agendar agora
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
