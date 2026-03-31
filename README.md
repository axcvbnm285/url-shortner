# ✂️ Snip.ly — Smart URL Shortener with Analytics

A full-stack URL shortener with a real-time analytics dashboard.

## Tech Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | React 18, Vite, Recharts    |
| Backend  | Node.js, Express            |
| Database | MongoDB (Mongoose)          |

## Features

- Shorten any valid URL to a clean short link
- Custom aliases (e.g. `/my-link`)
- Link expiry (1 day / 7 days / 30 days / never)
- Click tracking with timestamps and referrer info
- Analytics dashboard with bar chart (clicks over time)
- One-click copy to clipboard
- Delete links
- Graceful error handling for invalid URLs and duplicate aliases

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally on port 27017

### Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start both servers (runs on :3000 for frontend, :5000 for backend)
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Edit `server/.env` to change defaults:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
BASE_URL=http://localhost:5000
```

For the frontend, create `client/.env` for local overrides if needed:

```bash
VITE_API_BASE_URL=http://localhost:5001/api
VITE_SHORTLINK_BASE_URL=http://localhost:5001
```

## Deploy Frontend To Vercel

This frontend lives in `client/` and builds as a Vite app.

Set these Vercel project settings:

- Framework Preset: `Vite`
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`

Add these environment variables in Vercel:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SHORTLINK_BASE_URL=https://your-backend-domain.com
```

Also update your backend environment so it accepts the Vercel frontend:

```bash
FRONTEND_URL=https://your-vercel-project.vercel.app
```

After that, redeploy the backend once so CORS and password-protected redirects use the Vercel frontend URL.

## API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /api/shorten          | Create a short URL       |
| GET    | /api/urls             | List all URLs            |
| GET    | /api/urls/:id/stats   | Get stats for a URL      |
| DELETE | /api/urls/:id         | Delete a URL             |
| GET    | /:code                | Redirect to original URL |

## Project Structure

```
url-shortener/
├── server/
│   ├── models/Url.js       # Mongoose schema
│   ├── routes/url.js       # API routes
│   ├── index.js            # Express entry + redirect handler
│   └── .env
└── client/
    ├── src/
    │   ├── api/index.js    # Axios helpers
    │   ├── components/
    │   │   ├── ShortenForm.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── StatsModal.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── vite.config.js
```
