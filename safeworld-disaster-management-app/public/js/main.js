// Shared behaviour that runs on every page: mobile nav, the alert band,
// the SOS quick-dial modal, and swapping the header auth links based on
// whether someone is signed in.

function getStoredUser() {
  try {
    const raw = localStorage.getItem("safeworld_user");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function signOut() {
  localStorage.removeItem("safeworld_token");
  localStorage.removeItem("safeworld_user");
  window.location.href = "index.html";
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));
}

function highlightActiveLink() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === current) a.classList.add("active");
  });
}

function renderAuthArea() {
  const el = document.querySelector("[data-auth-area]");
  if (!el) return;
  const user = getStoredUser();
  if (user) {
    const dashLink =
      user.role === "citizen"
        ? ""
        : `<a href="dashboard.html" class="btn btn-outline btn-sm">Dashboard</a>`;
    el.innerHTML = `
      <span class="badge-role">${user.role}</span>
      <span style="color:#fff; font-size:.88rem; font-weight:600;">${user.name.split(" ")[0]}</span>
      ${dashLink}
      <button class="btn btn-outline btn-sm" id="signOutBtn" type="button">Sign out</button>
    `;
    document.getElementById("signOutBtn").addEventListener("click", signOut);
  } else {
    el.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Sign in</a>
      <a href="register.html" class="btn btn-primary btn-sm">Volunteer / Register</a>
    `;
  }
}

const SEVERITY_RANK = { Red: 3, Orange: 2, Yellow: 1, Green: 0 };
const SEVERITY_LABEL = {
  Green: "All clear — no active regional alerts",
  Yellow: "Advisory in effect — stay informed",
  Orange: "Warning in effect — take precautions now",
  Red: "Severe danger — follow official instructions immediately",
};

async function initAlertBand() {
  const band = document.querySelector("[data-alert-band]");
  if (!band) return;
  try {
    const { alerts } = await api.getAlerts();
    const active = alerts.filter((a) => a.active);
    let top = "Green";
    active.forEach((a) => {
      if ((SEVERITY_RANK[a.severity] || 0) > SEVERITY_RANK[top]) top = a.severity;
    });
    band.dataset.level = top.toLowerCase();
    const count = active.length;
    const summary =
      count === 0
        ? SEVERITY_LABEL.Green
        : `${SEVERITY_LABEL[top]} — ${count} active alert${count > 1 ? "s" : ""} statewide`;
    band.innerHTML = `<span class="dot" aria-hidden="true"></span><span>${summary}</span><a href="index.html#alerts">View alerts →</a>`;
  } catch (err) {
    band.innerHTML = `<span class="dot" aria-hidden="true"></span><span>Live alert feed unavailable — check your connection.</span>`;
  }
}

function initSOS() {
  const fab = document.querySelector("[data-sos-fab]");
  const backdrop = document.querySelector("[data-sos-modal]");
  if (!fab || !backdrop) return;

  const open = () => {
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    populateSOSLocation();
  };
  const close = () => {
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
  };

  fab.addEventListener("click", open);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelectorAll("[data-sos-close]").forEach((btn) => btn.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function populateSOSLocation() {
  const out = document.querySelector("[data-sos-location]");
  if (!out) return;
  if (!navigator.geolocation) {
    out.textContent = "Location sharing isn't supported on this device.";
    return;
  }
  out.textContent = "Locating you…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      out.innerHTML = `Your location: <span class="mono">${latitude.toFixed(
        5
      )}, ${longitude.toFixed(5)}</span> — read this out when you call, or share the link below.<br><a href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}" target="_blank" rel="noopener">Open map link ↗</a>`;
    },
    () => {
      out.textContent = "Couldn't get your location. Allow location access and try again, or share your address verbally when you call.";
    },
    { timeout: 8000 }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  highlightActiveLink();
  renderAuthArea();
  initAlertBand();
  initSOS();
});
