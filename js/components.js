async function loadComponents() {
    const navbarEl = document.getElementById("navbar");
    const footerEl = document.getElementById("footer");

    const [navbar, footer] = await Promise.all([
        fetch("components/navbar.html"),
        fetch("components/footer.html")
    ]);

    if (navbarEl && navbar.ok) navbarEl.innerHTML = await navbar.text();
    if (footerEl && footer.ok) footerEl.innerHTML = await footer.text();

    setActiveLink();
    setupMobileMenu();
}

function setupMobileMenu() {
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
        menu.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
    };

    toggle.addEventListener("click", () => {
        setOpen(!menu.classList.contains("is-open"));
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("is-open")) setOpen(false);
    });
}

function setActiveLink() {
    const raw = window.location.pathname.split("/").pop();
    const currentPage = raw || "index.html";
    document.querySelectorAll(".navbar .nav-menu a").forEach((link) => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}
