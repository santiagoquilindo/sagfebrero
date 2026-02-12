// Carga parcial simple para header, hero y footer
const loadPartial = async (targetId, url) => {
  const container = document.getElementById(targetId);
  if (!container) return { targetId, loaded: false };

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }
    const html = await response.text();
    container.innerHTML = html;
    return { targetId, loaded: true };
  } catch (error) {
    console.error(`No se pudo cargar ${url}:`, error);
    container.innerHTML = "";
    return { targetId, loaded: false, error };
  }
};

const buildHeroCta = (text, href, variant) => {
  if (!text || !href) return null;
  const link = document.createElement("a");
  link.className = `btn ${variant}`;
  link.href = href;
  link.textContent = text;
  return link;
};

const configureHero = () => {
  const host = document.getElementById("site-hero");
  if (!host) return;

  const title = host.dataset.heroTitle || "";
  const text = host.dataset.heroText || "";
  const primaryText = host.dataset.ctaPrimaryText || "";
  const primaryHref = host.dataset.ctaPrimaryHref || "";
  const secondaryText = host.dataset.ctaSecondaryText || "";
  const secondaryHref = host.dataset.ctaSecondaryHref || "";
  const kpis = host.dataset.heroKpis || "";
  const miniSrc = host.dataset.heroMiniSrc || "";

  const titleEl = host.querySelector("[data-hero-title]");
  const textEl = host.querySelector("[data-hero-text]");
  const actionsEl = host.querySelector("[data-hero-actions]");
  const ctasEl = host.querySelector("[data-hero-ctas]");
  const kpisEl = host.querySelector("[data-hero-kpis]");
  const miniImg = host.querySelector(".hero-mini-carousel img");

  if (titleEl) titleEl.textContent = title;
  if (textEl) {
    if (text) {
      textEl.textContent = text;
    } else {
      textEl.remove();
    }
  }

  if (ctasEl) {
    const primary = buildHeroCta(primaryText, primaryHref, "btn-accent");
    const secondary = buildHeroCta(secondaryText, secondaryHref, "btn-outline");
    if (primary || secondary) {
      actionsEl?.classList.add("has-ctas");
      if (primary) ctasEl.appendChild(primary);
      if (secondary) ctasEl.appendChild(secondary);
    } else {
      ctasEl.remove();
    }
  }

  if (kpisEl) {
    if (!kpis) {
      kpisEl.remove();
    } else {
      const items = kpis
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.split("|").map((part) => part.trim()));

      items.forEach(([value, label]) => {
        if (!value || !label) return;
        const item = document.createElement("div");
        item.className = "kpi-item";
        const number = document.createElement("span");
        number.className = "kpi-number";
        number.textContent = value;
        const desc = document.createElement("span");
        desc.className = "kpi-label";
        desc.textContent = label;
        item.appendChild(number);
        item.appendChild(desc);
        kpisEl.appendChild(item);
      });

      if (!kpisEl.children.length) {
        kpisEl.remove();
      }
    }
  }

  if (miniImg && miniSrc) {
    miniImg.setAttribute("data-src", miniSrc);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const results = await Promise.all([
    loadPartial("site-header", "partials/header.html"),
    loadPartial("site-hero", "partials/hero.html"),
    loadPartial("site-footer", "partials/footer.html"),
  ]);

  if (results.some((r) => r.targetId === "site-hero" && r.loaded)) {
    configureHero();
  }

  const detail = {
    results,
    loaded: results.every((r) => r.loaded),
  };

  document.dispatchEvent(new CustomEvent("partials:loaded", { detail }));
});
