window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  setTimeout(() => {
    if (preloader) preloader.classList.add("hidden");
  }, 550);
});

const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");
const syncThemeIcon = () => {
  if (!themeToggle) return;
  const isDark = root.getAttribute("data-theme") === "dark";
  themeToggle.innerHTML = isDark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
};
const applyTheme = (nextTheme, broadcast = false) => {
  if (nextTheme !== "dark" && nextTheme !== "light") return;
  if (root.getAttribute("data-theme") === nextTheme) return;
  root.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
  syncThemeIcon();
  if (!broadcast) return;
  window.postMessage({ type: "bootstrap5-theme-sync", theme: nextTheme }, window.location.origin);
};
if (savedTheme === "dark" || savedTheme === "light") {
  root.setAttribute("data-theme", savedTheme);
} else {
  root.setAttribute("data-theme", "dark");
  localStorage.setItem("theme", "dark");
}
syncThemeIcon();
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
  });
}
window.addEventListener("storage", (event) => {
  if (event.key !== "theme") return;
  const nextTheme = event.newValue;
  if (nextTheme === "dark" || nextTheme === "light") applyTheme(nextTheme, false);
});
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  const data = event.data;
  if (!data || data.type !== "bootstrap5-theme-sync") return;
  if (data.theme === "dark" || data.theme === "light") applyTheme(data.theme, false);
});

const initScrambledText = () => {
  const targets = document.querySelectorAll("[data-scrambled-text]");
  if (!targets.length) return;

  const pointer = { x: -9999, y: -9999 };
  const onPointerMove = (x, y) => {
    pointer.x = x;
    pointer.y = y;
  };
  window.addEventListener("mousemove", (ev) => onPointerMove(ev.clientX, ev.clientY));
  window.addEventListener(
    "touchmove",
    (ev) => {
      const touch = ev.touches[0];
      if (!touch) return;
      onPointerMove(touch.clientX, touch.clientY);
    },
    { passive: true }
  );

  const configs = [];
  targets.forEach((el) => {
    const text = (el.textContent || "").trim();
    if (!text) return;

    const radius = Number(el.getAttribute("data-radius") || 100);
    const duration = Number(el.getAttribute("data-duration") || 1.2) * 1000;
    const speed = Number(el.getAttribute("data-speed") || 0.5);
    const scrambleChars = el.getAttribute("data-scramble-chars") || ".:";

    el.innerHTML = "";
    const chars = [];
    const states = [];

    for (const ch of text) {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch === " " ? "\u00A0" : ch;
      el.appendChild(span);

      chars.push({ el: span, original: ch });
      states.push({
        activeUntil: 0,
        lastUpdate: 0,
      });
    }

    const srOnly = document.createElement("span");
    srOnly.className = "sr-only";
    srOnly.textContent = text;
    el.appendChild(srOnly);

    configs.push({ el, chars, states, radius, duration, speed, scrambleChars });
  });

  const randomFrom = (pool) => pool[Math.floor(Math.random() * pool.length)];

  const tick = (now) => {
    configs.forEach((cfg) => {
      const containerRect = cfg.el.getBoundingClientRect();
      const relX = pointer.x - containerRect.left;
      const relY = pointer.y - containerRect.top;
      const updateStepMs = Math.max(18, 80 - cfg.speed * 50);

      cfg.chars.forEach((charObj, i) => {
        const node = charObj.el;
        const original = charObj.original;
        if (original === " ") return;

        const rect = node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - containerRect.left;
        const cy = rect.top + rect.height / 2 - containerRect.top;
        const distance = Math.hypot(relX - cx, relY - cy);

        if (distance <= cfg.radius) {
          const intensity = 1 - distance / cfg.radius;
          const extra = cfg.duration * Math.max(0.35, intensity);
          cfg.states[i].activeUntil = Math.max(cfg.states[i].activeUntil, now + extra);
        }

        const isActive = now < cfg.states[i].activeUntil;
        if (!isActive) {
          if (node.textContent !== original) node.textContent = original;
          return;
        }

        if (now - cfg.states[i].lastUpdate < updateStepMs) return;
        cfg.states[i].lastUpdate = now;

        const remaining = (cfg.states[i].activeUntil - now) / cfg.duration;
        const scrambleChance = Math.min(0.95, Math.max(0.2, remaining + cfg.speed * 0.25));
        const shouldScramble = Math.random() < scrambleChance;
        node.textContent = shouldScramble ? randomFrom(cfg.scrambleChars) : original;
      });
    });

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const initOrbBackground = () => {
  const canvas = document.getElementById("orbCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const orbSize = Number(canvas.dataset.orbSize || 220);
  const orbCount = Number(canvas.dataset.orbCount || 7);
  const lightColor = canvas.dataset.lightColor || "#ffffff";
  const speed = Number(canvas.dataset.speed || 2);
  const noiseIntensity = Number(canvas.dataset.noiseIntensity || 1.75);
  const scale = Number(canvas.dataset.scale || 0.2);
  const rotation = Number(canvas.dataset.rotation || 30) * (Math.PI / 180);

  const orbs = Array.from({ length: Math.max(1, orbCount) }, (_, i) => ({
    index: i,
    phase: Math.random() * Math.PI * 2,
    drift: 0.4 + Math.random() * 0.9,
    radiusMul: 0.72 + Math.random() * 0.55,
  }));

  let rafId = 0;
  let width = 0;
  let height = 0;
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  const colorToRgba = (color, alpha) => {
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      const normalized =
        hex.length === 3
          ? hex
              .split("")
              .map((ch) => ch + ch)
              .join("")
          : hex;
      const r = parseInt(normalized.slice(0, 2), 16) || 255;
      const g = parseInt(normalized.slice(2, 4), 16) || 255;
      const b = parseInt(normalized.slice(4, 6), 16) || 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (color.startsWith("rgb(")) {
      return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
    }
    return `rgba(255, 255, 255, ${alpha})`;
  };

  const resize = () => {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (timeMs) => {
    const t = timeMs * 0.001 * speed;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(rotation);
    ctx.translate(-width / 2, -height / 2);

    const clusterRadius = Math.min(width, height) * (0.22 + scale * 0.55);
    const centerX = width * 0.5;
    const centerY = height * 0.56;

    for (let i = 0; i < orbs.length; i += 1) {
      const orb = orbs[i];
      const angle = orb.phase + t * (0.18 + orb.drift * 0.16);
      const spread = clusterRadius * (0.45 + ((i + 1) / (orbs.length + 1)) * 0.55);
      const x = centerX + Math.cos(angle) * spread;
      const y = centerY + Math.sin(angle * 1.2) * (spread * 0.56);

      const pulse = 0.55 + 0.45 * Math.sin(t * (0.9 + orb.drift * 0.3) + orb.phase);
      const radius = Math.max(42, orbSize * orb.radiusMul * (0.45 + pulse * 0.5));
      const halo = radius * (1.25 + noiseIntensity * 0.25);

      const gradient = ctx.createRadialGradient(x, y, radius * 0.06, x, y, halo);
      gradient.addColorStop(0, colorToRgba(lightColor, 0.24 + pulse * 0.2));
      gradient.addColorStop(0.35, colorToRgba(lightColor, 0.14 + pulse * 0.11));
      gradient.addColorStop(1, colorToRgba(lightColor, 0));

      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.arc(x, y, halo, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
    rafId = requestAnimationFrame(draw);
  };

  resize();
  rafId = requestAnimationFrame(draw);

  window.addEventListener("resize", resize);
  window.addEventListener("pagehide", () => cancelAnimationFrame(rafId), { once: true });
};

initOrbBackground();
initScrambledText();

const plugins = [
  "introduction",
  "plugins",
  "alert",
  "button",
  "carousel",
  "collapse",
  "dropdown",
  "modal",
  "offcanvas",
  "popover",
  "scrollspy",
  "tab",
  "toast",
  "tooltip",
  "preloader",
];

const cleanupBootstrapOverlays = () => {
  document.querySelectorAll(".modal").forEach((modalEl) => {
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (!instance) return;
    instance.hide();
    instance.dispose();
  });
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.remove());
  document.body.classList.remove("modal-open");
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("padding-right");
};

const pluginData = {
  introduction: {
    title: "Introduction",
    intro: "Project overview and context for this Bootstrap 5 school project.",
    usage1: ``,
    usage2: ``,
    resultTitle: "",
    resultDesc: "",
    resultIcon: "",
  },
  plugins: {
    title: "Plugins",
    intro: "Complete list of Bootstrap plugin sections included in this project.",
    usage1: ``,
    usage2: ``,
    resultTitle: "",
    resultDesc: "",
    resultIcon: "",
  },
  alert: {
    title: "Alert",
    intro: "Displays a callout for user attention.",
    usage1: `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>`,
    usage2: `<div class="alert alert-warning alert-dismissible fade show" role="alert">\n  Dismissible warning alert.\n  <button type="button" class="btn-close" data-bs-dismiss="alert"></button>\n</div>`,
    resultTitle: "Payment successful",
    resultDesc: "Your payment of $29.99 has been processed.<br />A receipt has been sent to your email address.",
    resultIcon: "bi-check-circle",
  },
  button: {
    title: "Button",
    intro: "Triggers actions such as submit, navigation, and interaction events.",
    usage1: `<button class="btn btn-dark">Primary</button>\n<button class="btn btn-outline-secondary">Outline</button>`,
    usage2: `<button class="btn btn-secondary" type="button">Secondary action</button>`,
    resultTitle: "Button action triggered",
    resultDesc: "The button component successfully fired an interactive event.",
    resultIcon: "bi-cursor-fill",
  },
  carousel: {
    title: "Carousel",
    intro: "Cycles through visual content slides in a single framed area.",
    usage1: `<div id="demoCarousel" class="carousel slide" data-bs-ride="carousel">\n  ...\n</div>`,
    usage2: `<button class="carousel-control-next" data-bs-target="#demoCarousel" data-bs-slide="next"></button>`,
    resultTitle: "Carousel initialized",
    resultDesc: "Slides are now active. Use arrows or swipe gesture to navigate.",
    resultIcon: "bi-images",
  },
  collapse: {
    title: "Collapse",
    intro: "Toggles visibility of content containers for cleaner layouts.",
    usage1: `<button class="btn btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#demoCollapse">Toggle</button>`,
    usage2: `<div class="collapse" id="demoCollapse">\n  <div class="card card-body">Hidden content</div>\n</div>`,
    resultTitle: "Collapse ready",
    resultDesc: "Click the toggle button to expand and hide this content block.",
    resultIcon: "bi-arrows-collapse",
  },
  dropdown: {
    title: "Dropdown",
    intro: "Provides compact option menus that open on click.",
    usage1: `<button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Dropdown</button>`,
    usage2: `<ul class="dropdown-menu">\n  <li><a class="dropdown-item" href="#">Action</a></li>\n</ul>`,
    resultTitle: "Dropdown available",
    resultDesc: "Open the menu to access grouped options within a compact area.",
    resultIcon: "bi-list-ul",
  },
  modal: {
    title: "Modal",
    intro: "Displays focused dialog content above the main page.",
    usage1: `<button class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#dynModal">Open modal</button>`,
    usage2: `<div class="modal fade" id="dynModal">...</div>`,
    resultTitle: "Modal component loaded",
    resultDesc: "Use the button inside this card to open the modal dialog.",
    resultIcon: "bi-window",
  },
  offcanvas: {
    title: "Offcanvas",
    intro: "Shows a side panel for auxiliary navigation or controls.",
    usage1: `<button class="btn btn-outline-secondary" data-bs-toggle="offcanvas" data-bs-target="#dynOffcanvas">Open offcanvas</button>`,
    usage2: `<div class="offcanvas offcanvas-end" id="dynOffcanvas">...</div>`,
    resultTitle: "Offcanvas panel ready",
    resultDesc: "Tap the trigger to open the side panel component.",
    resultIcon: "bi-layout-sidebar",
  },
  popover: {
    title: "Popover",
    intro: "Displays richer contextual content near a target element.",
    usage1: `<button class="btn btn-outline-secondary" data-bs-toggle="popover" data-bs-title="Popover" data-bs-content="Popover content">Show popover</button>`,
    usage2: `new bootstrap.Popover(document.querySelector('[data-bs-toggle="popover"]'))`,
    resultTitle: "Popover is active",
    resultDesc: "Click the trigger button to reveal contextual overlay content.",
    resultIcon: "bi-chat-square-dots",
  },
  scrollspy: {
    title: "Scrollspy",
    intro: "Highlights navigation items based on scroll position.",
    usage1: `<body data-bs-spy="scroll" data-bs-target="#spyNav">`,
    usage2: `<div data-bs-spy="scroll" data-bs-target="#spyNav">...</div>`,
    resultTitle: "Scrollspy configured",
    resultDesc: "Scrolling inside the content area updates active nav links.",
    resultIcon: "bi-compass",
  },
  tab: {
    title: "Tab",
    intro: "Switches between related content panes within one area.",
    usage1: `<button class="nav-link" data-bs-toggle="tab" data-bs-target="#paneA">Tab A</button>`,
    usage2: `<div class="tab-pane" id="paneA">Pane content</div>`,
    resultTitle: "Tabs initialized",
    resultDesc: "Use tab buttons to switch the currently visible panel.",
    resultIcon: "bi-ui-radios-grid",
  },
  toast: {
    title: "Toast",
    intro: "Shows temporary, lightweight notifications.",
    usage1: `<div class="toast" id="dynToast">...</div>`,
    usage2: `new bootstrap.Toast(document.getElementById('dynToast')).show()`,
    resultTitle: "Toast ready",
    resultDesc: "Trigger to display a temporary notification message.",
    resultIcon: "bi-bell",
  },
  tooltip: {
    title: "Tooltip",
    intro: "Displays short helper text on hover or focus.",
    usage1: `<button data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Tooltip text">Hover me</button>`,
    usage2: `new bootstrap.Tooltip(document.querySelector('[data-bs-toggle="tooltip"]'))`,
    resultTitle: "Tooltip enabled",
    resultDesc: "Hover the trigger button to see helper text.",
    resultIcon: "bi-info-circle",
  },
  preloader: {
    title: "Preloader",
    intro: "Shows a loading state before the system becomes interactive.",
    usage1: `<div id="preloader" class="preloader">...</div>`,
    usage2: `window.addEventListener('load', () => preloader.classList.add('hidden'))`,
    resultTitle: "Preloader behavior active",
    resultDesc: "This page already demonstrates preloader fade-out when fully loaded.",
    resultIcon: "bi-hourglass-split",
  },
};

const getCurrentPlugin = () => {
  const params = new URLSearchParams(window.location.search);
  const plugin = params.get("plugin") || "alert";
  return plugins.includes(plugin) ? plugin : "alert";
};

const nextPlugin = (current) => {
  const idx = plugins.indexOf(current);
  return plugins[(idx + 1) % plugins.length];
};

const prevPlugin = (current) => {
  const idx = plugins.indexOf(current);
  return plugins[(idx - 1 + plugins.length) % plugins.length];
};

const detectCodeLanguage = (snippet) => {
  if (/<\/?[a-z][\s\S]*>/i.test(snippet)) return "markup";
  return "javascript";
};

const renderDemoByPlugin = (plugin, data) => {
  if (plugin === "alert") {
    return `<div class="alert-inline-demo text-center">
      <button id="dynAlertBtn" class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button">Trigger Alert</button>
      <div id="dynAlertBox" class="alert-card alert-result-card alert-compact-card d-none" style="max-width:560px;margin-left:auto;margin-right:auto;">
        <button id="dynAlertClose" type="button" class="alert-dismiss" aria-label="Close"><i class="bi bi-x"></i></button>
        <div class="alert-title"><i class="bi bi-check-circle me-2"></i>Payment successful</div>
        <div class="alert-desc">Your payment has been processed.</div>
      </div>
    </div>`;
  }
  if (plugin === "modal") {
    return `<div class="modal-inline-demo modal-preview-demo">
      <div class="modal-launcher-grid">
        <button class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button" data-preview-src="img/1.jpg" data-preview-alt="Preview image 1">Image 1</button>
        <button class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button" data-preview-src="img/2.jpg" data-preview-alt="Preview image 2">Image 2</button>
        <button class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button" data-preview-src="img/3.jpg" data-preview-alt="Preview image 3">Image 3</button>
        <button class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button" data-preview-src="img/4.jpeg" data-preview-alt="Preview image 4">Image 4</button>
        <button class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button" data-preview-src="img/7.png" data-preview-alt="Preview image 5">Image 5</button>
        <button class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button" data-preview-src="img/8.jpg" data-preview-alt="Preview image 6">Image 6</button>
        <button class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button" data-preview-src="img/9.jpg" data-preview-alt="Preview image 7">Image 7</button>
        <button class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button" data-preview-src="img/10.jpg" data-preview-alt="Preview image 8">Image 8</button>
        <button class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button" data-preview-src="img/large_banner_1920x600_124kb.jpg" data-preview-alt="Preview image 9">Image 9</button>
        <button class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button" data-preview-src="img/web_optimized_1200x800_97kb.jpg" data-preview-alt="Preview image 10">Image 10</button>
      </div>

      <div class="modal fade" id="dynModalPreview" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content modal-gallery-shell modal-square-content">
            <div class="modal-header">
              <h5 class="modal-title">Image Preview</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-2 p-md-3">
              <img id="dynPreviewImage" src="img/1.jpg" alt="Image preview" class="modal-preview-image" />
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
  if (plugin === "offcanvas") {
    return `<div class="offcanvas-inline-demo">
      <button class="btn btn-outline-secondary btn-sm modal-launch-btn" data-bs-toggle="offcanvas" data-bs-target="#dynOffcanvas">Open Panel</button>
      <div class="offcanvas offcanvas-end offcanvas-demo-panel" tabindex="-1" id="dynOffcanvas" aria-labelledby="dynOffcanvasLabel">
        <div class="offcanvas-header">
          <h5 id="dynOffcanvasLabel">Right Panel</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div class="offcanvas-body">
          <p class="mb-2">This is a right-side offcanvas panel.</p>
          <p class="mb-0 text-secondary">Use this for navigation, actions, or contextual details.</p>
        </div>
      </div>
    </div>`;
  }
  if (plugin === "dropdown") {
    return `<div class="dropdown dropdown-demo-wrap">
      <button class="btn dropdown-demo-trigger dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">Open</button>
      <ul class="dropdown-menu dropdown-demo-menu">
        <li><a class="dropdown-item dropdown-demo-item" href="#"><span>My Account</span></a></li>
        <li><a class="dropdown-item dropdown-demo-item d-flex justify-content-between align-items-center" href="#"><span>Profile</span><span class="dropdown-shortcut">⇧⌘P</span></a></li>
        <li><a class="dropdown-item dropdown-demo-item d-flex justify-content-between align-items-center" href="#"><span>Billing</span><span class="dropdown-shortcut">⌘B</span></a></li>
        <li><a class="dropdown-item dropdown-demo-item d-flex justify-content-between align-items-center" href="#"><span>Settings</span><span class="dropdown-shortcut">⌘S</span></a></li>
        <li><hr class="dropdown-divider dropdown-demo-divider"></li>
        <li><a class="dropdown-item dropdown-demo-item" href="#">Team</a></li>
        <li><a class="dropdown-item dropdown-demo-item d-flex justify-content-between align-items-center" href="#"><span>Invite users</span><i class="bi bi-chevron-right dropdown-chevron"></i></a></li>
        <li><a class="dropdown-item dropdown-demo-item d-flex justify-content-between align-items-center" href="#"><span>New Team</span><span class="dropdown-shortcut">⌘+T</span></a></li>
        <li><hr class="dropdown-divider dropdown-demo-divider"></li>
        <li><a class="dropdown-item dropdown-demo-item" href="#">GitHub</a></li>
        <li><a class="dropdown-item dropdown-demo-item" href="#">Support</a></li>
        <li><a class="dropdown-item dropdown-demo-item dropdown-item-muted" href="#">API</a></li>
        <li><hr class="dropdown-divider dropdown-demo-divider"></li>
        <li><a class="dropdown-item dropdown-demo-item d-flex justify-content-between align-items-center" href="#"><span>Log out</span><span class="dropdown-shortcut">⇧⌘Q</span></a></li>
      </ul>
    </div>`;
  }
  if (plugin === "collapse") {
    return `<div class="collapse-inline-demo mt-3">
      <div class="collapse-demo-shell">
      <div class="collapse-demo-head">
        <div class="collapse-order-title">Order #4189</div>
        <button class="collapse-toggle-btn" type="button" data-bs-toggle="collapse" data-bs-target="#dynCollapseDetails" aria-expanded="false" aria-controls="dynCollapseDetails">
          <i class="bi bi-chevron-up"></i>
          <i class="bi bi-chevron-down"></i>
        </button>
      </div>
      <div class="collapse-info-card collapse-info-card-row">
        <span class="collapse-label">Status</span>
        <span class="collapse-value collapse-value-prominent">Shipped</span>
      </div>
      <div class="collapse collapse-extra-wrap" id="dynCollapseDetails">
        <div class="collapse-info-card">
          <span class="collapse-label">Shipping address</span>
          <span class="collapse-value collapse-value-muted">100 Market St, San Francisco</span>
        </div>
        <div class="collapse-info-card">
          <span class="collapse-label">Items</span>
          <span class="collapse-value collapse-value-muted">2x Studio Headphones</span>
        </div>
      </div>
    </div>
    </div>`;
  }
  if (plugin === "carousel") {
    return `<div class="carousel-demo-shell">
      <div id="dynCarousel" class="carousel slide" data-bs-ride="false">
        <div class="carousel-inner">
          <div class="carousel-item active">
            <div class="carousel-card-frame"><span class="carousel-card-no">1</span></div>
          </div>
          <div class="carousel-item">
            <div class="carousel-card-frame"><span class="carousel-card-no">2</span></div>
          </div>
          <div class="carousel-item">
            <div class="carousel-card-frame"><span class="carousel-card-no">3</span></div>
          </div>
          <div class="carousel-item">
            <div class="carousel-card-frame"><span class="carousel-card-no">4</span></div>
          </div>
          <div class="carousel-item">
            <div class="carousel-card-frame"><span class="carousel-card-no">5</span></div>
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#dynCarousel" data-bs-slide="prev" aria-label="Previous slide">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#dynCarousel" data-bs-slide="next" aria-label="Next slide">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>
    </div>`;
  }
  if (plugin === "popover") {
    return `<div class="popover-inline-demo">
      <button id="dynPopoverBtn" class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button">Open popover</button>
    </div>`;
  }
  if (plugin === "tooltip") {
    return `<button class="btn btn-outline-secondary btn-sm" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Tooltip preview">Hover me</button>`;
  }
  if (plugin === "toast") {
    return `<div class="toast-inline-demo">
      <button id="dynToastBtn" class="btn btn-outline-secondary btn-sm" type="button">Show toast</button>
      <div class="toast-container toast-center-top p-0">
        <div id="dynToast" class="toast toast-demo" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-body d-flex align-items-start justify-content-between gap-3">
            <div>
              <div class="toast-demo-title">Event has been created</div>
              <div class="toast-demo-sub">Sunday, December 03, 2023 at 9:00 AM</div>
            </div>
            <button id="dynToastUndo" class="btn btn-sm toast-undo-btn" type="button">Undo</button>
          </div>
        </div>
      </div>
    </div>`;
  }
  if (plugin === "tab") {
    return `<div class="tabs-demo-shell">
      <ul class="nav tabs-demo-nav" id="dynTab" role="tablist">
        <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#paneOverview" type="button">Overview</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#paneAnalytics" type="button">Analytics</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#paneReports" type="button">Reports</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#paneSettings" type="button">Settings</button></li>
      </ul>
      <div class="tab-content tabs-demo-content">
        <div class="tab-pane fade show active" id="paneOverview">
          <div class="tabs-pane-title">Overview</div>
          <p>View your key metrics and recent project activity. Track progress across all your active projects.</p>
          <p class="tabs-pane-muted mb-0">You have 12 active projects and 3 pending tasks.</p>
        </div>
        <div class="tab-pane fade" id="paneAnalytics">
          <div class="tabs-pane-title">Analytics</div>
          <p>Analyze engagement trends, conversion funnels, and user behavior over time.</p>
          <p class="tabs-pane-muted mb-0">Last 30 days: +14.2% traffic growth.</p>
        </div>
        <div class="tab-pane fade" id="paneReports">
          <div class="tabs-pane-title">Reports</div>
          <p>Generate export-ready summaries for team updates and stakeholder reviews.</p>
          <p class="tabs-pane-muted mb-0">3 reports are scheduled for this week.</p>
        </div>
        <div class="tab-pane fade" id="paneSettings">
          <div class="tabs-pane-title">Settings</div>
          <p>Configure workspace preferences, notifications, and access permissions.</p>
          <p class="tabs-pane-muted mb-0">2 security recommendations available.</p>
        </div>
      </div>
    </div>`;
  }
  if (plugin === "scrollspy") {
    return `<div class="scrollspy-inline-demo text-start mt-3">
      <div class="scrollspy-shell">
        <nav id="dynSpyNav" class="nav nav-pills scrollspy-nav mb-2">
          <a class="nav-link" href="#spy-overview">Overview</a>
          <a class="nav-link" href="#spy-analytics">Analytics</a>
          <a class="nav-link" href="#spy-reports">Reports</a>
          <a class="nav-link" href="#spy-settings">Settings</a>
        </nav>
        <div id="dynScrollspyBox" data-bs-spy="scroll" data-bs-target="#dynSpyNav" data-bs-smooth-scroll="true" class="scrollspy-box p-3 border rounded" tabindex="0">
          <section id="spy-overview" class="scrollspy-section">
            <h6>Overview</h6>
            <p>This demo now runs directly without any trigger button. Scroll inside this panel and the active nav item updates automatically.</p>
            <p>Scrollspy tracks section position relative to this scroll container and keeps navigation state in sync.</p>
          </section>
          <section id="spy-analytics" class="scrollspy-section">
            <h6>Analytics</h6>
            <p>Each section includes enough content so the active state clearly moves as you scroll.</p>
            <p>Scrollspy keeps the nav synced to the section currently in view.</p>
          </section>
          <section id="spy-reports" class="scrollspy-section">
            <h6>Reports</h6>
            <p>Use the nav tabs to jump instantly between sections, then continue scrolling naturally.</p>
            <p>Bootstrap handles active class switching while this layout stays compact and readable.</p>
          </section>
          <section id="spy-settings" class="scrollspy-section mb-0">
            <h6>Settings</h6>
            <p class="mb-0">This pattern is useful for docs and dashboards where section-aware navigation should always stay accurate.</p>
          </section>
        </div>
      </div>
    </div>`;
  }
  if (plugin === "button") {
    return `<div class="button-inline-demo">
      <button class="btn button-inline-main" type="button">Button</button>
      <button class="btn button-inline-icon" type="button" aria-label="Action">
        <i class="bi bi-arrow-up"></i>
      </button>
    </div>`;
  }
  if (plugin === "preloader") {
    return `<div class="preloader-inline-demo text-center mt-3">
      <button id="replayPreloaderBtn" class="btn btn-outline-secondary btn-sm modal-launch-btn" type="button">Replay preloader</button>
      <p class="mb-0 mt-2 text-secondary" style="font-size:.82rem;">Shows a loading overlay before opening the system.</p>
    </div>`;
  }
  return `<div class="alert-title"><i class="bi ${data.resultIcon} me-2"></i>${data.resultTitle}</div><div class="alert-desc">${data.resultDesc}</div>`;
};

const renderPluginPage = () => {
  cleanupBootstrapOverlays();

  const plugin = getCurrentPlugin();
  const data = pluginData[plugin];
  const rootEl = document.getElementById("plugin-root");
  const onPage = document.getElementById("onPageNav");
  if (!rootEl || !onPage || !data) return;

  document.querySelectorAll("[data-plugin]").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("data-plugin") === plugin);
  });

  if (plugin === "introduction") {
    rootEl.innerHTML = `
      <div id="intro" class="doc-head intro-doc">
        <h1>Bootstrap 5 School Project Documentation</h1>
        <div class="doc-group mt-4" id="intro-overview">
          <h3>Project Overview</h3>
          <p>
            This website is a frontend school project built with Bootstrap 5. It demonstrates practical UI development with responsive layout,
            reusable components, and interactive plugin behavior in a clean documentation-style presentation.
          </p>
          <p>
            The implementation is frontend-only and structured for classroom checking, practical demonstration, and straightforward deployment.
          </p>
        </div>
        <div class="doc-group mt-4" id="intro-objective">
          <h3>Learning Objective</h3>
          <p>
            The objective is to apply core frontend concepts in a single working output: layout structure, visual consistency, Bootstrap utilities,
            and JavaScript-driven UI interactions required for classroom presentation and technical evaluation.
          </p>
        </div>
        <div class="doc-group mt-4" id="intro-scope">
          <h3>Project Scope</h3>
          <p>
            The system includes a landing page and a dedicated components page where Bootstrap plugins are demonstrated in focused, testable previews.
            Covered features include alert, button, carousel, collapse, dropdown, modal image preview, offcanvas, popover, scrollspy, tab, toast,
            tooltip, and preloader behavior.
          </p>
          <ul>
            <li><strong>Responsive Layout:</strong> Built with Bootstrap grid and utility classes for desktop and mobile screens.</li>
            <li><strong>Interactive Plugins:</strong> Each required plugin is implemented with functional user interaction.</li>
            <li><strong>Documentation Style:</strong> Component previews and usage blocks are organized for easy academic review.</li>
          </ul>
        </div>
        <div class="doc-group mt-4 mb-0" id="intro-outcome">
          <h3>Expected Outcome</h3>
          <p>
            This project is designed to be deployable and school-project ready, proving both design and functionality. Each plugin is presented with
            practical interaction flow so reviewers can verify implementation quality directly from the interface.
          </p>
          <p>
            The final output shows understanding of Bootstrap 5 CDN setup, UI consistency, plugin behavior, and frontend delivery standards.
          </p>
        </div>
      </div>
      <div class="plugin-pagination d-flex justify-content-end mt-4">
        <a href="components.html?plugin=${nextPlugin(plugin)}" class="pager-chip">${pluginData[nextPlugin(plugin)].title} <i class="bi bi-arrow-right ms-1"></i></a>
      </div>
    `;

    onPage.innerHTML = `
      <h6>On this page</h6>
      <a class="nav-link" href="#intro-overview">Project Overview</a>
      <a class="nav-link" href="#intro-objective">Learning Objective</a>
      <a class="nav-link" href="#intro-scope">Project Scope</a>
      <a class="nav-link" href="#intro-outcome">Expected Outcome</a>
    `;

    wireInteractions(plugin);
    return;
  }

  if (plugin === "plugins") {
    const pluginList = plugins.filter((p) => p !== "introduction" && p !== "plugins");
    rootEl.innerHTML = `
      <div id="intro" class="doc-head plugins-doc">
        <h1>Plugins</h1>
        <p>Here you can find all Bootstrap plugin demos included in this project.</p>
        <div class="plugins-index mt-4">
          ${pluginList
            .map(
              (p) =>
                `<a class="plugin-index-link" href="components.html?plugin=${p}">${pluginData[p].title}</a>`
            )
            .join("")}
        </div>
      </div>
      <div class="plugin-pagination d-flex justify-content-end gap-2 mt-4">
        <a href="components.html?plugin=${prevPlugin(plugin)}" class="pager-chip"><i class="bi bi-arrow-left-short me-1"></i>${pluginData[prevPlugin(plugin)].title}</a>
        <a href="components.html?plugin=${nextPlugin(plugin)}" class="pager-chip">${pluginData[nextPlugin(plugin)].title} <i class="bi bi-arrow-right-short ms-1"></i></a>
      </div>
    `;

    onPage.innerHTML = `
      <h6>On this page</h6>
      <a class="nav-link" href="#intro">Plugins</a>
    `;

    wireInteractions(plugin);
    return;
  }

  rootEl.innerHTML = `
    <div id="intro" class="doc-head">
      <h1>Bootstrap ${data.title} Component</h1>
      <p>${data.intro}</p>
    </div>

    <div class="doc-group plugin-doc" id="alert">
      <div class="plugin-head d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div>
          <h3 class="plugin-title">${data.title}</h3>
          <p class="doc-note">${data.intro}</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <a href="components.html?plugin=${prevPlugin(plugin)}" class="nav-arrow-btn" aria-label="Previous"><i class="bi bi-arrow-left-short"></i></a>
          <a href="components.html?plugin=${nextPlugin(plugin)}" class="nav-arrow-btn" aria-label="Next"><i class="bi bi-arrow-right-short"></i></a>
        </div>
      </div>

      <div class="plugin-surface ${plugin}-surface" id="surface-demo">
        <div class="surface-panel active" data-panel="preview">
          ${renderDemoByPlugin(plugin, data)}
        </div>
      </div>
    </div>

    <div class="doc-group" id="usage">
      <h3 class="plugin-title">Usage</h3>
      <div class="usage-card">
        <button class="copy-btn" type="button" data-copy-target="usageImport" aria-label="Copy code"><i class="bi bi-copy"></i></button>
        <pre id="usageImport" class="usage-code mb-0"><code class="language-${detectCodeLanguage(data.usage1)}">${data.usage1.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
      </div>
      <div class="usage-card mt-3">
        <button class="copy-btn" type="button" data-copy-target="usageMarkup" aria-label="Copy code"><i class="bi bi-copy"></i></button>
        <pre id="usageMarkup" class="usage-code mb-0"><code class="language-${detectCodeLanguage(data.usage2)}">${data.usage2.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
      </div>
    </div>

    <div class="plugin-pagination d-flex justify-content-end gap-2 mt-4">
      <a href="components.html?plugin=${prevPlugin(plugin)}" class="pager-chip"><i class="bi bi-arrow-left-short me-1"></i>${pluginData[prevPlugin(plugin)].title}</a>
      <a href="components.html?plugin=${nextPlugin(plugin)}" class="pager-chip">${pluginData[nextPlugin(plugin)].title} <i class="bi bi-arrow-right-short ms-1"></i></a>
    </div>
  `;

  if (window.Prism && typeof window.Prism.highlightAllUnder === "function") {
    window.Prism.highlightAllUnder(rootEl);
  }

  onPage.innerHTML = `
    <h6>On this page</h6>
    <a class="nav-link" href="#intro">Overview</a>
    <a class="nav-link" href="#alert">${data.title}</a>
    <a class="nav-link" href="#usage">Usage</a>
  `;

  wireInteractions(plugin);
};

const wireInteractions = (plugin) => {
  if (plugin === "alert") {
    const alertBtn = document.getElementById("dynAlertBtn");
    const alertBox = document.getElementById("dynAlertBox");
    const alertClose = document.getElementById("dynAlertClose");
    if (alertBtn && alertBox) {
      alertBtn.addEventListener("click", () => {
        alertBtn.classList.add("d-none");
        alertBox.classList.remove("d-none");
      });
    }
    if (alertClose && alertBtn && alertBox) {
      alertClose.addEventListener("click", () => {
        alertBox.classList.add("d-none");
        alertBtn.classList.remove("d-none");
      });
    }
  }

  if (plugin === "preloader") {
    const replayBtn = document.getElementById("replayPreloaderBtn");
    const preloader = document.getElementById("preloader");
    if (replayBtn && preloader) {
      replayBtn.addEventListener("click", () => {
        preloader.classList.remove("hidden");
        setTimeout(() => preloader.classList.add("hidden"), 700);
      });
    }
  }

  if (plugin === "popover") {
    const popBtn = document.getElementById("dynPopoverBtn");
    if (popBtn) {
      const popContent = `
        <div class="dims-popover">
          <div class="dims-title">Dimensions</div>
          <p class="dims-sub">Set the dimensions for the layer.</p>
          <div class="dims-row"><span class="dims-label">Width</span><span class="dims-field">100%</span></div>
          <div class="dims-row"><span class="dims-label">Max. width</span><span class="dims-field">300px</span></div>
          <div class="dims-row"><span class="dims-label">Height</span><span class="dims-field">25px</span></div>
          <div class="dims-row"><span class="dims-label">Max. height</span><span class="dims-field">none</span></div>
        </div>
      `;
      bootstrap.Popover.getOrCreateInstance(popBtn, {
        html: true,
        placement: "bottom",
        trigger: "click",
        sanitize: false,
        content: popContent,
        customClass: "popover-dimensions",
      });
    }
  }

  if (plugin === "modal") {
    const modalEl = document.getElementById("dynModalPreview");
    const previewImage = document.getElementById("dynPreviewImage");
    if (modalEl && previewImage) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalEl.addEventListener("hidden.bs.modal", cleanupBootstrapOverlays);
      document.querySelectorAll("[data-preview-src]").forEach((thumb) => {
        thumb.addEventListener("click", () => {
          const src = thumb.getAttribute("data-preview-src");
          const alt = thumb.getAttribute("data-preview-alt") || "Image preview";
          if (!src) return;
          previewImage.setAttribute("src", src);
          previewImage.setAttribute("alt", alt);
          modal.show();
        });
      });
    }
  }

  if (plugin === "tooltip") {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
      bootstrap.Tooltip.getOrCreateInstance(el);
    });
  }
  if (plugin === "toast") {
    const toastBtn = document.getElementById("dynToastBtn");
    const toastEl = document.getElementById("dynToast");
    const undoBtn = document.getElementById("dynToastUndo");
    if (toastBtn && toastEl) {
      const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { autohide: true, delay: 2600 });
      toastBtn.addEventListener("click", () => toast.show());
      if (undoBtn) {
        undoBtn.addEventListener("click", () => toast.hide());
      }
    }
  }
  if (plugin === "scrollspy") {
    const spyEl = document.getElementById("dynScrollspyBox");
    if (spyEl) {
      const spy = bootstrap.ScrollSpy.getOrCreateInstance(spyEl, {
        target: "#dynSpyNav",
        offset: 12,
        smoothScroll: true,
      });
      requestAnimationFrame(() => spy.refresh());
    }
  }

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.focus();
    area.select();
    document.execCommand("copy");
    area.remove();
  };

  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.getAttribute("data-copy-target");
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;
      try {
        await copyToClipboard(target.innerText.trim());
        button.innerHTML = '<i class="bi bi-check2"></i>';
        setTimeout(() => {
          button.innerHTML = '<i class="bi bi-copy"></i>';
        }, 1200);
      } catch {
        button.innerHTML = '<i class="bi bi-x"></i>';
        setTimeout(() => {
          button.innerHTML = '<i class="bi bi-copy"></i>';
        }, 1200);
      }
    });
  });
};

const setPluginInUrl = (plugin) => {
  if (!plugins.includes(plugin)) return;
  const url = new URL(window.location.href);
  url.searchParams.set("plugin", plugin);
  window.history.pushState({ plugin }, "", url);
};

let pluginSwitchTimer = null;

const navigateToPlugin = (plugin) => {
  if (!plugins.includes(plugin)) return;
  const rootEl = document.getElementById("plugin-root");
  const current = getCurrentPlugin();
  if (!rootEl || current === plugin) {
    setPluginInUrl(plugin);
    renderPluginPage();
    return;
  }

  rootEl.classList.remove("plugin-transition-in");
  rootEl.classList.add("plugin-transition-out");
  if (pluginSwitchTimer) clearTimeout(pluginSwitchTimer);

  pluginSwitchTimer = window.setTimeout(() => {
    setPluginInUrl(plugin);
    renderPluginPage();
    rootEl.classList.remove("plugin-transition-out");
    rootEl.classList.add("plugin-transition-in");
    window.setTimeout(() => {
      rootEl.classList.remove("plugin-transition-in");
    }, 280);
  }, 150);
};

const wireMobileMenuToggle = () => {
  const mobileMenu = document.getElementById("mobileDocsMenu");
  const menuIcon = document.querySelector(".mobile-menu-icon");
  if (!mobileMenu || !menuIcon) return;

  mobileMenu.addEventListener("shown.bs.offcanvas", () => {
    menuIcon.classList.remove("bi-list");
    menuIcon.classList.add("bi-x-lg");
  });

  mobileMenu.addEventListener("hidden.bs.offcanvas", () => {
    menuIcon.classList.remove("bi-x-lg");
    menuIcon.classList.add("bi-list");
  });
};

document.addEventListener("click", (event) => {
  const pluginTreeLink = event.target.closest("[data-plugin]");
  if (pluginTreeLink) {
    event.preventDefault();
    const plugin = pluginTreeLink.getAttribute("data-plugin");
    if (plugin) navigateToPlugin(plugin);
    return;
  }

  const pluginHrefLink = event.target.closest('a[href*="components.html?plugin="]');
  if (pluginHrefLink) {
    event.preventDefault();
    const href = pluginHrefLink.getAttribute("href") || "";
    const url = new URL(href, window.location.origin);
    const plugin = url.searchParams.get("plugin");
    if (plugin) navigateToPlugin(plugin);
  }
});

window.addEventListener("popstate", () => {
  const rootEl = document.getElementById("plugin-root");
  if (rootEl) rootEl.classList.add("plugin-transition-in");
  renderPluginPage();
  if (rootEl) {
    window.setTimeout(() => {
      rootEl.classList.remove("plugin-transition-in");
    }, 280);
  }
});

if (document.getElementById("plugin-root")) {
  renderPluginPage();
  wireMobileMenuToggle();
}
