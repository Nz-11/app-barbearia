"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollVideoOptions {
  /** Quantas "telas" de scroll a sequência deve consumir. */
  scrollLengthVh?: number;
}

/**
 * Sincroniza o `currentTime` de um <video> com o progresso de scroll de uma
 * seção. A seção tem altura de N viewports; enquanto ela atravessa a tela,
 * o vídeo avança proporcionalmente. Fora dela, o vídeo fica parado no
 * primeiro/último frame. Usa requestAnimationFrame com lerp para suavizar
 * e evitar travamentos durante o scroll.
 */
export function useScrollVideo({ scrollLengthVh = 350 }: UseScrollVideoOptions = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => setIsReady(true);
    const onError = () => setHasError(true);

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("error", onError);

    if (video.readyState >= 1) setIsReady(true);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    if (!isReady || hasError || prefersReducedMotion) return;
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = 0;
    let ticking = false;

    const computeTarget = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        targetProgress = 0;
      } else {
        targetProgress = Math.min(1, Math.max(0, -rect.top / total));
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(computeTarget);
      }
    };

    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * 0.18;
      if (Math.abs(currentProgress - targetProgress) < 0.0005) {
        currentProgress = targetProgress;
      }
      const duration = video.duration || 0;
      if (duration > 0) {
        const time = currentProgress * duration;
        if (Math.abs(video.currentTime - time) > 0.02) {
          video.currentTime = time;
        }
      }
      setProgress(currentProgress);
      rafId = requestAnimationFrame(tick);
    };

    computeTarget();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", computeTarget);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", computeTarget);
      cancelAnimationFrame(rafId);
    };
  }, [isReady, hasError, prefersReducedMotion]);

  return {
    sectionRef,
    videoRef,
    isReady,
    hasError,
    progress,
    prefersReducedMotion,
    scrollLengthVh,
  };
}
