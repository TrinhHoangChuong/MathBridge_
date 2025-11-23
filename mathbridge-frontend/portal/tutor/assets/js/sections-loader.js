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

      // Extract scripts before cloning
      const scripts = Array.from(template.content.querySelectorAll("script"));
      const scriptData = scripts.map(script => ({
        src: script.src,
        text: script.textContent,
        type: script.type,
        async: script.async,
        defer: script.defer
      }));
      
      // Remove scripts from template (they won't execute in template anyway)
      scripts.forEach(script => script.remove());

      // Insert HTML content
      const clonedContent = template.content.cloneNode(true);
      const parent = placeholder.parentElement;
      placeholder.replaceWith(clonedContent);
      
      // Find the inserted section element
      const insertedSection = parent.querySelector('section.content-section') || parent.lastElementChild;
      const container = insertedSection || parent;
      
      // Execute scripts after DOM insertion
      scriptData.forEach((scriptInfo) => {
        const newScript = doc.createElement("script");
        if (scriptInfo.src) {
          newScript.src = scriptInfo.src;
          newScript.async = scriptInfo.async || false;
          newScript.defer = scriptInfo.defer || false;
        } else {
          newScript.textContent = scriptInfo.text;
        }
        if (scriptInfo.type) {
          newScript.type = scriptInfo.type;
        }
        // Append to the section or body
        container.appendChild(newScript);
      });
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

