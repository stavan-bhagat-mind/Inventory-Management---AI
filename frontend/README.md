# Inventory Management System - Frontend

## Project Overview
This is the frontend client for the Inventory Management System. It provides a professional, responsive dashboard for warehouse managers and staff to view, search, filter, and manage product stock in real-time. It connects directly to the backend API to ensure accurate representation of available and reserved inventory.

## Tech Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Dark/Light mode supported)
- **Data Fetching:** SWR for caching and reactivity, Axios for HTTP client
- **Icons:** Custom SVG and icon fonts

## Features
- **Inventory Dashboard:** Real-time stock catalog with debounced search, status filtering, and pagination.
- **Stock Actions:** Dedicated modals to safely Update, Reserve, and Release stock.
- **Audit Logs:** View transaction history and stock movement for every product variant.
- **Resilient UI:** Built-in error boundaries, loading states, and toast notifications.

## Folder Structure
```text
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, global CSS, icon fonts
│   ├── components/         # Reusable UI parts
│   │   ├── common/         # Shared micro-components (buttons, inputs)
│   │   └── pages/          # Page-specific pieces (Modals, Table rows)
│   ├── contexts/           # Global React Contexts (Theme, SWR configs)
│   ├── hooks/              # Custom React hooks (e.g., useOutClick)
│   ├── layouts/            # Page wrappers (Header, Sidebar, MainLayout)
│   ├── lib/                # Utility libraries (clsx + tailwind-merge)
│   ├── pages/              # Top-level route views (InventoryPage, HistoryPage)
│   ├── routes/             # React Router definitions and route guards
│   ├── services/           # Axios interceptors and API configuration
│   └── utils/              # Helper functions and constants
├── .env                    # Environment variables
├── index.html              # Vite entry point
├── package.json            # Frontend dependencies
├── tailwind.config.js      # Tailwind theme configuration
└── vite.config.js          # Vite bundler configuration
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the `frontend` directory and add the backend API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
