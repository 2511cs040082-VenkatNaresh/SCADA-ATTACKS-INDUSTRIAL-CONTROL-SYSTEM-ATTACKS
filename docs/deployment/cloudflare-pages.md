# ICS-SHIELD — Cloudflare Pages Deployment Guide

**Application Title:** SCADA ATTACKS & INDUSTRIAL CONTROL SYSTEM ATTACKS  
**Project Platform:** ICS-SHIELD  
**Architect & Developer:** Venkat Naresh  

---

## 1. Overview

The public software distribution platform for ICS-SHIELD is located in the `website/` directory of the repository. It is built as a high-performance, single-page application using React 18, TypeScript, Vite, and Tailwind CSS.

This guide outlines two official deployment pathways for hosting on Cloudflare's global edge network:
1. **Cloudflare Dashboard (Continuous Deployment via GitHub)** *(Recommended)*
2. **Cloudflare Wrangler CLI (Direct Edge Upload)**

---

## 2. Architecture & File Structure

```text
website/
├── public/
│   ├── _headers         # Edge security headers (CSP, HSTS, X-Frame-Options)
│   ├── _redirects       # SPA catch-all routing (/* /index.html 200)
│   └── shield.svg       # Official vector brand asset
├── src/
│   ├── components/      # UI sections (Hero, About, Features, Architecture, etc.)
│   ├── data/            # Module specifications, release data, docs data
│   ├── App.tsx          # Main layout & smooth navigation
│   └── main.tsx         # Entry point
├── package.json         # Website dependencies
├── vite.config.ts       # Optimized chunking configuration
├── wrangler.toml        # Cloudflare Pages deployment configuration
└── dist/                # Production build output
```

---

## 3. Method 1: Continuous Deployment via Cloudflare Dashboard (Recommended)

Connecting your GitHub repository to Cloudflare Pages enables automated edge deployments on every git push to `main`.

### Step 1: Connect Repository
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your GitHub account and authorize access to:
   ```text
   https://github.com/2511cs040082-VenkatNaresh/SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS
   ```
4. Choose the repository and click **Begin setup**.

### Step 2: Configure Build Settings
Fill in the deployment parameters exactly as specified:

| Setting | Value | Rationale |
| :--- | :--- | :--- |
| **Project Name** | `ics-shield` | Sets default domain to `https://ics-shield.pages.dev` |
| **Production Branch** | `main` | Production deployment branch |
| **Framework Preset** | `Vite` | Standard Vite preset |
| **Root Directory** | `website` | Instructs Cloudflare to execute inside the website folder |
| **Build Command** | `npm run build` | Runs TypeScript typecheck (`tsc`) and Vite bundler |
| **Build Output Directory** | `dist` | Relative to the `website` root directory (`website/dist`) |

### Step 3: Configure Environment Variables
Under **Environment variables (advanced)**, add:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NODE_VERSION` | `20` | Ensures Node.js 20 LTS runtime for compilation |
| `NPM_FLAGS` | `--legacy-peer-deps` | Guarantees deterministic npm dependency resolution |

### Step 4: Deploy
Click **Save and Deploy**. Cloudflare will provision a build runner, install packages, compile the asset bundle, and deploy to 300+ edge locations globally in under 45 seconds.

---

## 4. Method 2: Deployment via Wrangler CLI

If you prefer deploying directly from your local terminal or a custom CI runner:

### Step 1: Install Wrangler and Authenticate
```bash
# Verify or install Wrangler
npx wrangler --version

# Log in to your Cloudflare account
npx wrangler login
```

### Step 2: Build the Website Assets
```bash
# Navigate to the website workspace
cd website

# Build production distribution
npm run build
```
Verify that the `website/dist` directory contains `index.html`, `_headers`, `_redirects`, and the `assets/` bundle.

### Step 3: Deploy to Cloudflare Pages
```bash
# Deploy to production
npx wrangler pages deploy dist --project-name=ics-shield --branch=main
```

Upon completion, Wrangler will output your live URL:
```text
✨ Success! Uploaded 5 files (0.88 sec)
✨ Deployment complete! Take a peek over at https://ics-shield.pages.dev
```

---

## 5. Security & Edge Configuration

The `website/public/_headers` file is automatically deployed to Cloudflare's edge to enforce military-grade defense headers:

```http
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: document-domain=(), geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';
```

### SPA Routing Rule (`website/public/_redirects`)
To support clean client-side routing without 404 errors when visitors refresh sub-routes, the file defines:
```text
/*    /index.html   200
```

---

## 6. Custom Domain Mapping

To attach your custom corporate or research domain (e.g., `ics-shield.io`):
1. In Cloudflare Pages, go to **Custom domains**.
2. Click **Set up a custom domain**.
3. Enter your domain or subdomain.
4. Cloudflare automatically generates SSL/TLS certificates (TLS 1.3, HTTP/2, and HTTP/3) with automated renewal.

---

## 7. Verification Checklist

- [x] Production build passes with zero TypeScript errors (`tsc && vite build`).
- [x] Security headers active (Verified via `curl -I https://ics-shield.pages.dev`).
- [x] Windows executable installer SHA-256 hash displayed in Download Center.
- [x] Interactive SOC simulation operates smoothly on all device breakpoints.
- [x] Direct GitHub links route to `2511cs040082-VenkatNaresh/SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS`.
- [x] Author attribution proudly displayed: **Venkat Naresh**.
