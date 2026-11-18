(function () {
    function respectReducedMotion() {
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        document.querySelectorAll("video[autoplay]").forEach((video) => {
            video.removeAttribute("autoplay");
            video.pause();
        });
    }

    function initReveals() {
        const nodes = document.querySelectorAll(".reveal");
        if (!nodes.length) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            nodes.forEach((n) => n.classList.add("is-visible"));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
        nodes.forEach((n) => io.observe(n));
    }

    async function boot() {
        respectReducedMotion();
        if (typeof loadComponents === "function") {
            await loadComponents();
        }
        if (window.MAGU) MAGU.init();
        initReveals();
        if (window.MAGU_LIGHTBOX) MAGU_LIGHTBOX.init();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
