import Lenis from 'lenis';
import { framesManifest } from '../data/framesManifest';

type MotionConfig = {
  lerp?: number;
  revealStaggerMs?: number;
};

type MotionApi = {
  init: (cfg?: MotionConfig) => void;
  start: (hasFrames?: boolean) => void;
  reset: () => void;
  build: () => void;
  lock: (on: boolean) => void;
  scrollTo: (el: Element | null) => void;
  refresh: () => void;
  frames: () => { enabled: boolean; count: number };
};

declare global {
  interface Window {
    Motion?: MotionApi;
  }
}

const state = {
  cfg: {
    lerp: 0.09,
    revealStaggerMs: 70,
  } as Required<MotionConfig>,
  lenis: null as Lenis | null,
  lenisRafId: 0 as number | undefined,
  cinema: {
    images: [] as HTMLImageElement[],
    fallback: null as HTMLImageElement | null,
    forcedEnabled: null as boolean | null,
  },
  cinemaLoadPromise: null as Promise<void> | null,
  observers: [] as IntersectionObserver[],
  cleanup: [] as Array<() => void>,
  fallbackTimer: 0 as number | undefined,
  initialized: false,
};

const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isTouchDevice = () =>
  window.matchMedia('(hover: none), (pointer: coarse)').matches ||
  navigator.maxTouchPoints > 0;

const clearRuntime = () => {
  state.observers.forEach((observer) => observer.disconnect());
  state.observers = [];
  state.cleanup.forEach((fn) => fn());
  state.cleanup = [];
  if (state.fallbackTimer) {
    window.clearTimeout(state.fallbackTimer);
    state.fallbackTimer = undefined;
  }
};

const buildFrameUrl = (index: number) => {
  const padded = String(index).padStart(framesManifest.pad, '0');
  return `${framesManifest.dir}/${framesManifest.prefix}${padded}.${framesManifest.ext}`;
};

const getCinemaPreset = () => {
  if (framesManifest.preset === 'fast') {
    return {
      scrollFrames: Math.max(240, framesManifest.scrollHeightFramesVh),
      scrollStatic: Math.max(180, framesManifest.scrollHeightStaticVh),
      zoomAmount: Math.max(0.04, Math.min(0.2, framesManifest.fallbackZoomAmount)),
      ato2: 0.42,
      ato3: 0.78,
    };
  }

  return {
    scrollFrames: Math.max(300, framesManifest.scrollHeightFramesVh),
    scrollStatic: Math.max(220, framesManifest.scrollHeightStaticVh),
    zoomAmount: Math.max(0.06, Math.min(0.25, framesManifest.fallbackZoomAmount)),
    ato2: 0.34,
    ato3: 0.67,
  };
};

const drawImageCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  scale = 1,
) => {
  const sw = img.naturalWidth;
  const sh = img.naturalHeight;
  if (!sw || !sh) return;

  const base = Math.max(width / sw, height / sh);
  const ratio = base * scale;
  const dw = sw * ratio;
  const dh = sh * ratio;
  const dx = (width - dw) * 0.5;
  const dy = (height - dh) * 0.5;

  ctx.drawImage(img, dx, dy, dw, dh);
};

const getCinemaEnabled = () => {
  if (state.cinema.forcedEnabled === false) return false;
  return state.cinema.images.length > 0;
};

const ensureCinemaFrames = async () => {
  if (state.cinemaLoadPromise) return state.cinemaLoadPromise;
  if (framesManifest.count <= 0) return;

  state.cinemaLoadPromise = (async () => {
    const candidates = Array.from({ length: framesManifest.count }, (_, i) => i + 1);

    const loaded = await Promise.all(
      candidates.map(
        (n) =>
          new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = buildFrameUrl(n);
          }),
      ),
    );

    state.cinema.images = loaded.filter((img): img is HTMLImageElement => !!img);
  })();

  await state.cinemaLoadPromise;
};

const ensureLenis = () => {
  if (state.lenis || isReducedMotion()) return;

  const lenis = new Lenis({
    lerp: state.cfg.lerp,
    smoothWheel: true,
    syncTouch: false,
  });

  const raf = (time: number) => {
    lenis.raf(time);
    state.lenisRafId = window.requestAnimationFrame(raf);
  };

  state.lenis = lenis;
  state.lenisRafId = window.requestAnimationFrame(raf);
};

const buildChrome = () => {
  const nav = document.querySelector('.js-nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  state.cleanup.push(() => window.removeEventListener('scroll', onScroll));
};

const buildReveals = () => {
  const revealables = Array.from(document.querySelectorAll<HTMLElement>('[data-motion]'));
  if (revealables.length === 0) return;

  revealables.forEach((el) => {
    const motionType = el.dataset.motion;
    if (motionType === 'mask') el.classList.add('mask-in');
    else if (motionType === 'zoom') el.classList.add('zoom-in');
    else el.classList.add('reveal');
  });

  if (isReducedMotion()) {
    revealables.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, i) => {
          const el = entry.target as HTMLElement;
          window.setTimeout(() => {
            el.classList.add('visible');
          }, i * state.cfg.revealStaggerMs);
          observer.unobserve(el);
        });
    },
    {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  revealables.forEach((el) => observer.observe(el));
  state.observers.push(observer);

  state.fallbackTimer = window.setTimeout(() => {
    revealables.forEach((el) => el.classList.add('visible'));
  }, 6000);
};

const buildParallax = () => {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('.js-parallax'));
  if (targets.length === 0) return;

  if (isReducedMotion() || isTouchDevice()) {
    targets.forEach((el) => {
      el.style.transform = '';
    });
    return;
  }

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(() => {
      const viewportMid = window.innerHeight * 0.5;
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elementMid = rect.top + rect.height * 0.5;
        const distance = (elementMid - viewportMid) / window.innerHeight;
        const y = Math.max(-6, Math.min(6, distance * 12));
        el.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
      });

      ticking = false;
    });
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  state.cleanup.push(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  });
};

const buildCinema = () => {
  const roots = Array.from(document.querySelectorAll<HTMLElement>('.cine-root'));
  if (roots.length === 0) return;

  const hasFrames = getCinemaEnabled();
  const preset = getCinemaPreset();

  roots.forEach((root) => {
    const sticky = root.querySelector<HTMLElement>('.cine-sticky');
    const canvas = root.querySelector<HTMLCanvasElement>('.cine-canvas');
    const hudAto = root.querySelector<HTMLElement>('#hudAto');
    const hudPct = root.querySelector<HTMLElement>('#hudPct');
    if (!sticky || !canvas) return;

    root.style.setProperty('--cine-h', `${hasFrames ? preset.scrollFrames : preset.scrollStatic}vh`);

    if (!state.cinema.fallback && root.dataset.cineFallback) {
      const img = new Image();
      img.decoding = 'async';
      img.src = root.dataset.cineFallback;
      state.cinema.fallback = img;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const getProgress = () => {
      const total = Math.max(1, root.offsetHeight - window.innerHeight);
      const rect = root.getBoundingClientRect();
      return Math.max(0, Math.min(1, -rect.top / total));
    };

    const draw = () => {
      if (width <= 0 || height <= 0) return;
      const progress = getProgress();

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#050708';
      ctx.fillRect(0, 0, width, height);

      if (hasFrames && state.cinema.images.length > 0) {
        const index = Math.max(0, Math.min(state.cinema.images.length - 1, Math.round(progress * (state.cinema.images.length - 1))));
        const frame = state.cinema.images[index];
        drawImageCover(ctx, frame, width, height, 1);
      } else if (state.cinema.fallback?.complete) {
        const zoom = 1 + progress * preset.zoomAmount;
        drawImageCover(ctx, state.cinema.fallback, width, height, zoom);
      }

      if (hudPct) {
        hudPct.textContent = `${Math.round(progress * 100)}%`;
      }
      if (hudAto) {
        if (progress < preset.ato2) hudAto.textContent = 'ATO I';
        else if (progress < preset.ato3) hudAto.textContent = 'ATO II';
        else hudAto.textContent = 'ATO III';
      }
    };

    const sizeCanvas = () => {
      width = Math.max(1, Math.floor(window.innerWidth));
      height = Math.max(1, Math.floor(window.innerHeight));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const onScroll = () => draw();
    sizeCanvas();

    if (state.cinema.fallback && !state.cinema.fallback.complete) {
      state.cinema.fallback.onload = () => draw();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', sizeCanvas);
    state.cleanup.push(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', sizeCanvas);
    });
  });
};

const buildHorizontal = () => {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.gal-h'));
  if (sections.length === 0) return;

  sections.forEach((section) => {
    const track = section.querySelector<HTMLElement>('.h-track');
    if (!track) return;

    if (isTouchDevice() || isReducedMotion()) {
      section.classList.add('is-native');
      track.classList.add('is-native');
      track.style.transform = '';
      section.style.minHeight = '';
      return;
    }

    section.classList.remove('is-native');
    track.classList.remove('is-native');

    const dist = Math.max(0, track.scrollWidth - window.innerWidth + 80);
    if (dist <= 0) return;

    section.style.minHeight = `${window.innerHeight + dist + 88}px`;

    let ticking = false;
    const update = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const total = section.offsetHeight - window.innerHeight;
        if (total <= 0) {
          ticking = false;
          return;
        }
        const rect = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / total));
        track.style.transform = `translate3d(${-dist * progress}px, 0, 0)`;
        ticking = false;
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    state.cleanup.push(() => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    });
  });
};

const buildCursor = () => {
  if (isTouchDevice() || isReducedMotion()) return;

  let cursor = document.querySelector<HTMLElement>('.cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);
  }

  document.body.classList.add('has-custom-cursor');

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  const onMove = (event: MouseEvent) => {
    x = event.clientX;
    y = event.clientY;
    cursor!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const onOver = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const isLink = !!target.closest('a, button, [role="button"], [data-cursor="link"]');
    const isView = !!target.closest('[data-cursor="view"]');
    cursor!.classList.toggle('is-link', isLink);
    cursor!.classList.toggle('is-view', isView);
  };

  const onLeave = () => {
    cursor!.classList.add('is-hidden');
  };

  const onEnter = () => {
    cursor!.classList.remove('is-hidden');
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseover', onOver, { passive: true });
  window.addEventListener('mouseout', onLeave, { passive: true });
  window.addEventListener('mouseenter', onEnter, { passive: true });

  state.cleanup.push(() => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseover', onOver);
    window.removeEventListener('mouseout', onLeave);
    window.removeEventListener('mouseenter', onEnter);
    document.body.classList.remove('has-custom-cursor');
    cursor?.remove();
  });
};

const api: MotionApi = {
  init(cfg = {}) {
    state.cfg = {
      ...state.cfg,
      ...cfg,
    };
    ensureLenis();
    void ensureCinemaFrames().then(() => this.refresh());
    this.build();
    state.initialized = true;
  },
  start(hasFrames) {
    if (hasFrames === false) {
      state.cinema.forcedEnabled = false;
      this.refresh();
      return;
    }
    if (hasFrames === true) {
      state.cinema.forcedEnabled = true;
    }
    void ensureCinemaFrames().then(() => this.refresh());
    if (!state.initialized) this.init();
  },
  reset() {
    clearRuntime();
  },
  build() {
    clearRuntime();
    ensureLenis();
    buildChrome();
    buildCinema();
    buildReveals();
    buildParallax();
    buildHorizontal();
    buildCursor();
  },
  lock(on) {
    if (on) state.lenis?.stop();
    else state.lenis?.start();
    document.documentElement.classList.toggle('motion-locked', on);
    document.body.classList.toggle('motion-locked', on);
  },
  scrollTo(el) {
    if (!el) return;
    const target = el as HTMLElement;
    if (state.lenis && !isReducedMotion()) {
      state.lenis.scrollTo(target, { offset: -88 });
      return;
    }
    target.scrollIntoView({ behavior: isReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  },
  refresh() {
    this.build();
  },
  frames() {
    return { enabled: getCinemaEnabled(), count: state.cinema.images.length };
  },
};

if (typeof window !== 'undefined') {
  window.Motion = api;
}
