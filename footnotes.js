export function initFootnotes() {
  // Guard: already initialized (sheet element is the sentinel)
  if (document.getElementById("footnote-sheet")) return;

  const popovers = document.querySelectorAll(".footnote-popover[popover]");
  const hasInterestInvoker = "interestTargetElement" in HTMLAnchorElement.prototype;
  const mobileQuery = window.matchMedia("(max-width: 600px)");

  popovers.forEach((popover) => {
    const listItemId = popover.id.replace("fn-popover-", "fn");
    const li = document.getElementById(listItemId);
    if (li) {
      const clone = li.cloneNode(true);
      clone.querySelector(".footnote-backref")?.remove();
      clone.querySelector(".footnote-number")?.remove();
      popover.innerHTML = clone.innerHTML.trim();
    }

    const trigger = document.querySelector(`[aria-details="${popover.id}"]`);
    if (!trigger) return;

    trigger.setAttribute("aria-expanded", "false");

    popover.addEventListener("toggle", (event) => {
      trigger.setAttribute("aria-expanded", String(event.newState === "open"));
      if (event.newState === "open") {
        const rect = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const height = popover.offsetHeight || 160;
        if (spaceAbove > spaceBelow && spaceAbove >= height + 8) {
          popover.style.top = `${rect.top - height - 8}px`;
        } else {
          popover.style.top = `${rect.bottom + 8}px`;
        }
        popover.style.left = `${Math.min(rect.left, window.innerWidth - popover.offsetWidth - 8)}px`;
      }
    });

    if (!hasInterestInvoker) {
      let hoverTimer;
      let closeTimer;

      trigger.addEventListener("mouseenter", () => {
        if (mobileQuery.matches) return;
        clearTimeout(closeTimer);
        hoverTimer = setTimeout(() => {
          if (!popover.matches(":popover-open")) popover.showPopover();
        }, 150);
      });

      trigger.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimer);
        closeTimer = setTimeout(() => {
          if (popover.matches(":popover-open")) popover.hidePopover();
        }, 100);
      });

      popover.addEventListener("mouseenter", () => clearTimeout(closeTimer));

      popover.addEventListener("mouseleave", () => {
        if (popover.matches(":popover-open")) popover.hidePopover();
      });
    }
  });

  window.addEventListener("hashchange", () => {
    if (mobileQuery.matches) return;
    const hash = location.hash;
    if (!hash.startsWith("#fnref")) return;
    const sup = document.getElementById(hash.slice(1));
    const t = sup?.querySelector(".footnote-trigger");
    if (!t) return;
    const popover = document.getElementById(t.getAttribute("aria-details"));
    if (popover && !popover.matches(":popover-open")) popover.showPopover();
  });

  // On mobile, remove the interesttarget attribute so the browser's interest
  // invoker doesn't show the desktop popover on tap.
  if (mobileQuery.matches) {
    document.querySelectorAll("[interesttarget]").forEach((t) => t.removeAttribute("interesttarget"));
  }

  // Mobile: add click handlers for each trigger
  let activeTrigger = null;

  document.querySelectorAll(".footnote-trigger").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (!mobileQuery.matches) return;
      event.preventDefault();

      // Close any desktop popover that may have opened via mouseenter timer
      document.querySelectorAll(".footnote-popover[popover]").forEach((p) => {
        try { if (p.matches(":popover-open")) p.hidePopover(); } catch (_) {}
      });

      const popoverId = trigger.getAttribute("aria-details");
      const popover = document.getElementById(popoverId);
      const sheetContent = document.getElementById("footnote-sheet-content");
      if (!popover || !sheetContent) return;

      sheetContent.innerHTML = popover.innerHTML;
      activeTrigger = trigger;
      document.getElementById("footnote-sheet").classList.add("open");
      document.body.style.overflow = "hidden";
      document.getElementById("footnote-sheet-close")?.focus();
    });
  });

  const sheet = document.createElement("div");
  sheet.id = "footnote-sheet";
  sheet.innerHTML = `
    <div id="footnote-sheet-panel" role="dialog" aria-modal="true" aria-label="Footnote">
      <button id="footnote-sheet-close" aria-label="Close footnote">×</button>
      <div id="footnote-sheet-content"></div>
    </div>
  `;
  document.body.appendChild(sheet);

  function closeSheet() {
    sheet.classList.remove("open");
    document.body.style.overflow = "";
    activeTrigger?.focus();
    activeTrigger = null;
  }

  document.getElementById("footnote-sheet-close").addEventListener("click", closeSheet);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sheet.classList.contains("open")) closeSheet();
  });

  sheet.addEventListener("click", (event) => {
    if (event.target === sheet) closeSheet();
  });

  document.getElementById("footnote-sheet-panel").addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFootnotes);
} else {
  initFootnotes();
}
