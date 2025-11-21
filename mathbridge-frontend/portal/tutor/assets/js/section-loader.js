// Section Module Loader for Tutor Portal
// Similar to admin portal's loadSectionModule

const __tutorModulesLoaded = new Set();

/**
 * Ensure CSS is loaded only once
 */
function ensureSectionCssLoaded(href) {
  if (!href) return;
  
  // Check if CSS already loaded
  const exists = Array.from(document.styleSheets).some(
    (s) => s.href && s.href.includes(href)
  );
  if (exists) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-section-css", "true");
  document.head.appendChild(link);
}

/**
 * Load a section module:
 * - Load CSS (if provided)
 * - Load HTML (if provided)
 * - Execute JS module (if provided)
 * 
 * @param {string} sectionId - ID of the section container
 * @param {string} htmlPath - Path to HTML file (relative to sections/)
 * @param {string} cssPath - Path to CSS file (relative to assets/css/sections/)
 * @param {Function} jsModuleLoader - Function to load/execute JS module
 */
async function loadTutorSectionModule(sectionId, htmlPath, cssPath, jsModuleLoader) {
  const host = document.getElementById(sectionId);
  if (!host) {
    console.warn(`Section container not found: ${sectionId}`);
    return;
  }

  // Only load once
  if (__tutorModulesLoaded.has(sectionId)) {
    return;
  }

  try {
    // Load CSS first
    if (cssPath) {
      const fullCssPath = `assets/css/sections/${cssPath}`;
      ensureSectionCssLoaded(fullCssPath);
    }

    // Load HTML
    if (htmlPath) {
      const fullHtmlPath = `sections/${htmlPath}`;
      const response = await fetch(fullHtmlPath, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load ${fullHtmlPath}: ${response.status}`);
      }
      const html = await response.text();
      
      // Remove any <style> tags from HTML (CSS should be in separate file)
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const styleTags = tempDiv.querySelectorAll("style");
      styleTags.forEach(style => style.remove());
      
      host.innerHTML = tempDiv.innerHTML;
    }

    // Execute JS module
    if (typeof jsModuleLoader === "function") {
      await jsModuleLoader();
    }

    __tutorModulesLoaded.add(sectionId);
  } catch (error) {
    console.error(`Error loading section module ${sectionId}:`, error);
    throw error;
  }
}

/**
 * Unload a section module (for cleanup)
 */
function unloadTutorSectionModule(sectionId) {
  __tutorModulesLoaded.delete(sectionId);
  
  // Remove CSS if needed
  const cssLinks = document.querySelectorAll(`link[data-section-css]`);
  // Note: In practice, you might want to keep CSS loaded for performance
  // This is just for cleanup if needed
}

// Export for use in tutor-main.js
if (typeof window !== "undefined") {
  window.loadTutorSectionModule = loadTutorSectionModule;
  window.unloadTutorSectionModule = unloadTutorSectionModule;
}

