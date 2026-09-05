// SafeWorld API client
// Supports both live Node.js Express backend and standalone GitHub Pages static hosting via localStorage fallback.

const API_BASE = "/api";

// Seed data used when running purely on GitHub Pages / static hosting without server.js
const SEED_DATA = {
  alerts: [
    {
      id: "a1",
      title: "Heavy Rainfall Warning — Coastal Tamil Nadu",
      type: "Flood",
      severity: "Orange",
      region: "Chennai, Kanchipuram, Chengalpattu",
      description: "IMD forecasts heavy to very heavy rainfall over the next 48 hours. Low-lying areas may experience waterlogging. Avoid unnecessary travel near river banks and stormwater drains.",
      issued: "2026-08-19T06:00:00.000Z",
      expires: "2026-08-22T06:00:00.000Z",
      active: true,
      createdBy: "TN Disaster Management Authority"
    },
    {
      id: "a2",
      title: "Heat Advisory — Interior Districts",
      type: "Heatwave",
      severity: "Yellow",
      region: "Madurai, Tiruchirappalli, Virudhunagar",
      description: "Day temperatures expected to be 3-4°C above normal. Stay hydrated, avoid direct sun between 12pm-3pm, and check on elderly neighbours.",
      issued: "2026-08-18T04:30:00.000Z",
      expires: "2026-08-24T04:30:00.000Z",
      active: true,
      createdBy: "State Weather Cell"
    },
    {
      id: "a3",
      title: "Cyclone Watch — Bay of Bengal System",
      type: "Cyclone",
      severity: "Yellow",
      region: "Entire Tamil Nadu Coast",
      description: "A low-pressure area over the标志 Bay of Bengal may intensify. Fishermen are advised not to venture into the sea. Monitor official updates closely over the coming days.",
      issued: "2026-08-20T10:00:00.000Z",
      expires: "2026-08-26T10:00:00.000Z",
      active: true,
      createdBy: "Regional Meteorological Centre"
    }
  ],
  contacts: [
    { id: "c1", name: "National Emergency Number", number: "112", category: "National", notes: "Single number for police, fire and medical emergencies across India." },
    { id: "c2", name: "National Disaster Response Force (NDRF)", number: "011-24363260", category: "National", notes: "Control room for large-scale disaster response." },
    { id: "c3", name: "Fire Services", number: "101", category: "National", notes: "Fire and rescue emergencies." },
    { id: "c4", name: "Police", number: "100", category: "National", notes: "Law and order emergencies." },
    { id: "c5", name: "Ambulance", number: "108", category: "National", notes: "Free emergency ambulance service." },
    { id: "c6", name: "Disaster Management Helpline", number: "1078", category: "National", notes: "National Disaster Management Authority control room." },
    { id: "c7", name: "Women Helpline", number: "1091", category: "National", notes: "Women in distress." },
    { id: "c8", name: "Child Helpline", number: "1098", category: "National", notes: "Child protection emergencies." },
    { id: "c9", name: "Tamil Nadu State Emergency Operations Centre", number: "1070", category: "Tamil Nadu", notes: "State-level disaster coordination, Chennai." },
    { id: "c10", name: "Chennai District Disaster Control Room", number: "044-25619206", category: "Tamil Nadu", notes: "District-level flood and cyclone control room." },
    { id: "c11", name: "Tamil Nadu Fire & Rescue Services", number: "101 / 044-28447700", category: "Tamil Nadu", notes: "State fire and rescue headquarters." },
    { id: "c12", name: "Coast Guard (Tsunami / Sea Emergency)", number: "1554", category: "National", notes: "Toll-free maritime emergency line." },
    { id: "c13", name: "Blood Bank Helpline", number: "104", category: "Medical", notes: "Health helpline and blood availability." },
    { id: "c14", name: "Gas Leak Emergency (LPG)", number: "1906", category: "Utility", notes: "Report cooking gas leaks." },
    { id: "c15", name: "Electricity Emergency (TANGEDCO)", number: "94987-94987", category: "Utility", notes: "Report downed lines, outages during storms." }
  ],
  shelters: [
    { id: "s1", name: "Kamaraj College Relief Camp", type: "Shelter", address: "Kamaraj College of Engineering & Technology, S.P.G.C Nagar, Virudhunagar", lat: 9.5680, lng: 77.9624, capacity: 400, status: "Open" },
    { id: "s2", name: "Madurai Govt. Rajaji Hospital Trauma Centre", type: "Medical", address: "Panagal Rd, Madurai", lat: 9.9195, lng: 78.1200, capacity: 250, status: "Open" },
    { id: "s3", name: "Chennai Corporation Flood Relief Centre — Kotturpuram", type: "Shelter", address: "Kotturpuram, Chennai", lat: 13.0169, lng: 80.2422, capacity: 600, status: "Open" },
    { id: "s4", name: "Virudhunagar District Collectorate Control Room", type: "Control Room", address: "Collectorate, Virudhunagar", lat: 9.5851, lng: 77.9622, capacity: 0, status: "Open" },
    { id: "s5", name: "Tuticorin Coastal Cyclone Shelter", type: "Shelter", address: "Harbour Area, Thoothukudi", lat: 8.7642, lng: 78.1348, capacity: 500, status: "Standby" }
  ],
  reports: [
    {
      id: "r1",
      type: "Flooding",
      description: "Water accumulating near Velachery main road junction, depth approx 1.5 feet.",
      location: "Velachery Main Road, Chennai",
      severity: "Medium — needs attention soon",
      contactNumber: "9876543210",
      reporterName: "Citizen Reporter",
      status: "Verified",
      submittedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  users: [
    { id: "u_admin", name: "Administrator", email: "admin@safeworld.org", password: "admin", role: "admin" },
    { id: "u_vol", name: "Volunteer", email: "volunteer@safeworld.org", password: "volunteer", role: "volunteer" },
    { id: "u_cit", name: "Gokul", email: "gokularun1709@gmail.com", password: "password", role: "citizen" },
    { id: "u_cit2", name: "Citizen User", email: "citizen@safeworld.org", password: "citizen", role: "citizen" }
  ]
};

// Client-side local datastore helpers
function getLocalStore(key, fallback) {
  try {
    const data = localStorage.getItem(`safeworld_db_${key}`);
    if (data) return JSON.parse(data);
    localStorage.setItem(`safeworld_db_${key}`, JSON.stringify(fallback));
    return fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocalStore(key, val) {
  try {
    localStorage.setItem(`safeworld_db_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error(`LocalStore write failed for ${key}`, e);
  }
}

function uid() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
}

function authHeaders() {
  const token = localStorage.getItem("safeworld_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Universal API runner: tries server first; seamlessly falls back to client storage on GitHub Pages
async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) Object.assign(headers, authHeaders());

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      try {
        return await res.json();
      } catch (err) {
        return null;
      }
    }
  } catch (netErr) {
    // Network error / server not running / GitHub Pages static environment
  }

  // Fallback to client-side data engine
  return localApiHandler(path, method, body);
}

// Client-side mock handler for GitHub Pages
function localApiHandler(path, method, body) {
  const cleanPath = path.split("?")[0];
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("safeworld_user")); } catch (e) { return null; }
  })();

  // 1. Auth: Register
  if (cleanPath === "/auth/register" && method === "POST") {
    const { name, email, password, role } = body || {};
    if (!name || !email || !password) throw new Error("Name, email and password are all required.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    const users = getLocalStore("users", SEED_DATA.users);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with that email already exists.");
    }
    const newUser = {
      id: uid(),
      name,
      email,
      role: role === "volunteer" ? "volunteer" : "citizen",
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setLocalStore("users", users);
    const token = `local_token_${newUser.id}`;
    return { token, user: newUser };
  }

  // 2. Auth: Login
  if (cleanPath === "/auth/login" && method === "POST") {
    const { email, password } = body || {};
    if (!email || !password) throw new Error("Email and password are required.");
    const users = getLocalStore("users", SEED_DATA.users);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Allow demo sign in for any email
      const demoRole = email.includes("admin") ? "admin" : (email.includes("vol") ? "volunteer" : "citizen");
      const demoUser = { id: uid(), name: email.split("@")[0], email, role: demoRole };
      users.push(demoUser);
      setLocalStore("users", users);
      return { token: `local_token_${demoUser.id}`, user: demoUser };
    }
    const token = `local_token_${user.id}`;
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  // 3. Auth: Me
  if (cleanPath === "/auth/me") {
    if (!storedUser) throw new Error("Sign in required.");
    return { user: storedUser };
  }

  // 4. Alerts
  if (cleanPath === "/alerts" && method === "GET") {
    const alerts = getLocalStore("alerts", SEED_DATA.alerts);
    const SEVERITY_ORDER = { Red: 3, Orange: 2, Yellow: 1, Green: 0 };
    alerts.sort((a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0));
    return { alerts };
  }

  if (cleanPath === "/alerts" && method === "POST") {
    const { title, type, severity, region, description } = body || {};
    if (!title || !type || !severity || !region || !description) {
      throw new Error("Title, type, severity, region and description are required.");
    }
    const alerts = getLocalStore("alerts", SEED_DATA.alerts);
    const alert = {
      id: uid(),
      title,
      type,
      severity,
      region,
      description,
      issued: new Date().toISOString(),
      expires: null,
      active: true,
      createdBy: storedUser ? storedUser.name : "Volunteer"
    };
    alerts.unshift(alert);
    setLocalStore("alerts", alerts);
    return { alert };
  }

  if (cleanPath.startsWith("/alerts/") && cleanPath.endsWith("/close") && method === "PATCH") {
    const id = cleanPath.split("/")[2];
    const alerts = getLocalStore("alerts", SEED_DATA.alerts);
    const alert = alerts.find(a => a.id === id);
    if (!alert) throw new Error("Alert not found.");
    alert.active = false;
    setLocalStore("alerts", alerts);
    return { alert };
  }

  if (cleanPath.startsWith("/alerts/") && method === "DELETE") {
    const id = cleanPath.split("/")[2];
    let alerts = getLocalStore("alerts", SEED_DATA.alerts);
    alerts = alerts.filter(a => a.id !== id);
    setLocalStore("alerts", alerts);
    return { success: true };
  }

  // 5. Reports
  if (cleanPath === "/reports" && method === "GET") {
    const reports = getLocalStore("reports", SEED_DATA.reports);
    reports.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return { reports };
  }

  if (cleanPath === "/reports" && method === "POST") {
    const { type, description, location, severity, contactNumber, reporterName } = body || {};
    if (!type || !description || !location) {
      throw new Error("Incident type, description and location are required.");
    }
    const reports = getLocalStore("reports", SEED_DATA.reports);
    const report = {
      id: uid(),
      type,
      description,
      location,
      severity: severity || "Medium",
      contactNumber: contactNumber || null,
      reporterName: reporterName || (storedUser ? storedUser.name : "Anonymous"),
      reporterId: storedUser ? storedUser.id : null,
      status: "New",
      submittedAt: new Date().toISOString()
    };
    reports.unshift(report);
    setLocalStore("reports", reports);
    return { report };
  }

  if (cleanPath.startsWith("/reports/") && cleanPath.endsWith("/status") && method === "PATCH") {
    const id = cleanPath.split("/")[2];
    const { status } = body || {};
    const reports = getLocalStore("reports", SEED_DATA.reports);
    const report = reports.find(r => r.id === id);
    if (!report) throw new Error("Report not found.");
    report.status = status;
    setLocalStore("reports", reports);
    return { report };
  }

  // 6. Shelters
  if (cleanPath === "/shelters" && method === "GET") {
    const shelters = getLocalStore("shelters", SEED_DATA.shelters);
    return { shelters };
  }

  if (cleanPath === "/shelters" && method === "POST") {
    const { name, type, address, lat, lng, capacity, status } = body || {};
    if (!name || !type || !address || lat === undefined || lng === undefined) {
      throw new Error("Name, type, address, lat and lng are required.");
    }
    const shelters = getLocalStore("shelters", SEED_DATA.shelters);
    const shelter = {
      id: uid(),
      name,
      type,
      address,
      lat: Number(lat),
      lng: Number(lng),
      capacity: capacity ? Number(capacity) : 0,
      status: status || "Open"
    };
    shelters.push(shelter);
    setLocalStore("shelters", shelters);
    return { shelter };
  }

  if (cleanPath.startsWith("/shelters/") && cleanPath.endsWith("/status") && method === "PATCH") {
    const id = cleanPath.split("/")[2];
    const { status } = body || {};
    const shelters = getLocalStore("shelters", SEED_DATA.shelters);
    const shelter = shelters.find(s => s.id === id);
    if (!shelter) throw new Error("Shelter not found.");
    shelter.status = status;
    setLocalStore("shelters", shelters);
    return { shelter };
  }

  // 7. Contacts
  if (cleanPath === "/contacts" && method === "GET") {
    const contacts = getLocalStore("contacts", SEED_DATA.contacts);
    return { contacts };
  }

  if (cleanPath === "/contacts" && method === "POST") {
    const { name, number, category, notes } = body || {};
    if (!name || !number || !category) {
      throw new Error("Name, number and category are required.");
    }
    const contacts = getLocalStore("contacts", SEED_DATA.contacts);
    const contact = { id: uid(), name, number, category, notes: notes || "" };
    contacts.push(contact);
    setLocalStore("contacts", contacts);
    return { contact };
  }

  if (cleanPath.startsWith("/contacts/") && method === "DELETE") {
    const id = cleanPath.split("/")[2];
    let contacts = getLocalStore("contacts", SEED_DATA.contacts);
    contacts = contacts.filter(c => c.id !== id);
    setLocalStore("contacts", contacts);
    return { success: true };
  }

  return {};
}

const api = {
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload }),
  me: () => apiRequest("/auth/me", { auth: true }),

  getAlerts: () => apiRequest("/alerts"),
  createAlert: (payload) => apiRequest("/alerts", { method: "POST", body: payload, auth: true }),
  closeAlert: (id) => apiRequest(`/alerts/${id}/close`, { method: "PATCH", auth: true }),
  deleteAlert: (id) => apiRequest(`/alerts/${id}`, { method: "DELETE", auth: true }),

  getReports: () => apiRequest("/reports", { auth: true }),
  createReport: (payload) => apiRequest("/reports", { method: "POST", body: payload, auth: true }),
  updateReportStatus: (id, status) =>
    apiRequest(`/reports/${id}/status`, { method: "PATCH", body: { status }, auth: true }),

  getContacts: () => apiRequest("/contacts"),
  createContact: (payload) => apiRequest("/contacts", { method: "POST", body: payload, auth: true }),
  deleteContact: (id) => apiRequest(`/contacts/${id}`, { method: "DELETE", auth: true }),

  getShelters: () => apiRequest("/shelters"),
  createShelter: (payload) => apiRequest("/shelters", { method: "POST", body: payload, auth: true }),
  updateShelterStatus: (id, status) =>
    apiRequest(`/shelters/${id}/status`, { method: "PATCH", body: { status }, auth: true }),
};

