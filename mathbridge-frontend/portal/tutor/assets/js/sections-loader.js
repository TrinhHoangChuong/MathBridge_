// file: portal/tutor/assets/js/sections-loader.js
(function (win, doc) {
  async function loadSection(placeholder) {
    if (!placeholder) return;
    const src = placeholder.getAttribute("data-section-src");
    if (!src) {
      placeholder.remove();
      return;
    }

    const url = src + (src.includes("?") ? "&" : "?") + "v=" + Date.now();

    try {
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load ${src}: ${response.status}`);
      }

      const html = await response.text();
      const template = doc.createElement("template");
      template.innerHTML = html.trim();

      placeholder.replaceWith(template.content.cloneNode(true));
    } catch (error) {
      console.error("[Tutor Sections] Unable to load section:", src, error);
      placeholder.replaceWith(doc.createComment(`Failed to load section ${src}`));
    }
  }

  async function loadAllSections() {
    const placeholders = Array.from(doc.querySelectorAll("[data-section-src]"));
    for (const placeholder of placeholders) {
      // eslint-disable-next-line no-await-in-loop
      await loadSection(placeholder);
    }
  }

  function startLoading() {
    const promise = loadAllSections()
      .then(() => {
        doc.dispatchEvent(new CustomEvent("tutor-sections:loaded"));
      })
      .catch((error) => {
        console.error("[Tutor Sections] Error while loading sections", error);
        throw error;
      });

    win.tutorSectionsReady = promise;
    return promise;
  }

  if (doc.readyState === "loading") {
    doc.addEventListener(
      "DOMContentLoaded",
      () => {
        startLoading();
      },
      { once: true }
    );
  } else {
    startLoading();
  }
})(window, document);

