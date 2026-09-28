# Inventory Management System - Frontend

A professional, responsive frontend dashboard for managing inventory, built with modern React.

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

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and add the backend API URL:

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

## Folder Structure

- `src/components/` - Reusable UI elements, modals, and layout components
- `src/contexts/` - Global context providers (Theme, SWR configs)
- `src/pages/` - Top-level route components
- `src/services/` - Axios configuration and API interceptors
