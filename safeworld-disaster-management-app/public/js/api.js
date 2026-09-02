// Thin wrapper around fetch() for the SafeWorld API.
const API_BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("safeworld_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) Object.assign(headers, authHeaders());

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    /* no JSON body, e.g. 204 */
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
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
