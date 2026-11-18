(function (global) {
    let items = [];
    let index = 0;
    let lastFocus = null;
    let startX = 0;

    function el(id) { return document.getElementById(id); }

    function collect() {
        items = [...document.querySelectorAll("[data-lightbox]")];
    }

    function open(i) {
        collect();
        if (!items.length) return;
        index = (i + items.length) % items.length;
        lastFocus = document.activeElement;
        const box = el("lightbox");
        box.classList.add("is-open");
        box.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        show();
        el("lightbox-close").focus();
    }

    function close() {
        const box = el("lightbox");
        if (!box) return;
        box.classList.remove("is-open");
        box.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function show() {
        const item = items[index];
        if (!item) return;
        const img = el("lightbox-img");
        const cap = el("lightbox-caption");
        const full = item.getAttribute("data-full") || item.querySelector("img")?.currentSrc || item.querySelector("img")?.src;
        const alt = item.getAttribute("data-caption") || item.querySelector("img")?.alt || "";
        img.src = full;
        img.alt = alt;
        cap.textContent = alt;
        el("lightbox-prev").disabled = items.length < 2;
        el("lightbox-next").disabled = items.length < 2;
    }

    function prev() { index = (index - 1 + items.length) % items.length; show(); }
    function next() { index = (index + 1) % items.length; show(); }

    function trap(e) {
        const box = el("lightbox");
        if (!box || !box.classList.contains("is-open") || e.key !== "Tab") return;
        const focusable = [...box.querySelectorAll("button:not([disabled])")];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function init() {
        const box = el("lightbox");
        if (!box) return;
        collect();
        items.forEach((node) => {
            node.addEventListener("click", (e) => {
                e.preventDefault();
                collect();
                open(items.indexOf(node));
            });
        });
        el("lightbox-close").addEventListener("click", close);
        el("lightbox-prev").addEventListener("click", (e) => { e.stopPropagation(); prev(); });
        el("lightbox-next").addEventListener("click", (e) => { e.stopPropagation(); next(); });
        box.addEventListener("click", (e) => { if (e.target === box) close(); });
        document.addEventListener("keydown", (e) => {
            if (!box.classList.contains("is-open")) return;
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
            trap(e);
        });
        box.addEventListener("touchstart", (e) => { startX = e.changedTouches[0].screenX; }, { passive: true });
        box.addEventListener("touchend", (e) => {
            const dx = e.changedTouches[0].screenX - startX;
            if (Math.abs(dx) > 50) { if (dx > 0) prev(); else next(); }
        }, { passive: true });
    }

    global.MAGU_LIGHTBOX = { init, open, close };
})(window);
