const LEAD_MAGNETS_DESKTOP =
  '[data-node-id="417:152"], [data-node-id="417:294"]';
const LEAD_MAGNETS_MOBILE =
  '[data-node-id="417:723"], [data-node-id="417:833"]';

export const SCROLL_ORIGIN_EVENT = "scroll-origin-change";

function notifyScrollOriginChange() {
  window.dispatchEvent(new CustomEvent(SCROLL_ORIGIN_EVENT));
}

export function setScrollOrigin(el: HTMLElement | null) {
  const root = document.documentElement;
  document
    .querySelectorAll("[data-scroll-origin='true']")
    .forEach((node) => node.removeAttribute("data-scroll-origin"));

  if (!el) {
    delete root.dataset.scrollOriginId;
    notifyScrollOriginChange();
    return;
  }

  const nodeId = el.getAttribute("data-node-id");
  if (nodeId) {
    root.dataset.scrollOriginId = nodeId;
  } else {
    el.setAttribute("data-scroll-origin", "true");
    delete root.dataset.scrollOriginId;
  }
  notifyScrollOriginChange();
}

export function getScrollOrigin(): HTMLElement | null {
  const nodeId = document.documentElement.dataset.scrollOriginId;
  if (nodeId) {
    return document.querySelector(
      `[data-node-id="${nodeId}"]`,
    ) as HTMLElement | null;
  }

  return document.querySelector(
    "[data-scroll-origin='true']",
  ) as HTMLElement | null;
}

export function resolveScrollOrigin(
  from: HTMLElement,
  root: HTMLElement,
  mobile: boolean,
): HTMLElement {
  const leadSelector = mobile ? LEAD_MAGNETS_MOBILE : LEAD_MAGNETS_DESKTOP;
  const lead = from.closest(leadSelector);
  if (lead) return lead as HTMLElement;

  const heroCta = from.closest(
    '[data-node-id="417:113"], [data-node-id="417:711"]',
  );
  if (heroCta) {
    const hero = heroCta.closest('[data-name="containerHead"]');
    if (hero) return hero as HTMLElement;
    return heroCta as HTMLElement;
  }

  const keyboard = from.closest(
    '[data-node-id="417:1114"], [data-node-id="417:140"], [data-node-id="417:139"]',
  );
  if (keyboard && root.contains(keyboard)) return keyboard as HTMLElement;

  const card = from.closest('[data-name="card"]');
  if (card && root.contains(card) && !card.closest("footer")) {
    return card as HTMLElement;
  }

  const section = from.closest(
    '[data-name="containerHead"], [data-name="title"], [data-node-id="417:721"]',
  );
  if (section && root.contains(section)) return section as HTMLElement;

  return from;
}

export function getElementScrollTop(el: HTMLElement, offset = 24) {
  return Math.max(0, window.scrollY + el.getBoundingClientRect().top - offset);
}

export function shouldShowScrollBack(origin: HTMLElement): boolean {
  const form =
    (document.querySelector('[data-node-id="417:658"]') as HTMLElement | null) ??
    (document.querySelector('[data-node-id="417:991"]') as HTMLElement | null);

  if (!form) return false;

  const formRect = form.getBoundingClientRect();
  const formInView =
    formRect.top < window.innerHeight * 0.92 && formRect.bottom > 48;

  if (!formInView) return false;

  const originTop = getElementScrollTop(origin, 0);
  return window.scrollY >= originTop + 80;
}
