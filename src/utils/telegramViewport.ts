type TelegramViewport = {
  platform?: string;
  viewportStableHeight?: number;
  isFullscreen?: boolean;
  safeAreaInset?: { top?: number; bottom?: number; left?: number; right?: number };
  contentSafeAreaInset?: { top?: number; bottom?: number; left?: number; right?: number };
  isVersionAtLeast?: (version: string) => boolean;
  requestFullscreen?: () => void;
  onEvent?: (event: string, handler: () => void) => void;
  offEvent?: (event: string, handler: () => void) => void;
};

const fullscreenRequested = new WeakSet<TelegramViewport>();

export const isTelegramDesktop = (webApp?: TelegramViewport): boolean => {
  if (webApp?.platform === "tdesktop" || webApp?.platform === "macos") return true;
  return ["web", "weba", "webk"].includes(webApp?.platform || "")
    && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
};

export const configureDesktopViewport = (webApp: TelegramViewport): (() => void) => {
  if (!isTelegramDesktop(webApp)) return () => {};

  const style = document.documentElement.style;
  const syncViewport = () => {
    if (webApp.viewportStableHeight && webApp.viewportStableHeight > 0) {
      style.setProperty("--telegram-desktop-height", `${webApp.viewportStableHeight}px`);
    } else {
      style.removeProperty("--telegram-desktop-height");
    }
    for (const edge of ["top", "bottom", "left", "right"] as const) {
      const inset = (webApp.safeAreaInset?.[edge] || 0)
        + (webApp.contentSafeAreaInset?.[edge] || 0);
      style.setProperty(`--telegram-desktop-${edge}`, `${inset}px`);
    }
  };
  const events = ["viewportChanged", "fullscreenChanged", "safeAreaChanged", "contentSafeAreaChanged"];
  syncViewport();
  events.forEach(event => webApp.onEvent?.(event, syncViewport));

  // Desktop clients may reject fullscreen. Keep the compact layout either way.
  if (!webApp.isFullscreen && webApp.requestFullscreen
    && webApp.isVersionAtLeast?.("8.0") && !fullscreenRequested.has(webApp)) {
    fullscreenRequested.add(webApp);
    try {
      webApp.requestFullscreen();
    } catch (error) {
      console.info("Telegram fullscreen unavailable; using the compact desktop layout.", error);
    }
  }

  return () => {
    events.forEach(event => webApp.offEvent?.(event, syncViewport));
    ["height", "top", "bottom", "left", "right"].forEach(name => {
      style.removeProperty(`--telegram-desktop-${name}`);
    });
  };
};
