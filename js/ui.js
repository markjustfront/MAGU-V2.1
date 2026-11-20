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

    /* Short clips: play muted while on screen, pause when scrolled away. */
    function initAutoplayOnView() {
        const clips = document.querySelectorAll("video[data-autoplay-view]");
        if (!clips.length) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    if (video.dataset.userPaused === "true") return;
                    if (video.preload === "none") video.preload = "auto";
                    video.muted = true;
                    const p = video.play();
                    if (p && p.catch) p.catch(() => {});
                } else if (!video.paused) {
                    video.dataset.autoPaused = "true";
                    video.pause();
                }
            });
        }, { threshold: 0.5 });
        clips.forEach((video) => {
            video.addEventListener("pause", () => {
                if (video.dataset.autoPaused === "true") { video.dataset.autoPaused = ""; return; }
                video.dataset.userPaused = "true";
            });
            video.addEventListener("play", () => { video.dataset.userPaused = ""; });
            io.observe(video);
        });
    }

    async function boot() {
        respectReducedMotion();
        initAutoplayOnView();
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
