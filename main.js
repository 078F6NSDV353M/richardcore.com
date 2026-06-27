import { TOOLS } from "./tools.config.js";

function getProjectBasePath() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (window.location.hostname.endsWith("github.io") && pathParts.length > 0) {
    return `/${pathParts[0]}/`;
  }

  return "/";
}

function getRootPath() {
  const path = window.location.pathname;
  const basePath = getProjectBasePath();

  const relativePath = path.startsWith(basePath)
    ? path.slice(basePath.length)
    : path;

  const cleanPath = relativePath.replace(/^\/+|\/+$/g, "");

  if (cleanPath === "" || cleanPath === "index.html") {
    return "./";
  }

  const depth = cleanPath.split("/").length;
  return "../".repeat(depth);
}

function buildRoute(route) {
  return `${getProjectBasePath()}${route}/`;
}

function applyRoutes() {
  const routeElements = document.querySelectorAll("[data-route]");

  routeElements.forEach((element) => {
    const route = element.getAttribute("data-route");
    if (!route) return;

    element.setAttribute("href", buildRoute(route));
  });
}

function renderToolsMenu() {
  const menu = document.getElementById("tools-menu");
  if (!menu) return;

  menu.innerHTML = "";

  Object.values(TOOLS).forEach((tool) => {
    const link = document.createElement("a");
    link.className = "dropdown-link";
    link.textContent = tool.title;
    link.href = buildRoute(`tools/${tool.slug}`);
    menu.appendChild(link);
  });
}

async function loadComponent(path, targetSelector) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Cannot get ${path}`);
  }

  const html = await response.text();
  const target = document.querySelector(targetSelector);

  if (target) {
    target.innerHTML = html;
  }
}

function updateThemeIcon(theme) {
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  const iconName = theme === "light" ? "sun" : "moon";

  button.innerHTML = `<i data-lucide="${iconName}"></i>`;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  updateThemeIcon(theme);
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  setTheme(saved || "dark");
}

function updateUTC() {
  const el = document.getElementById("utc-clock");
  if (!el) return;

  const now = new Date();
  el.textContent = now.toUTCString().replace("GMT", "UTC");
}

function renderLogo() {
  const logo = document.querySelector(".logo");
  if (!logo) return;

  logo.innerHTML = "";

  const base = document.createElement("span");
  base.className = "logo-base";
  base.textContent = "Richard";

  const core = document.createElement("span");
  core.className = "logo-core";
  core.textContent = "<CORE>";

  logo.appendChild(base);
  logo.appendChild(core);

  const explicitSlug = document.documentElement.dataset.toolSlug;
  if (!explicitSlug) {
    return;
  }

  const tool = Object.values(TOOLS).find(
    (item) => item.slug === explicitSlug
  );

  if (!tool) {
    return;
  }

  const dot = document.createElement("span");
  dot.className = "logo-separator";
  dot.textContent = ".";

  const title = document.createElement("span");
  title.className = "logo-tool";
  title.textContent = tool.title;

  logo.appendChild(dot);
  logo.appendChild(title);
}

document.addEventListener("DOMContentLoaded", async () => {
  const root = getRootPath();

  try {
    await loadComponent(`${root}components/header.html`, "#header-root");
  } catch {
    const headerRoot = document.querySelector("#header-root");
    if (headerRoot) {
      headerRoot.textContent = "Cannot get header";
    }
  }

  try {
    await loadComponent(`${root}components/footer.html`, "#footer-root");
  } catch {
    const footerRoot = document.querySelector("#footer-root");
    if (footerRoot) {
      footerRoot.textContent = "Cannot get footer";
    }
  }

  renderLogo();
  applyRoutes();
  renderToolsMenu();

  if (window.lucide) {
    window.lucide.createIcons();
  }

  initTheme();

  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      setTheme(current === "light" ? "dark" : "light");
    });
  }

  updateUTC();
  setInterval(updateUTC, 1000);

  updateDocumentTitle();
});

function updateDocumentTitle() {
  const base = "Richard<CORE>";

  const explicitSlug = document.documentElement.dataset.toolSlug;

  if (explicitSlug) {
    const tool = Object.values(TOOLS).find(
      (item) => item.slug === explicitSlug
    );

    if (tool) {
      document.title = `${tool.title} / ${base}`;
      return;
    }
  }

  // For non-tool pages
  const path = window.location.pathname.toLowerCase();

  if (path.includes("about")) {
    document.title = `About / ${base}`;
  } else if (path.includes("contacts")) {
    document.title = `Contacts / ${base}`;
  } else if (path.includes("tools")) {
    document.title = `Tools / ${base}`;
  } else {
    document.title = base;
  }
}