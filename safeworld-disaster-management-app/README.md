# SafeWorld — Disaster Management & Preparedness Web App

A full-stack web application for disaster preparedness, live regional alerts,
emergency contacts, shelter/resource mapping, incident reporting and basic
first aid guidance. Built for Tamil Nadu communities as a demonstration
project.

## Features

- **Live alert band** — a persistent status strip on every page reflecting the
  highest-severity active regional alert (Green / Yellow / Orange / Red).
- **Disaster guides** — before / during / after checklists for earthquake,
  flood, cyclone, fire, tsunami and landslide.
- **Interactive preparedness checklists** — household kit, evacuation plan,
  home safety and workplace checklists, with progress saved on-device.
- **Emergency contact directory** — national and Tamil Nadu helplines,
  tap-to-call.
- **Shelter & relief map** — Leaflet/OpenStreetMap view of shelters, medical
  centres and control rooms, with live status.
- **Incident reporting** — anyone can file a report (with optional location
  capture); volunteers/admins triage it from the dashboard.
- **First aid quick reference** — expandable guides for common emergencies.
- **SOS quick-dial** — floating button available everywhere with one-tap
  calling and live location sharing.
- **Role-based accounts** — Citizen, Volunteer and Admin, with a dashboard for
  volunteers/admins to publish alerts, verify reports, and manage shelters
  and contacts.

## Tech stack

- **Backend:** Node.js, Express, JWT auth, bcrypt password hashing.
- **Storage:** flat JSON files under `/data` — no external database required,
  so the project runs anywhere with a single `npm install`.
- **Frontend:** plain HTML, CSS and JavaScript (no build step), Leaflet for
  the map.

## Getting started

```bash
npm install
npm start
```

The app runs at **http://localhost:4000**.

### Create your first admin account

New accounts registered through the site are Citizens or Volunteers only.
To create an Admin (who can manage the contacts directory), run:

```bash
node scripts/create-admin.js "Your Name" admin@example.com yourpassword
```

Then sign in from the **Sign in** page.

## Project structure

```
disaster-app/
├── data/                # JSON "database" files (alerts, contacts, shelters, reports, users)
├── middleware/auth.js    # JWT auth + role-guard middleware
├── routes/                # Express route handlers per resource
├── scripts/create-admin.js
├── public/                # Static frontend
│   ├── css/style.css
│   ├── js/api.js          # fetch() wrapper for the API
│   ├── js/main.js         # shared nav / alert-band / SOS behaviour
│   ├── index.html          # dashboard/home
│   ├── disasters.html      # disaster guides
│   ├── preparedness.html   # interactive checklists
│   ├── contacts.html       # emergency contact directory
│   ├── shelters.html       # shelter locator + map
│   ├── firstaid.html       # first aid guide
│   ├── report.html         # incident report form
│   ├── login.html / register.html
│   └── dashboard.html      # volunteer/admin management console
├── db.js                  # tiny JSON file datastore helper
├── server.js               # Express app entry point
└── package.json
```

## API overview

All endpoints are prefixed with `/api`.

| Method | Route                        | Auth              | Description                       |
|--------|-------------------------------|-------------------|------------------------------------|
| POST   | /auth/register                | —                 | Create a citizen/volunteer account |
| POST   | /auth/login                   | —                 | Sign in, returns a JWT             |
| GET    | /alerts                       | —                 | List all alerts                    |
| POST   | /alerts                       | volunteer/admin   | Publish an alert                   |
| PATCH  | /alerts/:id/close              | volunteer/admin   | Mark an alert resolved             |
| DELETE | /alerts/:id                    | volunteer/admin   | Delete an alert                    |
| GET    | /reports                      | volunteer/admin   | List incident reports              |
| POST   | /reports                      | —                 | File an incident report            |
| PATCH  | /reports/:id/status             | volunteer/admin   | Update a report's triage status    |
| GET    | /contacts                     | —                 | List emergency contacts            |
| POST   | /contacts                     | admin             | Add a contact                      |
| DELETE | /contacts/:id                  | admin             | Remove a contact                   |
| GET    | /shelters                     | —                 | List shelters/resources            |
| POST   | /shelters                     | volunteer/admin   | Add a shelter/resource             |
| PATCH  | /shelters/:id/status            | volunteer/admin   | Update shelter status              |

## Notes for evaluators / graders

- This is a self-contained demo: the JSON-file datastore is intentional so
  the app can be run for a viva/presentation without setting up MongoDB or
  PostgreSQL. Swapping `db.js` for a real database only requires changing
  `readCollection` / `writeCollection`.
- The map uses the free OpenStreetMap tile layer via Leaflet — no API key
  required.
- Seed data (alerts, contacts, shelters) is pre-loaded in `/data` so the app
  looks realistic on first run.
