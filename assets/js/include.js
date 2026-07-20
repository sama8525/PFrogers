/* =================================================================
   include.js — builds the shared header & footer on every page,
   handles the mobile menu, highlights the current page, and adds
   a gentle scroll-reveal. Edit the nav or footer ONCE here and it
   updates across the whole site.

   ---- TO EDIT CONTACT INFO / SOCIAL LINKS ----
   Change the values in the SITE object just below.
   ================================================================= */

const SITE = {
  candidate: "David Rogers",
  office: "Pflugerville City Council · Place 6",
  logo: "assets/img/logo.jpg",
  email: "info@electmisterrogers.com",
  treasurer: "Omar Peña",
  // Social links appear in the footer only when set to a real URL (not "#").
  social: {
    facebook: "#",
    instagram: "#",
    x: "#"
  }
};

const NAV = [
  { href: "index.html",        label: "Home" },
  { href: "about.html",        label: "About Mr. Rogers" },
  { href: "record.html",       label: "Record & Plan" },
  { href: "pflugerville.html", label: "Our Pflugerville" },
  { href: "updates.html",      label: "Updates" },
  { href: "volunteer.html",    label: "Volunteer" },
  { href: "contact.html",      label: "Contact" },
];

/* ---- current page file name ---- */
const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();

/* ---- HEADER ---- */
function buildHeader() {
  const links = NAV.map(item => {
    const active = item.href.toLowerCase() === current ? ' aria-current="page"' : "";
    return `<a href="${item.href}"${active}>${item.label}</a>`;
  }).join("");

  return `
  <div class="topbar">
    A beautiful day in Pflugerville &mdash; <a href="donate.html">Chip in to the campaign &rarr;</a>
  </div>
  <header class="masthead">
    <div class="wrap masthead__inner">
      <a class="brand" href="index.html">
        <img src="${SITE.logo}" alt="${SITE.candidate} for City Council logo">
        <span class="brand__text">
          <span class="brand__name">${SITE.candidate}</span><br>
          <span class="brand__sub">${SITE.office}</span>
        </span>
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">&#9776;</button>
      <nav class="nav" id="primary-nav" aria-label="Primary">
        ${links}
        <a class="btn btn--green" href="yard-sign.html">Yard Sign</a>
        <a class="btn btn--gold" href="donate.html">Donate</a>
      </nav>
    </div>
  </header>`;
}

/* ---- FOOTER ---- */
function buildFooter() {
  const navLinks = NAV.map(i => `<li><a href="${i.href}">${i.label}</a></li>`).join("");
  const fb = SITE.social.facebook && SITE.social.facebook !== "#"
    ? `<a href="${SITE.social.facebook}" aria-label="Facebook">f</a>` : "";
  const ig = SITE.social.instagram && SITE.social.instagram !== "#"
    ? `<a href="${SITE.social.instagram}" aria-label="Instagram">ig</a>` : "";
  const x  = SITE.social.x && SITE.social.x !== "#"
    ? `<a href="${SITE.social.x}" aria-label="X">x</a>` : "";

  return `
  <footer class="site-footer">
    <div class="wrap site-footer__grid">
      <div>
        <h4>${SITE.candidate} for ${SITE.office.replace("· ", "")}</h4>
        <p style="max-width:38ch;color:#cdbfa9;">Howdy, neighbor! Mr. Rogers loves this city and would be honored to keep working for you. Pitch in, sign up, or just say hello.</p>
        <div class="social-row">${fb}${ig}${x}</div>
      </div>
      <div>
        <h4>Around the Site</h4>
        <ul>${navLinks}</ul>
      </div>
      <div>
        <h4>Get Involved</h4>
        <ul>
          <li><a href="donate.html">Donate</a></li>
          <li><a href="volunteer.html">Volunteer</a></li>
          <li><a href="yard-sign.html">Request a yard sign</a></li>
          <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer-disclaimer">
      Political advertising paid for by the David Rogers Campaign, ${SITE.treasurer}, Treasurer.<br>
      &copy; <span id="yr"></span> ${SITE.candidate} for City Council. Made with care, right here in Pflugerville.
    </div>
  </footer>`;
}

/* ---- INJECT ---- */
document.addEventListener("DOMContentLoaded", () => {
  const headerMount = document.querySelector('[data-include="header"]');
  const footerMount = document.querySelector('[data-include="footer"]');
  if (headerMount) headerMount.outerHTML = buildHeader();
  if (footerMount) footerMount.outerHTML = buildFooter();

  // Year
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  // Mobile menu toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // Scroll reveal
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && items.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add("is-in"));
  }
});
