async function loadComponents() {

    const navbar = await fetch('components/navbar.html');
    const footer = await fetch('components/footer.html');

    const navbarEl = document.getElementById('navbar');
    const footerEl = document.getElementById('footer');

    if (navbarEl) {
        navbarEl.innerHTML = await navbar.text();
    }

    if (footerEl) {
        footerEl.innerHTML = await footer.text();
    }

    setActiveLink();
    setupMobileMenu();
}

function setupMobileMenu() {

    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("navMenu");

    if (!toggle || !menu) return;

    const setOpen = (open) => {

        menu.classList.toggle("active", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");

        const icon = toggle.querySelector("i");
        if (!icon) return;

        icon.classList.toggle("fa-bars", !open);
        icon.classList.toggle("fa-xmark", open);
    };

    toggle.addEventListener("click", () => {
        setOpen(!menu.classList.contains("active"));
    });

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => setOpen(false));
    });
}

function setActiveLink() {

    const raw = window.location.pathname.split("/").pop();
    const currentPage = raw || "index.html";

    document
        .querySelectorAll(".navbar a")
        .forEach(link => {

            if (link.getAttribute("href") === currentPage) {

                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        });
}

loadComponents();
