# Snip.ly

Snip.ly is a full-stack URL shortener that helps users create compact links, manage them from a personal dashboard, and track how those links perform over time. It goes beyond simple link shortening by adding authentication, custom aliases, expiry rules, password-protected links, bulk shortening, tagging, and analytics.

The project is built with a React + Vite frontend, an Express + Node.js backend, and MongoDB for persistence. Users can register, log in, create short links, organize them with tags, and view interaction data such as clicks over time, referrers, and device breakdown.

## What The App Does

Snip.ly solves a common problem: long links are hard to share, hard to remember, and hard to track. This app gives each user a personal workspace where they can:

- turn long URLs into short shareable links
- create custom aliases for branded or memorable URLs
- set expiration dates so links stop working automatically
- protect sensitive links with a password
- shorten many links at once using bulk mode
- tag and search links for easier organization
- monitor click activity with charts and usage insights

It is designed as a practical portfolio project because it combines frontend UI work, backend API design, authentication, database modeling, and deployment concerns in one complete product.

## Core Features

- User authentication with registration and login
- JWT-based protected API routes
- Individual URL shortening
- Bulk shortening for up to 20 URLs at a time
- Custom short aliases
- Optional expiry rules for 1 day, 7 days, 30 days, or no expiry
- Password-protected short links
- Tag support for organizing links
- Dashboard with all user-created links
- Search by original URL or short code
- Tag filtering
- Link deletion
- Click tracking
- Referrer tracking
- Device detection for desktop, mobile, and tablet
- QR code generation for sharing links

## How It Works

### Authentication

Users can create an account and log in with a username and password. The backend hashes passwords with `bcryptjs` and issues a JWT token after login or registration. The frontend stores the token in local storage and automatically includes it in authenticated requests.

### Link Creation

When a user submits a URL, the backend validates it, generates a short code with `nanoid`, and stores the record in MongoDB. If the user provides a custom alias, the backend checks that the alias is unique before saving it.

### Secure And Expiring Links

Each shortened link can optionally:

- expire after a selected number of days
- require a password before redirecting

Expired links return a clear error instead of redirecting. Password-protected links send the visitor to the frontend unlock page first, where they must enter the correct password before the app reveals the original destination.

### Analytics

Every time a short link is opened, the backend records:

- click timestamp
- referrer
- detected device type

This data is displayed in the dashboard through charts and summaries, giving the user visibility into how their links are being used.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Axios, React Router |
| UI / Charts | CSS Modules, Recharts, `qrcode.react` |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT, bcryptjs |
| Utilities | nanoid, valid-url |

## App Flow

1. A user registers or logs in.
2. The frontend stores the JWT token.
3. The user creates one or more shortened links.
4. The backend saves each link with metadata such as alias, expiry, password hash, and tags.
5. The user opens the dashboard to manage links.
6. Visitors use the short links.
7. The backend tracks click analytics and redirects the visitor.
8. The user reviews stats from the dashboard and QR modal.

## Screens And Modules

### Frontend

- `AuthPage`: login and registration UI
- `ShortenForm`: create a single short link
- `BulkShorten`: shorten multiple links in one request
- `Dashboard`: view links, stats, statuses, and actions
- `StatsModal`: visualize analytics and download QR codes
- `UnlockPage`: enter password for protected links

### Backend

- `routes/auth.js`: register and login endpoints
- `routes/url.js`: shorten, bulk shorten, list, stats, delete, and password verification endpoints
- `index.js`: app setup, CORS, MongoDB connection, and redirect handling
- `models/User.js`: user schema
- `models/Url.js`: URL schema and analytics fields

## Project Structure

```text
url-shortner/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
├── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| POST | `/api/shorten` | Create one short URL |
| POST | `/api/bulk-shorten` | Create up to 20 short URLs |
| GET | `/api/urls` | Get the logged-in user's URLs |
| GET | `/api/urls/:id/stats` | Get analytics for a specific URL |
| DELETE | `/api/urls/:id` | Delete a URL |
| POST | `/api/urls/:id/verify-password` | Verify password for a protected URL |
| GET | `/:code` | Redirect to the original URL |

## Local Development

### Prerequisites

- Node.js 18+
- A MongoDB database, local or Atlas

### Install Dependencies

```bash
npm run install:all
```

### Start The App

```bash
npm run dev
```

By default:

- frontend runs on `http://localhost:3000`
- backend runs on `http://localhost:5001`

## Environment Variables

### Backend

Create `server/.env`:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/urlshortener
BASE_URL=http://localhost:5001
JWT_SECRET=replace_this_with_a_secure_secret
FRONTEND_URL=http://localhost:3000
```

Notes:

- `FRONTEND_URL` must exactly match the frontend origin
- avoid adding a trailing slash in `FRONTEND_URL`
- for production, use a strong, rotated JWT secret

### Frontend

Create `client/.env` if you want to override defaults:

```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_SHORTLINK_BASE_URL=http://localhost:5001
```

## Deployment

### Deploy Frontend To Vercel

Use these project settings in Vercel:

- Framework Preset: `Vite`
- Root Directory: `client`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Set these frontend environment variables:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SHORTLINK_BASE_URL=https://your-backend-domain.com
```

### Backend Deployment Notes

For the backend, make sure:

- MongoDB Atlas allows traffic from your hosting environment
- `MONGO_URI` is valid and includes the correct username, password, and database
- `FRONTEND_URL` exactly matches your deployed frontend URL

Example:

```env
FRONTEND_URL=https://your-project.vercel.app
```

If CORS fails, check whether the frontend URL contains a trailing slash. `https://your-project.vercel.app` is correct, while `https://your-project.vercel.app/` can cause origin mismatch errors.

## Why This Project Stands Out

This project is more than a CRUD app. It shows:

- full-stack integration between client, server, and database
- authentication and route protection
- real-world redirect behavior
- analytics collection and data visualization
- deployment readiness with separate frontend and backend hosts
- production issues like CORS, environment configuration, and MongoDB connectivity

## Future Improvements

- custom user profiles
- edit existing links
- export analytics
- rate limiting
- role-based admin tools
- better test coverage
- domain customization
- richer analytics filters by date range

## Summary

Snip.ly is a production-style URL shortener and link analytics platform. It lets authenticated users create, secure, organize, and monitor short links through a clean dashboard experience. The project demonstrates practical full-stack development with React, Express, MongoDB, authentication, analytics, and deployment workflows.
