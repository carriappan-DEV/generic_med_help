# Medicine Alternative Finder & Price Comparison

A full-stack web application built with React, Vite, Express, and Google Gemini Vision for identifying medicines from packaging photos or manual search and finding affordable generic alternatives.

## Prerequisites

- **Node.js** (v18.x or higher recommended)
- **npm** (comes with Node.js)

## Quick Start (How to Run in VS Code)

### 1. Open the project in VS Code
Open VS Code, select **File > Open Folder...**, and select the extracted project directory.

### 2. Install Dependencies
Open a terminal in VS Code (`Ctrl + ~` or `Cmd + ~`) and run:

```bash
npm install
```

> **Note:** If `node_modules` is already present, this verifies all packages are installed.

### 3. Set Up Environment Variables (Optional but recommended for AI Vision)
Create a `.env` file in the root directory (you can copy `.env.example`):

```bash
cp .env.example .env
```

Inside `.env`, add your Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(Even without an API key, the app includes fallback image matching and manual brand/salt search with price comparisons).*

### 4. Start the Development Server
Run the dev script:

```bash
npm run dev
```

The application will start at:
```
http://localhost:3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` — Starts the Express backend + Vite frontend dev server on port 3000.
- `npm run build` — Builds the frontend and backend bundles for production.
- `npm start` — Runs the compiled production server (`dist/server.cjs`).
- `npm run lint` — Type-checks TypeScript files.
