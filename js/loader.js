(function () {
    "use strict";

    /* Full-screen MAGU logo overlay.
       Shown once on the first page load of a session (via the inline
       boot script, which also reads sessionStorage before paint so
       later pages do not flash the overlay). Later page loads and
       internal clicks skip it. Hidden after a short minimum time, or
       by a hard fallback so it can never stick. */
    var MIN_MS = 500;
    var FADE_MS = 350;
    var FALLBACK_MS = 3000;
    var html = document.documentElement;
    var params = new URLSearchParams(window.location.search);
    var skipLoader = params.get("loader") === "0";
    var forceLoader = params.get("loader") === "1";
    var freeze = params.get("freeze");
    var STORAGE_KEY = "magu-loader";
    var hideTimer = 0;
    var fadeTimer = 0;
    var fallbackTimer = 0;
    var hidden = false;
    var startedAt = (window.performance && performance.now) ? performance.now() : Date.now();

    function hasSeenLoader() {
        try {
            return sessionStorage.getItem(STORAGE_KEY) === "1";
        } catch (e) {
            return false;
        }
    }

    function markLoaderSeen() {
        try {
            sessionStorage.setItem(STORAGE_KEY, "1");
        } catch (e) {}
    }

    function skipForSession() {
        if (forceLoader) return false;
        if (freeze !== null && freeze !== "") return false;
        return hasSeenLoader();
    }

    function reducedMotion() {
        try {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch (e) {
            return false;
        }
    }

    function loaderEl() {
        return document.getElementById("loader");
    }

    function hideLoader(immediate) {
        if (hidden) return;
        hidden = true;
        if (hideTimer) window.clearTimeout(hideTimer);
        if (fadeTimer) window.clearTimeout(fadeTimer);
        if (fallbackTimer) window.clearTimeout(fallbackTimer);

        if (immediate) {
            html.classList.remove("is-loading", "is-loader-out", "is-leaving");
            var node = loaderEl();
            if (node) node.setAttribute("aria-hidden", "true");
            return;
        }

        html.classList.add("is-loader-out");
        html.classList.remove("is-leaving");
        fadeTimer = window.setTimeout(function () {
            html.classList.remove("is-loading", "is-loader-out");
            var node = loaderEl();
            if (node) node.setAttribute("aria-hidden", "true");
        }, FADE_MS);
    }

    function showLoader(leaving) {
        hidden = false;
        if (hideTimer) window.clearTimeout(hideTimer);
        if (fadeTimer) window.clearTimeout(fadeTimer);
        var node = loaderEl();
        if (node) node.setAttribute("aria-hidden", "true");
        html.classList.add("is-loading");
        html.classList.remove("is-loader-out");
        if (leaving) html.classList.add("is-leaving");
        else html.classList.remove("is-leaving");
    }

    function pageKey(pathname) {
        var path = pathname || "/";
        if (path.endsWith("/index.html")) path = path.slice(0, -10);
        if (!path.endsWith("/")) path += "/";
        return path;
    }

    function isInternalNavLink(anchor, event) {
        if (!anchor || event.defaultPrevented) return false;
        if (event.button !== 0) return false;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
        if (anchor.target && anchor.target !== "_self") return false;
        if (anchor.hasAttribute("download")) return false;
        if (anchor.closest("[data-lightbox], #lightbox")) return false;
        var href = anchor.getAttribute("href");
        if (!href) return false;
        var trimmed = href.trim();
        if (!trimmed) return false;
        if (trimmed.charAt(0) === "#") return false;
        var protocol = trimmed.split(":")[0].toLowerCase();
        if (protocol === "mailto" || protocol === "tel" || protocol === "javascript") return false;
        var url;
        try {
            url = new URL(anchor.href);
        } catch (e) {
            return false;
        }
        if (url.origin !== window.location.origin) return false;
        if (pageKey(url.pathname) === pageKey(window.location.pathname) && url.search === window.location.search) {
            return false;
        }
        return true;
    }

    function whenLogoReady(done) {
        var img = document.querySelector("#loader img");
        if (!img || img.complete) {
            done();
            return;
        }
        var finished = false;
        var finish = function () {
            if (finished) return;
            finished = true;
            done();
        };
        img.addEventListener("load", finish, { once: true });
        img.addEventListener("error", finish, { once: true });
        /* If complete flipped to true between the check and the listeners. */
        if (img.complete) finish();
    }

    function scheduleHide() {
        if (freeze !== null && freeze !== "") return;
        if (skipLoader || reducedMotion()) {
            hideLoader(true);
            return;
        }
        whenLogoReady(function () {
            var now = (window.performance && performance.now) ? performance.now() : Date.now();
            var wait = Math.max(0, MIN_MS - (now - startedAt));
            hideTimer = window.setTimeout(function () {
                hideLoader(false);
            }, wait);
        });
        fallbackTimer = window.setTimeout(function () {
            hideLoader(false);
        }, FALLBACK_MS);
    }

    function onNavigateClick(event) {
        if (skipLoader || reducedMotion() || skipForSession()) return;
        var anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
        if (!isInternalNavLink(anchor, event)) return;
        showLoader(true);
    }

    /* Restore a clean page if the browser hands back a cached copy
       that was mid-transition when we left. */
    window.addEventListener("pageshow", function (event) {
        if (event.persisted || html.classList.contains("is-leaving")) {
            hideLoader(true);
        }
    });

    if (freeze !== null && freeze !== "") {
        html.classList.add("is-loading");
        html.setAttribute("data-freeze", freeze);
        html.style.setProperty("--freeze", "-" + freeze + "s");
        return;
    }

    if (skipLoader || reducedMotion() || skipForSession()) {
        hideLoader(true);
        return;
    }

    /* Remember this visit before any later click or next page load. */
    markLoaderSeen();

    /* Do not intercept internal clicks: the overlay is first-load only. */

    if (!html.classList.contains("is-loading")) {
        html.classList.add("is-loading");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", scheduleHide, { once: true });
    } else {
        scheduleHide();
    }
})();
