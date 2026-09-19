"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useScrollVideo } from "@/hooks/useScrollVideo";
import { siteConfig } from "@/lib/config/site";

export function ScrollVideoHero() {
  const { sectionRef, videoRef, isReady, hasError, prefersReducedMotion, scrollLengthVh } =
    useScrollVideo({ scrollLengthVh: 350 });

  const useNativeAutoplay = hasError || prefersReducedMotion;

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{ height: `${scrollLengthVh}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink-950">
        {!hasError ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/barbearia-hero.mp4"
            muted
            playsInline
            preload="auto"
            autoPlay={useNativeAutoplay}
            loop={useNativeAutoplay}
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-950 to-black" />
        )}

        {/* fallback enquanto o vídeo carrega */}
        {!isReady && !hasError && (
          <div className="absolute inset-0 animate-pulse bg-ink-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-ink-950/60" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 text-xs font-medium tracking-widest2 text-brass-400 sm:text-sm"
          >
            {siteConfig.tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl font-display text-4xl leading-[1.1] text-bone-50 sm:text-6xl md:text-7xl"
          >
            Seu estilo
            <br />
            começa aqui.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md text-balance text-sm text-bone-200/80 sm:text-base"
          >
            {siteConfig.name} — cortes de precisão e experiência sob medida para quem exige o melhor.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <Link
              href="/agendamento"
              className="inline-flex items-center justify-center rounded-full bg-brass-500 px-8 py-4 text-sm font-medium tracking-wide text-ink-950 transition-all hover:bg-brass-400 active:scale-95"
            >
              Agendar horário
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-1 text-bone-200/60"
        >
          <span className="text-[10px] uppercase tracking-widest2">Role para explorar</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
