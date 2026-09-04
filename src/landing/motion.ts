import Lenis from "lenis";

type Cleanup = () => void;

let lenisInstance: Lenis | null = null;
const scrollListeners = new Set<() => void>();

/** Subscribe to page scroll updates (Lenis RAF + native scroll) */
export function onPageScroll(fn: () => void): Cleanup {
  scrollListeners.add(fn);
  return () => scrollListeners.delete(fn);
}

function emitScroll() {
  scrollListeners.forEach((fn) => fn());
}

/** Smooth scroll helper (Lenis when available) */
export function scrollPageTo(top: number) {
  if (lenisInstance) {
    lenisInstance.scrollTo(top, { duration: 1.6, offset: 0 });
    return;
  }
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

const REVEAL_SELECTORS = [
  '[data-name="title"]',
  '[data-name="Card"]',
  '[data-name="card"]',
  '[data-name="container"]',
  '[data-name="head"]',
  '[data-name="containerInfo"]',
  '[data-name="rowCard"]',
  '[data-name="containerContent"]',
  '[data-experts-carousel="true"]',
  '[data-node-id="417:658"]',
  '[data-node-id="417:991"]',
  '[data-node-id="417:303"]',
  '[data-node-id="417:304"]',
  '[data-node-id="417:612"]',
  '[data-node-id="417:625"]',
  '[data-node-id="417:848"]',
];

const FLOAT_SELECTORS = [
  '[data-name="стикеры копия 5"]',
  '[data-node-id="417:108"]',
];

const AMBIENT_GLOW = [
  '[data-node-id="417:106"]',
  '[data-node-id="417:107"]',
  '[data-node-id="417:702"]',
  '[data-node-id="417:703"]',
];

const HEADER_SELECTORS = ['[data-node-id="515:91"]'];

function sortByPosition(a: Element, b: Element) {
  const ra = a.getBoundingClientRect();
  const rb = b.getBoundingClientRect();
  const dy = ra.top - rb.top;
  if (Math.abs(dy) > 12) return dy;
  return ra.left - rb.left;
}

function markElements(
  root: HTMLElement,
  selectors: string[],
  attr: string,
  value: string,
) {
  const seen = new Set<Element>();
  for (const sel of selectors) {
    root.querySelectorAll(sel).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (!el.hasAttribute(attr)) el.setAttribute(attr, value);
    });
  }
  return seen;
}

function initLenis(reduced: boolean): Cleanup {
  if (reduced) return () => undefined;

  const lenis = new Lenis({
    duration: 1.45,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    touchMultiplier: 1.1,
    wheelMultiplier: 0.9,
  });
  lenisInstance = lenis;
  lenis.on("scroll", emitScroll);

  let raf = 0;
  const tick = (time: number) => {
    lenis.raf(time);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  document.documentElement.classList.add("has-smooth-scroll");

  return () => {
    cancelAnimationFrame(raf);
    lenis.off("scroll", emitScroll);
    lenis.destroy();
    lenisInstance = null;
    document.documentElement.classList.remove("has-smooth-scroll");
  };
}

function initHero(root: HTMLElement, reduced: boolean): Cleanup {
  const timeouts: number[] = [];

  /* Strict top-to-bottom sequence */
  const header = [...root.querySelectorAll(HEADER_SELECTORS.join(","))].sort(
    sortByPosition,
  );
  const headline = [...root.querySelectorAll('[data-name="containerHead"] > *')];
  const cta = [
    ...root.querySelectorAll('[data-node-id="417:113"], [data-node-id="417:711"]'),
  ];
  const partners = [
    ...root.querySelectorAll('[data-node-id="417:115"], [data-node-id="417:704"]'),
  ];

  const sequence: Array<{ el: Element; motion: string }> = [
    ...header.map((el) => ({ el, motion: "hero-header" })),
    ...headline.map((el) => ({ el, motion: "hero-line" })),
    ...cta.map((el) => ({ el, motion: "hero-cta" })),
    ...partners.map((el) => ({ el, motion: "hero-partners" })),
  ];

  for (const { el, motion } of sequence) {
    el.setAttribute("data-motion", motion);
  }

  if (reduced) {
    sequence.forEach(({ el }) => el.classList.add("is-inview"));
    document.documentElement.classList.add("hero-ready");
    return () => undefined;
  }

  const STAGGER = 260;
  const START = 350;

  sequence.forEach(({ el }, index) => {
    const id = window.setTimeout(() => {
      el.classList.add("is-inview");
      if (index === sequence.length - 1) {
        document.documentElement.classList.add("hero-ready");
      }
    }, START + index * STAGGER);
    timeouts.push(id);
  });

  return () => timeouts.forEach((id) => window.clearTimeout(id));
}

function initReveals(root: HTMLElement, reduced: boolean): Cleanup {
  const targets = markElements(root, REVEAL_SELECTORS, "data-motion", "reveal");

  /* Stagger siblings left-to-right, top-to-bottom within each parent */
  const parents = new Set<Element>();
  targets.forEach((el) => {
    if (el.parentElement) parents.add(el.parentElement);
  });
  parents.forEach((parent) => {
    const siblings = [...parent.children].filter(
      (child) => child.getAttribute("data-motion") === "reveal",
    );
    siblings.sort(sortByPosition).forEach((el, idx) => {
      (el as HTMLElement).style.setProperty(
        "--motion-delay",
        `${idx * 100}ms`,
      );
    });
  });

  if (reduced) {
    targets.forEach((el) => el.classList.add("is-inview"));
    return () => undefined;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-inview");
        entry.target.removeAttribute("data-motion");
        io.unobserve(entry.target);
      }
    },
    { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
  );

  targets.forEach((el) => io.observe(el));

  return () => io.disconnect();
}

function initFloat(root: HTMLElement, reduced: boolean): Cleanup {
  if (reduced) return () => undefined;
  markElements(root, FLOAT_SELECTORS, "data-motion", "float");
  return () => undefined;
}

function initAmbient(root: HTMLElement, reduced: boolean): Cleanup {
  if (reduced) return () => undefined;
  markElements(root, AMBIENT_GLOW, "data-motion", "ambient");
  return () => undefined;
}

const PARTNER_MARQUEE_IDS = ["417:115", "417:704"] as const;

const MARQUEE_VIEWPORT_CLASSES = new Set([
  "-translate-x-1/2",
  "absolute",
  "left-1/2",
  "left-[calc(50%+0.5px)]",
  "top-[302px]",
  "top-[877px]",
  "w-[374px]",
  "[word-break:break-word]",
]);

function splitMarqueeClasses(className: string) {
  const viewport: string[] = [];
  const track: string[] = [];

  for (const token of className.split(/\s+/).filter(Boolean)) {
    if (
      MARQUEE_VIEWPORT_CLASSES.has(token) ||
      token.startsWith("top-[") ||
      (token.startsWith("w-[") && token !== "w-[min-content]")
    ) {
      viewport.push(token);
    } else {
      track.push(token);
    }
  }

  return { viewport, track };
}

function initPartnerMarquee(root: HTMLElement, reduced: boolean): Cleanup {
  if (reduced) return () => undefined;

  const tracks = root.querySelectorAll(
    PARTNER_MARQUEE_IDS.map((id) => `[data-node-id="${id}"]`).join(","),
  );

  tracks.forEach((track) => {
    const el = track as HTMLElement;
    if (el.closest("[data-partner-marquee-viewport]")) return;
    if (el.getAttribute("data-marquee") === "true") return;
    const items = [...el.children];
    if (items.length === 0) return;

    const nodeId = el.getAttribute("data-node-id") ?? "";
    const { viewport, track: trackClasses } = splitMarqueeClasses(el.className);

    const viewportEl = document.createElement("div");
    viewportEl.className = [...viewport, "partner-marquee-viewport"].join(" ");
    viewportEl.setAttribute("data-partner-marquee-viewport", "true");
    viewportEl.setAttribute("data-partner-marquee-for", nodeId);

    el.className = [...trackClasses, "partner-marquee-track"].join(" ");
    el.parentElement?.insertBefore(viewportEl, el);
    viewportEl.appendChild(el);

    for (const item of items) {
      el.appendChild(item.cloneNode(true));
    }
    el.setAttribute("data-marquee", "true");
  });

  return () => undefined;
}

function initMouseGlow(root: HTMLElement, reduced: boolean): Cleanup {
  if (reduced) return () => undefined;

  const glow = root.querySelector('[data-node-id="417:106"], [data-node-id="417:702"]');
  if (!glow) return () => undefined;

  let raf = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const onMove = (e: MouseEvent) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 48;
    targetY = (e.clientY / window.innerHeight - 0.5) * 32;
  };

  const tick = () => {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    (glow as HTMLElement).style.marginLeft = `${currentX}px`;
    (glow as HTMLElement).style.marginTop = `${currentY}px`;
    raf = requestAnimationFrame(tick);
  };

  window.addEventListener("mousemove", onMove, { passive: true });
  raf = requestAnimationFrame(tick);

  return () => {
    window.removeEventListener("mousemove", onMove);
    cancelAnimationFrame(raf);
    (glow as HTMLElement).style.marginLeft = "";
    (glow as HTMLElement).style.marginTop = "";
  };
}

function initHoverLift(root: HTMLElement): Cleanup {
  root
    .querySelectorAll(
      'button, [data-name="button"], [data-name="Card"], [data-name="card"]',
    )
    .forEach((el) => {
      if (el.closest(".form-file-upload")) return;
      el.setAttribute("data-motion-hover", "lift");
    });
  return () => undefined;
}

function initNoise(): Cleanup {
  if (document.getElementById("page-noise")) return () => undefined;

  const el = document.createElement("div");
  el.id = "page-noise";
  el.className = "page-noise";
  el.setAttribute("aria-hidden", "true");
  document.body.appendChild(el);

  return () => el.remove();
}

/** Sui-like page motion — never touches CSS `translate` (breaks Tailwind centering) */
export function initPageMotion(root: HTMLElement | null): Cleanup {
  if (!root) return () => undefined;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups: Cleanup[] = [];

  cleanups.push(
    initLenis(reduced),
    initPartnerMarquee(root, reduced),
    initHero(root, reduced),
    initReveals(root, reduced),
    initFloat(root, reduced),
    initAmbient(root, reduced),
    initMouseGlow(root, reduced),
    initHoverLift(root),
  );
  if (!reduced) cleanups.push(initNoise());

  const arm = requestAnimationFrame(() => {
    root.classList.add("motion-ready");
  });
  cleanups.push(() => {
    cancelAnimationFrame(arm);
    root.classList.remove("motion-ready");
  });

  return () => cleanups.forEach((fn) => fn());
}
