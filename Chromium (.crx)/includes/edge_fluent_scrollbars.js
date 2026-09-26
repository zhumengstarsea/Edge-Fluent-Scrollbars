(() => {
  "use strict";

  const HOST_ID = "edge-fluent-scrollbars";
  const PAGE_STYLE_ID = "edge-fluent-scrollbar-page-style";
  const THEME_ATTRIBUTE = "data-edge-fluent-theme";
  const BASE_MIN_THUMB_LENGTH = 17;
  const BASE_SCROLLBAR_SIZE = 15;
  const BASE_THUMB_SIZE = 9;
  const BASE_BUTTON_LENGTH = 18;
  const BASE_ARROW_WIDTH = 7;
  const BASE_ARROW_HEIGHT = 4;
  const IDLE_THICKNESS_SCALE = 0.4;
  const SCROLLING_TIMEOUT = 750;

  if (window.__edgeFluentScrollbarsInstalled) {
    return;
  }
  window.__edgeFluentScrollbarsInstalled = true;

  const calculateScrollbarGeometry = () => {
    const scale = Math.max(1, window.devicePixelRatio || 1);
    const scrollbarDevicePixels = Math.max(1, Math.round(BASE_SCROLLBAR_SIZE * scale));
    let thumbDevicePixels = Math.max(1, Math.round(BASE_THUMB_SIZE * scale));

    // Match Chromium: keep the remaining physical pixels even so the thumb is
    // centered exactly instead of leaving a one-pixel imbalance at some scales.
    thumbDevicePixels -= (scrollbarDevicePixels - thumbDevicePixels) % 2;
    thumbDevicePixels = Math.max(1, thumbDevicePixels);

    const minimalThumbDevicePixels = Math.max(
      1,
      Math.ceil(thumbDevicePixels * IDLE_THICKNESS_SCALE)
    );
    const trackInsetDevicePixels = Math.max(1, Math.round(scale));
    const minThumbLengthDevicePixels = Math.max(
      1,
      Math.round(BASE_MIN_THUMB_LENGTH * scale)
    );
    const buttonLengthDevicePixels = Math.max(
      1,
      Math.round(BASE_BUTTON_LENGTH * scale)
    );
    const arrowWidthDevicePixels = Math.max(1, Math.round(BASE_ARROW_WIDTH * scale));
    const arrowHeightDevicePixels = Math.max(1, Math.round(BASE_ARROW_HEIGHT * scale));

    return {
      scale,
      scrollbarSize: scrollbarDevicePixels / scale,
      thumbSize: thumbDevicePixels / scale,
      minimalThumbSize: minimalThumbDevicePixels / scale,
      thumbGap: (scrollbarDevicePixels - thumbDevicePixels) / 2 / scale,
      trackInset: trackInsetDevicePixels / scale,
      minThumbLength: minThumbLengthDevicePixels / scale,
      buttonLength: buttonLengthDevicePixels / scale,
      arrowWidth: arrowWidthDevicePixels / scale,
      arrowHeight: arrowHeightDevicePixels / scale,
      separatorSize: 1 / scale
    };
  };

  const whenDocumentElementExists = (callback) => {
    if (document.documentElement) {
      callback();
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.documentElement) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(document, { childList: true });
  };

  whenDocumentElementExists(install);

  function install() {
    if (document.getElementById(HOST_ID)) {
      return;
    }

    const systemTheme = matchMedia("(prefers-color-scheme: dark)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let scrollbarGeometry = calculateScrollbarGeometry();

    const pageStyle = document.createElement("style");
    pageStyle.id = PAGE_STYLE_ID;
    pageStyle.textContent = `
      html,
      body {
        scrollbar-width: none !important;
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      /* Preserve the site's scrollbar visibility and size. Custom scrollbar
         widgets hide their native bar with scrollbar-width: none, display:
         none, or a zero width/height; overriding those creates a second bar.
         Non-auto CSS scrollbar-width/color also intentionally take precedence
         over these legacy pseudo-element styles in Chromium. */
      html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar {
        background: transparent !important;
      }

      html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar-track,
      html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar-corner {
        border: var(--edge-fluent-track-inset) solid transparent !important;
        background-clip: padding-box !important;
        background: transparent !important;
      }

      html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar-track:hover {
        background: var(--edge-fluent-track) !important;
      }

      html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar-thumb {
        min-width: var(--edge-fluent-min-thumb-length) !important;
        min-height: var(--edge-fluent-min-thumb-length) !important;
        border: calc((var(--edge-fluent-scrollbar-size) - var(--edge-fluent-minimal-thumb-size)) / 2) solid transparent !important;
        border-radius: 999px !important;
        background: var(--edge-fluent-thumb) content-box !important;
        box-shadow: none !important;
      }

      html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar-thumb:hover {
        border-width: var(--edge-fluent-thumb-gap) !important;
        background-color: var(--edge-fluent-thumb-hover) !important;
      }

      html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar-thumb:active {
        border-width: var(--edge-fluent-thumb-gap) !important;
        background-color: var(--edge-fluent-thumb-pressed) !important;
      }

      html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar-button {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      html[${THEME_ATTRIBUTE}="light"] {
        --edge-fluent-track: #f1f1f1;
        --edge-fluent-thumb: rgba(0, 0, 0, 0.447);
        --edge-fluent-thumb-hover: rgba(0, 0, 0, 0.302);
        --edge-fluent-thumb-pressed: rgba(0, 0, 0, 0.502);
      }

      html[${THEME_ATTRIBUTE}="dark"] {
        --edge-fluent-track: #424242;
        --edge-fluent-thumb: rgba(255, 255, 255, 0.545);
        --edge-fluent-thumb-hover: rgba(255, 255, 255, 0.302);
        --edge-fluent-thumb-pressed: rgba(255, 255, 255, 0.502);
      }

      @media (forced-colors: active) {
        html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar-track:hover {
          background: Canvas !important;
        }

        html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar-thumb {
          background-color: CanvasText !important;
        }

        html[${THEME_ATTRIBUTE}] *:not(html):not(body)::-webkit-scrollbar-thumb:active {
          background-color: Highlight !important;
        }
      }
    `;
    document.documentElement.append(pageStyle);

    const host = document.createElement("div");
    host.id = HOST_ID;
    host.setAttribute("aria-hidden", "true");
    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = `
      <style>
        :host {
          all: initial !important;
          position: fixed !important;
          inset: 0 !important;
          z-index: 2147483647 !important;
          pointer-events: none !important;
          contain: strict !important;
          color-scheme: light;
          --track: #fcfcfc;
          --separator: #ededed;
          --thumb-minimal: rgba(0, 0, 0, 0.447);
          --thumb: #8b8b8b;
          --thumb-hover: #747474;
          --thumb-pressed: #5f5f5f;
          --arrow: #8b8b8b;
          --button-hover: #e8e8e8;
          --bar-size: 15px;
          --thumb-size: 9px;
          --minimal-thumb-size: 4px;
          --thumb-gap: 3px;
          --track-inset: 1px;
          --min-thumb-length: 17px;
          --button-length: 18px;
          --arrow-width: 7px;
          --arrow-height: 4px;
          --separator-size: 1px;
        }

        :host(.dark) {
          color-scheme: dark;
          --track: #2c2c2c;
          --separator: #343434;
          --thumb-minimal: rgba(255, 255, 255, 0.545);
          --thumb: #9f9f9f;
          --thumb-hover: #b4b4b4;
          --thumb-pressed: #c7c7c7;
          --arrow: #9f9f9f;
          --button-hover: #383838;
        }

        .bar {
          position: fixed;
          box-sizing: border-box;
          display: none;
          pointer-events: none;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }

        .bar.visible {
          display: block;
        }

        .bar.scrolling,
        .bar:hover,
        .bar.dragging {
          pointer-events: auto;
        }

        .vertical {
          top: 0;
          right: 0;
          bottom: 0;
          width: var(--bar-size);
        }

        .horizontal {
          right: 0;
          bottom: 0;
          left: 0;
          height: var(--bar-size);
        }

        .bar::before {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--track);
          opacity: 0;
          pointer-events: none;
          transition: opacity 100ms ease;
        }

        .vertical::before {
          box-shadow: inset calc(var(--separator-size) * -1) 0 var(--separator);
        }

        .horizontal::before {
          box-shadow: inset 0 calc(var(--separator-size) * -1) var(--separator);
        }

        .bar:hover::before,
        .bar.dragging::before {
          opacity: 1;
        }

        .track {
          position: absolute;
          pointer-events: none;
        }

        .vertical .track {
          top: var(--button-length);
          right: 0;
          bottom: var(--button-length);
          left: 0;
        }

        .horizontal .track {
          top: 0;
          right: var(--button-length);
          bottom: 0;
          left: var(--button-length);
        }

        .bar:hover .track,
        .bar.dragging .track {
          pointer-events: auto;
        }

        .scroll-button {
          all: unset;
          position: absolute;
          box-sizing: border-box;
          display: grid;
          place-items: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 100ms ease, background-color 100ms ease;
        }

        .bar:hover .scroll-button,
        .bar.dragging .scroll-button {
          opacity: 1;
          pointer-events: auto;
        }

        .scroll-button:hover {
          background: var(--button-hover);
        }

        .scroll-button::after {
          content: "";
          width: var(--arrow-width);
          height: var(--arrow-height);
          background: var(--arrow);
        }

        .vertical .scroll-button {
          right: 0;
          left: 0;
          height: var(--button-length);
        }

        .vertical .decrement {
          top: 0;
        }

        .vertical .increment {
          bottom: 0;
        }

        .vertical .decrement::after {
          clip-path: polygon(50% 0, 100% 100%, 0 100%);
        }

        .vertical .increment::after {
          clip-path: polygon(0 0, 100% 0, 50% 100%);
        }

        .horizontal .scroll-button {
          top: 0;
          bottom: 0;
          width: var(--button-length);
        }

        .horizontal .decrement {
          left: 0;
        }

        .horizontal .increment {
          right: 0;
        }

        .horizontal .scroll-button::after {
          width: var(--arrow-height);
          height: var(--arrow-width);
        }

        .horizontal .decrement::after {
          clip-path: polygon(100% 0, 100% 100%, 0 50%);
        }

        .horizontal .increment::after {
          clip-path: polygon(0 0, 100% 50%, 0 100%);
        }

        .thumb {
          position: absolute;
          box-sizing: border-box;
          border-radius: 999px;
          background: var(--thumb-minimal);
          opacity: 0;
          pointer-events: none;
          transition: opacity 100ms ease, width 100ms ease, height 100ms ease,
            background-color 100ms ease;
          will-change: transform;
        }

        .vertical .thumb {
          right: var(--thumb-gap);
          width: var(--minimal-thumb-size);
          min-height: var(--min-thumb-length);
        }

        .horizontal .thumb {
          bottom: var(--thumb-gap);
          height: var(--minimal-thumb-size);
          min-width: var(--min-thumb-length);
        }

        .bar.scrolling .thumb,
        .bar:hover .thumb,
        .bar.dragging .thumb {
          opacity: 1;
        }

        .vertical:hover .thumb,
        .vertical.dragging .thumb {
          width: var(--thumb-size);
          background: var(--thumb);
          pointer-events: auto;
        }

        .horizontal:hover .thumb,
        .horizontal.dragging .thumb {
          height: var(--thumb-size);
          background: var(--thumb);
          pointer-events: auto;
        }

        .bar .thumb:hover {
          background: var(--thumb-hover);
        }

        .bar.dragging .thumb,
        .bar .thumb:active {
          background: var(--thumb-pressed);
        }

        :host(.reduced-motion) .bar,
        :host(.reduced-motion) .track,
        :host(.reduced-motion) .thumb,
        :host(.reduced-motion) .scroll-button {
          transition: none;
        }

        @media (forced-colors: active) {
          :host {
            --track: Canvas;
            --separator: CanvasText;
            --thumb-minimal: CanvasText;
            --thumb: CanvasText;
            --thumb-hover: CanvasText;
            --thumb-pressed: Highlight;
            --arrow: CanvasText;
            --button-hover: Highlight;
          }

          .bar::before,
          .track,
          .thumb,
          .scroll-button,
          .scroll-button::after {
            forced-color-adjust: none;
          }
        }
      </style>
      <div class="bar vertical" part="vertical-scrollbar">
        <button class="scroll-button decrement" tabindex="-1" aria-hidden="true"></button>
        <div class="track"><div class="thumb"></div></div>
        <button class="scroll-button increment" tabindex="-1" aria-hidden="true"></button>
      </div>
      <div class="bar horizontal" part="horizontal-scrollbar">
        <button class="scroll-button decrement" tabindex="-1" aria-hidden="true"></button>
        <div class="track"><div class="thumb"></div></div>
        <button class="scroll-button increment" tabindex="-1" aria-hidden="true"></button>
      </div>
    `;
    document.documentElement.append(host);

    const applyScrollbarGeometry = () => {
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty("--edge-fluent-scrollbar-size", `${scrollbarGeometry.scrollbarSize}px`, "important");
      rootStyle.setProperty("--edge-fluent-minimal-thumb-size", `${scrollbarGeometry.minimalThumbSize}px`, "important");
      rootStyle.setProperty("--edge-fluent-thumb-gap", `${scrollbarGeometry.thumbGap}px`, "important");
      rootStyle.setProperty("--edge-fluent-track-inset", `${scrollbarGeometry.trackInset}px`, "important");
      rootStyle.setProperty("--edge-fluent-min-thumb-length", `${scrollbarGeometry.minThumbLength}px`, "important");
      host.style.setProperty("--bar-size", `${scrollbarGeometry.scrollbarSize}px`);
      host.style.setProperty("--thumb-size", `${scrollbarGeometry.thumbSize}px`);
      host.style.setProperty("--minimal-thumb-size", `${scrollbarGeometry.minimalThumbSize}px`);
      host.style.setProperty("--thumb-gap", `${scrollbarGeometry.thumbGap}px`);
      host.style.setProperty("--track-inset", `${scrollbarGeometry.trackInset}px`);
      host.style.setProperty("--min-thumb-length", `${scrollbarGeometry.minThumbLength}px`);
      host.style.setProperty("--button-length", `${scrollbarGeometry.buttonLength}px`);
      host.style.setProperty("--arrow-width", `${scrollbarGeometry.arrowWidth}px`);
      host.style.setProperty("--arrow-height", `${scrollbarGeometry.arrowHeight}px`);
      host.style.setProperty("--separator-size", `${scrollbarGeometry.separatorSize}px`);
    };
    applyScrollbarGeometry();

    const verticalBar = shadow.querySelector(".vertical");
    const horizontalBar = shadow.querySelector(".horizontal");
    const verticalTrack = verticalBar.querySelector(".track");
    const horizontalTrack = horizontalBar.querySelector(".track");
    const verticalThumb = verticalBar.querySelector(".thumb");
    const horizontalThumb = horizontalBar.querySelector(".thumb");
    const verticalButtons = verticalBar.querySelectorAll(".scroll-button");
    const horizontalButtons = horizontalBar.querySelectorAll(".scroll-button");
    const bars = [verticalBar, horizontalBar];

    let frameRequested = false;
    let scrollingTimer = 0;
    let themeTimer = 0;
    let dragState = null;
    let lastMetrics = null;
    let repeatDelayTimer = 0;
    let repeatIntervalTimer = 0;

    const getRoot = () => document.scrollingElement || document.documentElement;

    const getMetrics = () => {
      const root = getRoot();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      // Descendant/body overflow can belong to a nested application scroller.
      // Only the actual scrolling element determines the document's range.
      const contentWidth = root.scrollWidth;
      const contentHeight = root.scrollHeight;
      const rootStyle = getComputedStyle(document.documentElement);
      const bodyStyle = document.body ? getComputedStyle(document.body) : null;
      // In HTML, body overflow is propagated to the viewport when both root
      // axes are visible. Respect hidden/clip app shells instead of drawing a
      // document bar for a range that cannot be scrolled by the user.
      const viewportStyle = rootStyle.overflowX === "visible" &&
        rootStyle.overflowY === "visible" && bodyStyle ? bodyStyle : rootStyle;
      const allowsScrollbar = (overflow) => overflow !== "hidden" && overflow !== "clip";
      const maxX = Math.max(0, contentWidth - viewportWidth);
      const maxY = Math.max(0, contentHeight - viewportHeight);

      return {
        root,
        viewportWidth,
        viewportHeight,
        contentWidth,
        contentHeight,
        maxX,
        maxY,
        scrollLeft: Math.max(0, root?.scrollLeft ?? window.scrollX),
        scrollTop: Math.max(0, root?.scrollTop ?? window.scrollY),
        needsHorizontal: maxX > 1 && allowsScrollbar(viewportStyle.overflowX),
        needsVertical: maxY > 1 && allowsScrollbar(viewportStyle.overflowY)
      };
    };

    const updateLayout = () => {
      frameRequested = false;
      const metrics = getMetrics();
      lastMetrics = metrics;

      verticalBar.classList.toggle("visible", metrics.needsVertical);
      horizontalBar.classList.toggle("visible", metrics.needsHorizontal);
      verticalBar.style.bottom = metrics.needsHorizontal ? `${scrollbarGeometry.scrollbarSize}px` : "0";
      horizontalBar.style.right = metrics.needsVertical ? `${scrollbarGeometry.scrollbarSize}px` : "0";

      if (metrics.needsVertical) {
        const trackLength = Math.max(
          1,
          metrics.viewportHeight -
            (metrics.needsHorizontal ? scrollbarGeometry.scrollbarSize : 0) -
            2 * scrollbarGeometry.buttonLength
        );
        const thumbLength = Math.min(
          trackLength,
          Math.max(scrollbarGeometry.minThumbLength, trackLength * metrics.viewportHeight / metrics.contentHeight)
        );
        const travel = Math.max(0, trackLength - thumbLength);
        const position = metrics.maxY ? travel * Math.min(1, metrics.scrollTop / metrics.maxY) : 0;
        verticalThumb.style.height = `${thumbLength}px`;
        verticalThumb.style.transform = `translate3d(0, ${position}px, 0)`;
      }

      if (metrics.needsHorizontal) {
        const trackLength = Math.max(
          1,
          metrics.viewportWidth -
            (metrics.needsVertical ? scrollbarGeometry.scrollbarSize : 0) -
            2 * scrollbarGeometry.buttonLength
        );
        const thumbLength = Math.min(
          trackLength,
          Math.max(scrollbarGeometry.minThumbLength, trackLength * metrics.viewportWidth / metrics.contentWidth)
        );
        const travel = Math.max(0, trackLength - thumbLength);
        const position = metrics.maxX ? travel * Math.min(1, metrics.scrollLeft / metrics.maxX) : 0;
        horizontalThumb.style.width = `${thumbLength}px`;
        horizontalThumb.style.transform = `translate3d(${position}px, 0, 0)`;
      }
    };

    const scheduleLayout = () => {
      if (!frameRequested) {
        frameRequested = true;
        requestAnimationFrame(updateLayout);
      }
    };

    const showDuringScroll = () => {
      bars.forEach((bar) => bar.classList.add("scrolling"));
      clearTimeout(scrollingTimer);
      scrollingTimer = window.setTimeout(() => {
        bars.forEach((bar) => bar.classList.remove("scrolling"));
      }, SCROLLING_TIMEOUT);
    };

    const onScroll = () => {
      scheduleLayout();
      showDuringScroll();
    };

    const getColorScheme = (element) => {
      if (!element) {
        return "";
      }
      return getComputedStyle(element).colorScheme.toLowerCase();
    };

    const parseColor = (value) => {
      if (!value || value === "transparent") {
        return null;
      }

      const rgb = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
      if (rgb) {
        const alpha = rgb[4]
          ? (rgb[4].endsWith("%") ? Number.parseFloat(rgb[4]) / 100 : Number.parseFloat(rgb[4]))
          : 1;
        if (alpha <= 0.02) {
          return null;
        }
        return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
      }

      const hex = value.match(/^#([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i);
      if (!hex) {
        return null;
      }
      let digits = hex[1];
      if (digits.length === 3) {
        digits = digits.split("").map((digit) => digit + digit).join("");
      }
      if (digits.length === 8 && Number.parseInt(digits.slice(6), 16) <= 5) {
        return null;
      }
      return [0, 2, 4].map((offset) => Number.parseInt(digits.slice(offset, offset + 2), 16));
    };

    const luminance = ([red, green, blue]) => {
      const channels = [red, green, blue].map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };

    const colorTheme = (value, invert = false) => {
      const color = parseColor(value);
      if (!color) {
        return null;
      }
      const isDark = luminance(color) < 0.35;
      return invert ? (isDark ? "light" : "dark") : (isDark ? "dark" : "light");
    };

    const detectTheme = () => {
      const schemes = [getColorScheme(document.documentElement), getColorScheme(document.body)];
      for (const scheme of schemes) {
        const hasDark = /(^|\s)dark($|\s)/.test(scheme);
        const hasLight = /(^|\s)light($|\s)/.test(scheme);
        if (hasDark !== hasLight) {
          return hasDark ? "dark" : "light";
        }
      }

      for (const element of [document.body, document.documentElement]) {
        if (!element) {
          continue;
        }
        const theme = colorTheme(getComputedStyle(element).backgroundColor);
        if (theme) {
          return theme;
        }
      }

      for (const themeColor of document.querySelectorAll('meta[name="theme-color"]')) {
        const media = themeColor.media.trim();
        if (!media || matchMedia(media).matches) {
          const metaTheme = colorTheme(themeColor.content);
          if (metaTheme) {
            return metaTheme;
          }
        }
      }

      for (const element of [document.body, document.documentElement]) {
        if (!element) {
          continue;
        }
        const theme = colorTheme(getComputedStyle(element).color, true);
        if (theme) {
          return theme;
        }
      }

      return systemTheme.matches ? "dark" : "light";
    };

    const updateTheme = () => {
      clearTimeout(themeTimer);
      themeTimer = window.setTimeout(() => {
        const theme = detectTheme();
        document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
        host.classList.toggle("dark", theme === "dark");
        host.classList.toggle("reduced-motion", reducedMotion.matches);
      }, 0);
    };

    const scheduleThemeUpdate = () => {
      clearTimeout(themeTimer);
      themeTimer = window.setTimeout(updateTheme, 50);
    };

    const beginDrag = (event, axis) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      updateLayout();

      const metrics = lastMetrics || getMetrics();
      const bar = axis === "y" ? verticalBar : horizontalBar;
      const track = axis === "y" ? verticalTrack : horizontalTrack;
      const thumb = axis === "y" ? verticalThumb : horizontalThumb;
      const trackLength = axis === "y" ? track.clientHeight : track.clientWidth;
      const thumbLength = axis === "y" ? thumb.offsetHeight : thumb.offsetWidth;

      dragState = {
        axis,
        bar,
        pointerId: event.pointerId,
        startPointer: axis === "y" ? event.clientY : event.clientX,
        startScroll: axis === "y" ? metrics.scrollTop : metrics.scrollLeft,
        maxScroll: axis === "y" ? metrics.maxY : metrics.maxX,
        travel: Math.max(1, trackLength - thumbLength)
      };
      bar.classList.add("dragging", "scrolling");
      thumb.setPointerCapture?.(event.pointerId);
    };

    const moveDrag = (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }
      event.preventDefault();
      const pointer = dragState.axis === "y" ? event.clientY : event.clientX;
      const target = dragState.startScroll +
        (pointer - dragState.startPointer) * dragState.maxScroll / dragState.travel;
      if (dragState.axis === "y") {
        window.scrollTo({ top: target, left: getRoot().scrollLeft, behavior: "instant" });
      } else {
        window.scrollTo({ left: target, top: getRoot().scrollTop, behavior: "instant" });
      }
    };

    const endDrag = (event) => {
      if (!dragState || (event.pointerId !== undefined && event.pointerId !== dragState.pointerId)) {
        return;
      }
      dragState.bar.classList.remove("dragging");
      dragState = null;
      showDuringScroll();
    };

    const stopRepeatingScroll = () => {
      clearTimeout(repeatDelayTimer);
      clearInterval(repeatIntervalTimer);
      repeatDelayTimer = 0;
      repeatIntervalTimer = 0;
    };

    const smoothScrollBy = (axis, amount) => {
      window.scrollBy(axis === "y"
        ? { top: amount, behavior: reducedMotion.matches ? "instant" : "smooth" }
        : { left: amount, behavior: reducedMotion.matches ? "instant" : "smooth" });
    };

    const beginRepeatingScroll = (event, action, shouldContinue = () => true) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      stopRepeatingScroll();
      action();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      repeatDelayTimer = window.setTimeout(() => {
        repeatIntervalTimer = window.setInterval(() => {
          if (!shouldContinue()) {
            stopRepeatingScroll();
            return;
          }
          action();
        }, 140);
      }, 400);
    };

    const pageScrollFromTrack = (event, axis) => {
      const thumb = axis === "y" ? verticalThumb : horizontalThumb;
      if (event.target === thumb || event.button !== 0) {
        return;
      }
      const pointer = axis === "y" ? event.clientY : event.clientX;
      const initialRect = thumb.getBoundingClientRect();
      const direction = pointer < (axis === "y" ? initialRect.top : initialRect.left) ? -1 : 1;
      const shouldContinue = () => {
        const rect = thumb.getBoundingClientRect();
        return direction < 0
          ? pointer < (axis === "y" ? rect.top : rect.left)
          : pointer > (axis === "y" ? rect.bottom : rect.right);
      };
      const action = () => {
        if (shouldContinue()) {
          const amount = (axis === "y" ? window.innerHeight : window.innerWidth) * 0.875 * direction;
          smoothScrollBy(axis, amount);
        }
      };
      beginRepeatingScroll(event, action, shouldContinue);
    };

    verticalThumb.addEventListener("pointerdown", (event) => beginDrag(event, "y"));
    horizontalThumb.addEventListener("pointerdown", (event) => beginDrag(event, "x"));
    verticalTrack.addEventListener("pointerdown", (event) => pageScrollFromTrack(event, "y"));
    horizontalTrack.addEventListener("pointerdown", (event) => pageScrollFromTrack(event, "x"));
    verticalButtons.forEach((button, index) => {
      const direction = index === 0 ? -1 : 1;
      button.addEventListener("pointerdown", (event) =>
        beginRepeatingScroll(event, () => smoothScrollBy("y", 40 * direction))
      );
    });
    horizontalButtons.forEach((button, index) => {
      const direction = index === 0 ? -1 : 1;
      button.addEventListener("pointerdown", (event) =>
        beginRepeatingScroll(event, () => smoothScrollBy("x", 40 * direction))
      );
    });
    window.addEventListener("pointermove", moveDrag, { capture: true, passive: false });
    window.addEventListener("pointerup", (event) => {
      endDrag(event);
      stopRepeatingScroll();
    }, true);
    window.addEventListener("pointercancel", (event) => {
      endDrag(event);
      stopRepeatingScroll();
    }, true);
    window.addEventListener("blur", (event) => {
      endDrag(event);
      stopRepeatingScroll();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      const nextGeometry = calculateScrollbarGeometry();
      if (nextGeometry.scale !== scrollbarGeometry.scale) {
        scrollbarGeometry = nextGeometry;
        applyScrollbarGeometry();
      }
      scheduleLayout();
      showDuringScroll();
    }, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      scheduleLayout();
    });
    resizeObserver.observe(document.documentElement);

    const documentObserver = new MutationObserver((mutations) => {
      scheduleLayout();
      if (mutations.some((mutation) =>
        mutation.type === "attributes" ||
        mutation.target instanceof HTMLMetaElement ||
        mutation.addedNodes.length > 0
      )) {
        scheduleThemeUpdate();
      }
      if (document.body) {
        try {
          resizeObserver.observe(document.body);
        } catch (_) {
          // The body can be replaced while a page is loading.
        }
      }
    });
    documentObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "content", "media"],
      childList: true,
      subtree: true
    });

    systemTheme.addEventListener?.("change", updateTheme);
    reducedMotion.addEventListener?.("change", updateTheme);

    updateTheme();
    updateLayout();
    showDuringScroll();
  }
})();
