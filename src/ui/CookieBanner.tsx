import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  COOKIE_CONSENT_URL,
  PRIVACY_POLICY_URL,
} from "../config/legalUrls";

const STORAGE_KEY = "alabuga-it-cookie-consent";

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      document.documentElement.dataset.cookieBanner = "open";
    } else {
      delete document.documentElement.dataset.cookieBanner;
    }
    return () => {
      delete document.documentElement.dataset.cookieBanner;
    };
  }, [mounted, visible]);

  const accept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return createPortal(
    <div className="cookie-banner" role="dialog" aria-label="Согласие на использование cookie">
      <p className="cookie-banner__text">
        Мы используем cookie для анализа активности пользователей на сайте. Продолжая пользоваться
        сайтом, Вы даёте{" "}
        <a href={COOKIE_CONSENT_URL} target="_blank" rel="noopener noreferrer">
          согласие на обработку персональных данных, получаемых посредством cookie-файлов
        </a>
        , и соглашаетесь с{" "}
        <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
          Политикой обработки персональных данных
        </a>
        . Вы можете отключить cookie в настройках вашего браузера.
      </p>
      <button type="button" className="cookie-banner__btn" onClick={accept}>
        Согласен
      </button>
    </div>,
    document.body,
  );
}
