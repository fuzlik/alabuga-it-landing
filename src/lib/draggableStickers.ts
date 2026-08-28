type Cleanup = () => void;

type StickerGroup = {
  id: string;
  members: string[];
  boundsId: string;
};

const STICKER_GROUPS: StickerGroup[] = [
  { id: "417:686", members: ["417:686"], boundsId: "417:138" },
  { id: "417:691", members: ["417:691"], boundsId: "417:138" },
  { id: "417:309", members: ["417:309"], boundsId: "417:138" },
];

const FAQ_BLOCK_NODE_ID = "417:639";

const FOLLOW_LERP = 0.12;
const LAYOUT_BLOCK_GAP = 140;
const FOLLOW_BLOCK_COUNT = 2;

type MemberRestore = {
  el: HTMLElement;
  parent: HTMLElement;
  nextSibling: ChildNode | null;
  left: string;
  top: string;
  pointerEvents: string;
  touchAction: string;
};

type GroupState = {
  id: string;
  wrapper: HTMLElement;
  boundsEl: HTMLElement;
  container: HTMLElement | null;
  containerDisplay: string;
  restores: MemberRestore[];
  homeLeft: number;
  homeTop: number;
  wrapperWidth: number;
  wrapperHeight: number;
  offsetX: number;
  offsetY: number;
  minOffsetX: number;
  minOffsetY: number;
  maxOffsetX: number;
  maxOffsetY: number;
};

function getCanvas(root: HTMLElement): HTMLElement {
  return (root.firstElementChild as HTMLElement) ?? root;
}

function getCanvasScale(root: HTMLElement): number {
  const canvas = getCanvas(root);
  const w = canvas.offsetWidth;
  if (!w) return 1;
  return canvas.getBoundingClientRect().width / w;
}

function getDesignPoint(
  root: HTMLElement,
  clientX: number,
  clientY: number,
  relativeTo: HTMLElement,
) {
  const scale = getCanvasScale(root);
  const baseRect = relativeTo.getBoundingClientRect();
  return {
    x: (clientX - baseRect.left) / scale,
    y: (clientY - baseRect.top) / scale,
  };
}

function getDesignRect(
  root: HTMLElement,
  el: HTMLElement,
  relativeTo: HTMLElement,
) {
  const scale = getCanvasScale(root);
  const elRect = el.getBoundingClientRect();
  const baseRect = relativeTo.getBoundingClientRect();
  return {
    x: (elRect.left - baseRect.left) / scale,
    y: (elRect.top - baseRect.top) / scale,
    w: elRect.width / scale,
    h: elRect.height / scale,
  };
}

function getStickerBoundsHeight(
  root: HTMLElement,
  boundsEl: HTMLElement,
): number {
  const faq = boundsEl.querySelector<HTMLElement>(
    `[data-node-id="${FAQ_BLOCK_NODE_ID}"]`,
  );
  if (!faq) return boundsEl.offsetHeight;

  const faqTop = getDesignRect(root, faq, boundsEl).y;
  if (faqTop <= 0) return boundsEl.offsetHeight;
  return faqTop;
}

function computeDragLimits(
  boundsWidth: number,
  boundsHeight: number,
  homeLeft: number,
  homeTop: number,
  wrapperWidth: number,
  wrapperHeight: number,
) {
  // Home (0, 0) must stay valid — stickers may overflow the banner / column.
  return {
    minOffsetX: Math.min(0, -homeLeft),
    minOffsetY: Math.min(0, -homeTop),
    maxOffsetX: Math.max(0, boundsWidth - homeLeft - wrapperWidth),
    maxOffsetY: Math.max(0, boundsHeight - homeTop - wrapperHeight),
  };
}

function getBlockUnit(boundsEl: HTMLElement): number {
  if (boundsEl.getAttribute("data-name") === "block") {
    const h = boundsEl.offsetHeight;
    if (h > 0) return h / 2;
  }
  return LAYOUT_BLOCK_GAP;
}

function getMaxFollowLag(boundsEl: HTMLElement): number {
  return getBlockUnit(boundsEl) * FOLLOW_BLOCK_COUNT;
}

function clampVectorMagnitude(x: number, y: number, max: number) {
  const dist = Math.hypot(x, y);
  if (dist <= max || dist === 0) return { x, y };
  const scale = max / dist;
  return { x: x * scale, y: y * scale };
}

function computeFollowTarget(
  group: GroupState,
  cursorX: number,
  cursorY: number,
  prevCursorX: number,
  prevCursorY: number,
) {
  const maxLag = getMaxFollowLag(group.boundsEl);
  const centerX = group.homeLeft + group.wrapperWidth / 2;
  const centerY = group.homeTop + group.wrapperHeight / 2;

  const vx = cursorX - prevCursorX;
  const vy = cursorY - prevCursorY;
  const speed = Math.hypot(vx, vy);

  let targetCenterX = cursorX;
  let targetCenterY = cursorY;

  if (speed > 1) {
    targetCenterX = cursorX - (vx / speed) * maxLag;
    targetCenterY = cursorY - (vy / speed) * maxLag;
  }

  const offset = clampVectorMagnitude(
    targetCenterX - centerX,
    targetCenterY - centerY,
    maxLag,
  );

  return offset;
}

function clampOffset(group: GroupState, x: number, y: number) {
  const maxLag = getMaxFollowLag(group.boundsEl);
  const bounded = {
    x: Math.max(group.minOffsetX, Math.min(group.maxOffsetX, x)),
    y: Math.max(group.minOffsetY, Math.min(group.maxOffsetY, y)),
  };
  return clampVectorMagnitude(bounded.x, bounded.y, maxLag);
}

function applyOffset(group: GroupState, x: number, y: number) {
  const clamped = clampOffset(group, x, y);
  group.offsetX = clamped.x;
  group.offsetY = clamped.y;
  group.wrapper.style.setProperty("--sticker-drag-x", `${clamped.x}px`);
  group.wrapper.style.setProperty("--sticker-drag-y", `${clamped.y}px`);
  const rotate = Math.max(-10, Math.min(10, clamped.x * 0.035 - clamped.y * 0.02));
  group.wrapper.style.setProperty("--sticker-drag-rotate", `${rotate}deg`);
}

function unmountGroup(group: GroupState) {
  for (const restore of group.restores) {
    const { el, parent, nextSibling, left, top, pointerEvents, touchAction } =
      restore;

    el.classList.remove("sticker-drag-part");
    if (left) el.style.left = left;
    else el.style.removeProperty("left");
    if (top) el.style.top = top;
    else el.style.removeProperty("top");
    if (pointerEvents) el.style.pointerEvents = pointerEvents;
    else el.style.removeProperty("pointer-events");
    if (touchAction) el.style.touchAction = touchAction;
    else el.style.removeProperty("touch-action");

    if (nextSibling && nextSibling.parentNode === parent) {
      parent.insertBefore(el, nextSibling);
    } else {
      parent.appendChild(el);
    }
  }

  if (group.container) {
    if (group.containerDisplay) group.container.style.display = group.containerDisplay;
    else group.container.style.removeProperty("display");
  }

  group.wrapper.remove();
}

function mountGroup(root: HTMLElement, group: StickerGroup): GroupState | null {
  const members = group.members
    .map((id) => root.querySelector<HTMLElement>(`[data-node-id="${id}"]`))
    .filter((el): el is HTMLElement => el !== null);

  if (members.length === 0) return null;

  const boundsEl = root.querySelector<HTMLElement>(
    `[data-node-id="${group.boundsId}"]`,
  );
  if (!boundsEl) return null;

  const existing = boundsEl.querySelector<HTMLElement>(
    `[data-sticker-group="${group.id}"][data-sticker-wrapper="true"]`,
  );
  if (existing) {
    const ox =
      Number.parseFloat(existing.style.getPropertyValue("--sticker-drag-x")) || 0;
    const oy =
      Number.parseFloat(existing.style.getPropertyValue("--sticker-drag-y")) || 0;
    const homeLeft = Number.parseFloat(existing.style.left) || 0;
    const homeTop = Number.parseFloat(existing.style.top) || 0;
    const w = existing.offsetWidth;
    const h = existing.offsetHeight;
    return {
      id: group.id,
      wrapper: existing,
      boundsEl,
      container: null,
      containerDisplay: "",
      restores: [],
      homeLeft,
      homeTop,
      wrapperWidth: w,
      wrapperHeight: h,
      offsetX: ox,
      offsetY: oy,
      ...computeDragLimits(
        boundsEl.offsetWidth,
        getStickerBoundsHeight(root, boundsEl),
        homeLeft,
        homeTop,
        w,
        h,
      ),
    };
  }

  boundsEl.classList.add("sticker-bounds");

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const restores: MemberRestore[] = [];

  const boxes = members.map((el) => {
    restores.push({
      el,
      parent: el.parentElement as HTMLElement,
      nextSibling: el.nextSibling,
      left: el.style.left,
      top: el.style.top,
      pointerEvents: el.style.pointerEvents,
      touchAction: el.style.touchAction,
    });

    el.removeAttribute("data-motion");
    delete el.dataset.stickerDraggable;
    delete el.dataset.stickerGroup;

    const rect = getDesignRect(root, el, boundsEl);
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.w);
    maxY = Math.max(maxY, rect.y + rect.h);

    return { el, x: rect.x, y: rect.y, w: rect.w, h: rect.h };
  });

  const width = maxX - minX;
  const height = maxY - minY;

  const wrapper = document.createElement("div");
  wrapper.className = "sticker-drag-group sticker-is-following";
  wrapper.dataset.stickerGroup = group.id;
  wrapper.dataset.stickerWrapper = "true";
  wrapper.style.position = "absolute";
  wrapper.style.left = `${minX}px`;
  wrapper.style.top = `${minY}px`;
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.setProperty("--sticker-drag-x", "0px");
  wrapper.style.setProperty("--sticker-drag-y", "0px");

  boundsEl.appendChild(wrapper);

  for (const { el, x, y } of boxes) {
    el.classList.add("sticker-drag-part");
    el.style.left = `${x - minX}px`;
    el.style.top = `${y - minY}px`;
    el.style.pointerEvents = "none";
    wrapper.appendChild(el);
  }

  const container = root.querySelector<HTMLElement>(`[data-node-id="${group.id}"]`);
  const containerDisplay = container?.style.display ?? "";
  if (container && !members.includes(container)) {
    container.style.display = "none";
  }

  const limits = computeDragLimits(
    boundsEl.offsetWidth,
    getStickerBoundsHeight(root, boundsEl),
    minX,
    minY,
    width,
    height,
  );

  return {
    id: group.id,
    wrapper,
    boundsEl,
    container: container && !members.includes(container) ? container : null,
    containerDisplay,
    restores,
    homeLeft: minX,
    homeTop: minY,
    wrapperWidth: width,
    wrapperHeight: height,
    offsetX: 0,
    offsetY: 0,
    ...limits,
  };
}

function isPointInsideBounds(
  boundsEl: HTMLElement,
  x: number,
  y: number,
  maxHeight = boundsEl.offsetHeight,
) {
  const w = boundsEl.offsetWidth;
  return x >= 0 && y >= 0 && x <= w && y <= maxHeight;
}

function pickActiveInCluster(
  cluster: GroupState[],
  x: number,
  y: number,
): GroupState {
  if (cluster.length === 1) return cluster[0];

  let best = cluster[0];
  let bestDist = Infinity;
  for (const group of cluster) {
    const cx = group.homeLeft + group.wrapperWidth / 2;
    const cy = group.homeTop + group.wrapperHeight / 2;
    const dist = Math.hypot(x - cx, y - cy);
    if (dist < bestDist) {
      bestDist = dist;
      best = group;
    }
  }
  return best;
}

function pickActiveGroup(
  groups: GroupState[],
  root: HTMLElement,
  clientX: number,
  clientY: number,
): GroupState | null {
  const containing = groups.filter((group) => {
    const pos = getDesignPoint(root, clientX, clientY, group.boundsEl);
    const maxHeight = getStickerBoundsHeight(root, group.boundsEl);
    return isPointInsideBounds(group.boundsEl, pos.x, pos.y, maxHeight);
  });

  if (containing.length === 0) return null;

  const byBounds = new Map<HTMLElement, GroupState[]>();
  for (const group of containing) {
    const list = byBounds.get(group.boundsEl) ?? [];
    list.push(group);
    byBounds.set(group.boundsEl, list);
  }

  let bestBounds: HTMLElement | null = null;
  let bestArea = Infinity;
  for (const boundsEl of byBounds.keys()) {
    const area = boundsEl.offsetWidth * boundsEl.offsetHeight;
    if (area < bestArea) {
      bestArea = area;
      bestBounds = boundsEl;
    }
  }

  if (!bestBounds) return null;

  const cluster = byBounds.get(bestBounds) ?? [];
  const pos = getDesignPoint(root, clientX, clientY, bestBounds);
  return pickActiveInCluster(cluster, pos.x, pos.y);
}

export function initDraggableStickers(root: HTMLElement): Cleanup {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const groups = STICKER_GROUPS.map((g) => mountGroup(root, g)).filter(
    (g): g is GroupState => g !== null,
  );

  if (groups.length === 0) return () => undefined;

  const targetOffset = new Map<string, { x: number; y: number }>();
  for (const group of groups) {
    targetOffset.set(group.id, { x: 0, y: 0 });
  }

  let followRaf = 0;
  let activeId: string | null = null;
  const prevCursor = new Map<string, { x: number; y: number }>();

  const refreshLimits = (group: GroupState) => {
    const limits = computeDragLimits(
      group.boundsEl.offsetWidth,
      getStickerBoundsHeight(root, group.boundsEl),
      group.homeLeft,
      group.homeTop,
      group.wrapperWidth,
      group.wrapperHeight,
    );
    Object.assign(group, limits);
  };

  const onMouseMove = (e: MouseEvent) => {
    for (const group of groups) refreshLimits(group);

    const active = pickActiveGroup(groups, root, e.clientX, e.clientY);
    activeId = active?.id ?? null;

    for (const group of groups) {
      if (group.id !== activeId) {
        targetOffset.set(group.id, { x: 0, y: 0 });
        continue;
      }

      const pos = getDesignPoint(root, e.clientX, e.clientY, group.boundsEl);
      const maxHeight = getStickerBoundsHeight(root, group.boundsEl);
      const cursorY = Math.min(pos.y, maxHeight);
      const prev = prevCursor.get(group.boundsEl.dataset.nodeId ?? group.id) ?? {
        x: pos.x,
        y: cursorY,
      };
      const follow = computeFollowTarget(
        group,
        pos.x,
        cursorY,
        prev.x,
        prev.y,
      );
      prevCursor.set(group.boundsEl.dataset.nodeId ?? group.id, {
        x: pos.x,
        y: cursorY,
      });
      targetOffset.set(group.id, clampOffset(group, follow.x, follow.y));
    }
  };

  const followTick = () => {
    for (const group of groups) {
      const target =
        group.id === activeId
          ? (targetOffset.get(group.id) ?? { x: 0, y: 0 })
          : { x: 0, y: 0 };
      const nextX = group.offsetX + (target.x - group.offsetX) * FOLLOW_LERP;
      const nextY = group.offsetY + (target.y - group.offsetY) * FOLLOW_LERP;
      applyOffset(group, nextX, nextY);
    }
    followRaf = window.requestAnimationFrame(followTick);
  };

  if (!reduced) {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    followRaf = window.requestAnimationFrame(followTick);
  }

  return () => {
    window.cancelAnimationFrame(followRaf);
    window.removeEventListener("mousemove", onMouseMove);

    for (const group of groups) {
      if (group.restores.length > 0) unmountGroup(group);
      else group.wrapper.remove();
    }
  };
}
