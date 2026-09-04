import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getElementScrollTop,
  getScrollOrigin,
  SCROLL_ORIGIN_EVENT,
  shouldShowScrollBack,
} from "./scrollBack";
import { onPageScroll, scrollPageTo } from "../landing/motion";

const RECHECK_DELAYS_MS = [120, 400, 900, 1700];

export default function FormScrollBackButton() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timers = new Set<number>();

    const update = () => {
      const origin = getScrollOrigin();
      if (!origin || !document.contains(origin)) {
        setVisible(false);
        return;
      }

      setVisible(shouldShowScrollBack(origin));
    };

    const scheduleRechecks = () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      RECHECK_DELAYS_MS.forEach((delay) => {
        timers.add(window.setTimeout(update, delay));
      });
    };

    const onOriginChange = () => {
      update();
      scheduleRechecks();
    };

    const offScroll = onPageScroll(update);
    window.addEventListener(SCROLL_ORIGIN_EVENT, onOriginChange);
    window.addEventListener("resize", update);
    update();

    return () => {
      offScroll();
      window.removeEventListener(SCROLL_ORIGIN_EVENT, onOriginChange);
      window.removeEventListener("resize", update);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  if (!mounted || !visible) return null;

  return createPortal(
    <button
      type="button"
      className="form-scroll-back"
      aria-label="Вернуться к предыдущему блоку"
      onClick={() => {
        const origin = getScrollOrigin();
        if (!origin) return;
        scrollPageTo(getElementScrollTop(origin));
      }}
    >
      <img src="/assets/icons/arrow-left.svg" alt="" aria-hidden="true" />
    </button>,
    document.body,
  );
}
