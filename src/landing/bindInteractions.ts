import {
  getElementScrollTop,
  resolveScrollOrigin,
  setScrollOrigin,
} from "../apply/scrollBack";
import { scrollPageTo } from "./motion";

const FORM_DESKTOP = '[data-node-id="417:658"]';
const FORM_MOBILE = '[data-node-id="417:991"]';
const HERO_CTA = '[data-node-id="417:113"], [data-node-id="417:711"]';
const LEAD_MAGNETS_DESKTOP = '[data-node-id="417:152"], [data-node-id="417:294"]';
const LEAD_MAGNETS_MOBILE = '[data-node-id="417:723"], [data-node-id="417:833"]';

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function isApplyCta(el: Element) {
  const text = normalizeText(el.textContent || "");
  return (
    text.includes("подать заявку") ||
    text === "подать заявку" ||
    (text.includes("подать") && text.includes("заявк"))
  );
}

export function bindLandingInteractions(
  root: HTMLElement,
  mobile: boolean,
): () => void {
  const formSelector = mobile ? FORM_MOBILE : FORM_DESKTOP;

  const scrollToForm = (from?: HTMLElement) => {
    const form = root.querySelector(formSelector) as HTMLElement | null;
    if (!form) return;
    if (from) {
      setScrollOrigin(resolveScrollOrigin(from, root, mobile));
    }
    scrollPageTo(getElementScrollTop(form));
  };

  const targets = new Set<HTMLElement>();

  root.querySelectorAll("button").forEach((btn) => {
    if (isApplyCta(btn)) targets.add(btn);
  });

  root.querySelectorAll('[data-name="button"]').forEach((el) => {
    if (isApplyCta(el)) targets.add(el as HTMLElement);
  });

  root.querySelectorAll(HERO_CTA).forEach((el) => {
    targets.add(el as HTMLElement);
  });

  root.querySelectorAll("p, span, div").forEach((el) => {
    const raw = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (normalizeText(raw) !== "подать заявку") return;
    if (raw.length > 40) return;
    const host =
      (el.closest("button") as HTMLElement | null) ||
      (el.closest('[data-name="button"]') as HTMLElement | null) ||
      (el.closest('[data-node-id="417:113"]') as HTMLElement | null) ||
      (el.closest('[data-node-id="417:711"]') as HTMLElement | null);
    if (host) targets.add(host);
  });

  const form = root.querySelector(formSelector);
  const cleanups: Array<() => void> = [];

  targets.forEach((el) => {
    if (form && form.contains(el)) return;
    el.style.cursor = "pointer";
    const onClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      scrollToForm(el);
    };
    el.addEventListener("click", onClick);
    cleanups.push(() => el.removeEventListener("click", onClick));
  });

  const leadMagnetSelector = mobile ? LEAD_MAGNETS_MOBILE : LEAD_MAGNETS_DESKTOP;
  root.querySelectorAll(leadMagnetSelector).forEach((el) => {
    const banner = el as HTMLElement;
    if (form && form.contains(banner)) return;
    banner.style.cursor = "pointer";
    const onBannerClick = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, label, a[href], .form-file-upload")) return;
      scrollToForm(banner);
    };
    banner.addEventListener("click", onBannerClick);
    cleanups.push(() => banner.removeEventListener("click", onBannerClick));
  });

  const CARD_STEP = mobile ? 312 : 512;
  const onCarouselClick = (e: MouseEvent) => {
    const el = e.target as HTMLElement | null;
    if (!el) return;
    const prev = el.closest('[data-experts-prev="true"]');
    const next = el.closest('[data-experts-next="true"]');
    if (!prev && !next) return;
    const track = root.querySelector<HTMLElement>('[data-experts-carousel="true"]');
    if (!track) return;
    e.preventDefault();
    e.stopPropagation();
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    if (max <= 0) return;
    let target = track.scrollLeft + (prev ? -CARD_STEP : CARD_STEP);
    if (target < 0) target = max;
    if (target > max) target = 0;
    track.scrollTo({ left: target, behavior: "smooth" });
  };
  root.addEventListener("click", onCarouselClick, true);
  cleanups.push(() => root.removeEventListener("click", onCarouselClick, true));

  return () => cleanups.forEach((fn) => fn());
}
