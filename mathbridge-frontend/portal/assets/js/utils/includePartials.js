// file: portal/assets/js/utils/includePartials.js
(function (global) {
  async function loadPartial(selector, url) {
    const host = document.querySelector(selector);
    if (!host) return;

    // thêm version để tránh cache
    const withTs = url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();

    const res = await fetch(withTs, { cache: "no-cache" });
    const html = await res.text();
    host.innerHTML = html;

    // chạy lại script trong partial
    const scripts = host.querySelectorAll("script");
    scripts.forEach((old) => {
      const s = document.createElement("script");
      if (old.src) {
        s.src = old.src + (old.src.includes("?") ? "&" : "?") + "v=" + Date.now();
      } else {
        s.textContent = old.textContent;
      }
      if (old.type) s.type = old.type;
      document.head.appendChild(s);
      document.head.removeChild(s);
    });
  }

  async function includePartials(opts = {}) {
    const tasks = [];
    if (opts.header) tasks.push(loadPartial("header", opts.header));
    if (opts.footer) tasks.push(loadPartial("footer", opts.footer));
    await Promise.all(tasks);

    // gọi lại header
    if (typeof window.mbRenderHeader === "function") {
      window.mbRenderHeader();
    }

    document.dispatchEvent(new CustomEvent("partials:loaded"));
  }

  global.includePartials = includePartials;
})(window);

