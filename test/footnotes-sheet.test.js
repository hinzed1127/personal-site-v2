// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

function setMobile(isMobile) {
  vi.stubGlobal("matchMedia", (query) => ({
    matches: isMobile && query.includes("600px"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function buildDOM() {
  document.body.innerHTML = `
    <p>Text with a footnote<sup class="footnote-ref" id="fnref1">
      <a href="#fn1"
         class="footnote-trigger"
         aria-details="fn-popover-1"
         aria-label="Footnote 1"
         interesttarget="fn-popover-1">1</a>
    </sup>.</p>
    <section class="footnotes">
      <ol class="footnotes-list">
        <div id="fn-popover-1" popover="" role="note" class="footnote-popover"></div>
        <li id="fn1">
          <a href="#fnref1" class="footnote-number">1</a>
          <p>This is the footnote content.</p>
        </li>
      </ol>
    </section>
  `;
}

describe("mobile footnote bottom sheet", () => {
  // Reset module cache and DOM before each test so each import gets a fresh module
  // that auto-calls initFootnotes() against the clean DOM.
  beforeEach(async () => {
    vi.resetModules();
    buildDOM();
    setMobile(true);
    await import("../footnotes.js"); // auto-calls initFootnotes() via module-level code
  });

  describe("sheet injection", () => {
    it("injects #footnote-sheet into the body", () => {
      expect(document.getElementById("footnote-sheet")).not.toBeNull();
    });

    it("sheet contains a panel, close button, and content area", () => {
      expect(document.getElementById("footnote-sheet-panel")).not.toBeNull();
      expect(document.getElementById("footnote-sheet-close")).not.toBeNull();
      expect(document.getElementById("footnote-sheet-content")).not.toBeNull();
    });

    it("does not inject a second sheet if initFootnotes is called again", async () => {
      const { initFootnotes } = await import("../footnotes.js");
      initFootnotes(); // second call — guard should prevent double injection
      expect(document.querySelectorAll("#footnote-sheet").length).toBe(1);
    });
  });

  describe("tap to open (mobile)", () => {
    it("opens the sheet when a trigger is clicked on mobile", () => {
      const trigger = document.querySelector(".footnote-trigger");
      trigger.click();
      expect(document.getElementById("footnote-sheet").classList.contains("open")).toBe(true);
    });

    it("populates the sheet with the footnote content", () => {
      document.getElementById("fn-popover-1").innerHTML = "<p>This is the footnote content.</p>";
      document.querySelector(".footnote-trigger").click();
      expect(document.getElementById("footnote-sheet-content").innerHTML).toContain("This is the footnote content.");
    });

    it("prevents default navigation when triggered on mobile", () => {
      const trigger = document.querySelector(".footnote-trigger");
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      trigger.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it("does not open the sheet on desktop", async () => {
      // Desktop: reset module with matchMedia returning false, re-init
      vi.resetModules();
      buildDOM();
      setMobile(false);
      await import("../footnotes.js");

      document.querySelector(".footnote-trigger").click();
      expect(document.getElementById("footnote-sheet").classList.contains("open")).toBe(false);
    });
  });

  describe("backref navigation on mobile", () => {
    it("does not open a popover when hashchange navigates to a footnote ref on mobile", () => {
      const popover = document.getElementById("fn-popover-1");
      popover.showPopover = vi.fn();

      // jsdom fires hashchange automatically on hash assignment; the guard should suppress the popover
      window.location.hash = "#fnref1";

      expect(popover.showPopover).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("sheet panel has role=dialog", () => {
      expect(document.getElementById("footnote-sheet-panel").getAttribute("role")).toBe("dialog");
    });

    it("sheet panel has aria-modal=true", () => {
      expect(document.getElementById("footnote-sheet-panel").getAttribute("aria-modal")).toBe("true");
    });

    it("sheet panel has aria-label", () => {
      expect(document.getElementById("footnote-sheet-panel").getAttribute("aria-label")).toBe("Footnote");
    });
  });

  describe("scroll lock", () => {
    it("locks body scroll when sheet opens", () => {
      document.getElementById("fn-popover-1").innerHTML = "<p>Content</p>";
      document.querySelector(".footnote-trigger").click();
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("restores body scroll when sheet closes", () => {
      document.getElementById("fn-popover-1").innerHTML = "<p>Content</p>";
      document.querySelector(".footnote-trigger").click();
      document.getElementById("footnote-sheet-close").click();
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("dismiss", () => {
    beforeEach(() => {
      document.getElementById("fn-popover-1").innerHTML = "<p>Content</p>";
      document.querySelector(".footnote-trigger").click();
    });

    it("closes the sheet when the X button is clicked", () => {
      document.getElementById("footnote-sheet-close").click();
      expect(document.getElementById("footnote-sheet").classList.contains("open")).toBe(false);
    });

    it("closes the sheet when the backdrop is clicked", () => {
      // Click the sheet overlay itself (not the panel)
      document.getElementById("footnote-sheet").click();
      expect(document.getElementById("footnote-sheet").classList.contains("open")).toBe(false);
    });

    it("does not close when clicking inside the panel", () => {
      document.getElementById("footnote-sheet-panel").click();
      expect(document.getElementById("footnote-sheet").classList.contains("open")).toBe(true);
    });

    it("closes the sheet when Escape is pressed", () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      expect(document.getElementById("footnote-sheet").classList.contains("open")).toBe(false);
    });

    it("does not close the sheet when other keys are pressed", () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      expect(document.getElementById("footnote-sheet").classList.contains("open")).toBe(true);
    });

    it("returns focus to the trigger after closing via X button", () => {
      const trigger = document.querySelector(".footnote-trigger");
      document.getElementById("footnote-sheet-close").click();
      expect(document.activeElement).toBe(trigger);
    });
  });
});
