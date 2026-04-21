"use client";

import { useEffect } from "react";

type FlashBannerProps = {
  message: string;
  tone?: "info" | "success" | "danger";
  onClose?: () => void;
};

export function FlashBanner({
  message,
  tone = "info",
  onClose,
}: FlashBannerProps) {
  useEffect(() => {
    if (!onClose) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [onClose]);

  return (
    <div className="flash-container">
      <div className={`flash-banner flash-${tone}`}>
        <span>{message}</span>
        {onClose ? (
          <button className="flash-close" onClick={onClose} type="button">
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
