# Inventory Management System - Fullstack Monorepo

## Project Overview
This project is a complete, production-ready Inventory Management System. It allows businesses to track products, manage multiple variants, handle concurrent stock reservations (e.g., during checkout), and maintain a strict, immutable audit log of all inventory movements. The system is split into a robust Node.js/PostgreSQL backend and a responsive React frontend, housed in a single monorepo.

## Backend Folder Structure
```text
/
├── src/
│   ├── config/          # Database and environment configurations
│   ├── controllers/     # Express route handlers
│   ├── middlewares/     # Express middlewares (Error handling, etc.)
│   ├── migrations/      # Sequelize database migration files
│   ├── models/          # Sequelize ORM schema definitions
│   ├── routes/          # Express API route definitions
│   ├── services/        # Core business logic and database transactions
│   ├── utils/           # Helper functions and constants
│   └── validations/     # Joi schema validations for incoming requests
├── tests/               # Automated concurrency and unit tests
├── frontend/            # React Client Application
├── postman/             # API collection for testing
├── .env                 # Root environment variables
├── package.json         # Backend dependencies and root scripts
└── server.js            # Node.js entry point
```

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### Installation
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### Database Migration & Seeding
```bash
# Run migrations (creates products, product_variants, inventory_histories)
npm run migrate

# Seed sample data (T-Shirt product with multiple variants)
npm run seed
```

### Run Server
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```
Default server URL: `http://localhost:5000`

---

## 2. API Endpoints

### Health Check
- `GET /api/health` — Service liveness and uptime check.

### Inventory
- `GET /api/inventory` — View, search, filter, and paginate inventory.
  - **Query Params**:
    - `search`: SKU or Product Name substring
    - `status`: `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`, `DISCONTINUED`
    - `low_stock`: `true` (filters where `available_quantity <= reorder_level`)
    - `page`: default `1`
    - `limit`: default `10` (max 100)
    - `sort_by`: `sku`, `price`, `available_quantity`, `created_at`
    - `sort_order`: `ASC` or `DESC`

- `PATCH /api/inventory/:variantId` — Adjust stock quantity, price, status, or reorder level.
  - **Body**:
    ```json
    {
      "available_quantity": 60,
      "price": 22.50,
      "reorder_level": 15,
      "status": "ACTIVE",
      "reason": "Restock batch #401",
      "reference_id": "PO-401"
    }
    ```

- `POST /api/inventory/:variantId/reserve` — Reserve available stock (atomic & concurrency-safe).
  - **Body**:
    ```json
    {
      "quantity": 2,
      "reason": "Order hold #9821",
      "reference_id": "ORD-9821"
    }
    ```

- `POST /api/inventory/:variantId/release` — Release reserved stock back to available pool.
  - **Body**:
    ```json
    {
      "quantity": 2,
      "reason": "Cancelled order #9821",
      "reference_id": "ORD-9821"
    }
    ```

- `GET /api/inventory/:variantId/history` — Audit trail of all stock movements.
  - **Query Params**: `action_type`, `page`, `limit`

---

## 3. Concurrency & Integrity Model

- **Inventory Model**:
  - `Total Stock = available_quantity + reserved_quantity`
  - Reserving moves stock: `available_quantity -= Q`, `reserved_quantity += Q`.
  - Releasing moves stock: `available_quantity += Q`, `reserved_quantity -= Q`.
- **Concurrency Protection**:
  - Uses PostgreSQL row-level locking (`SELECT ... FOR UPDATE` via `t.LOCK.UPDATE`) inside transactions.
  - Concurrent requests trying to reserve the same variant are serialized; race conditions, double allocations, and negative stock are strictly prevented.
- **Database Constraints**:
  - `CHECK (available_quantity >= 0)`
  - `CHECK (reserved_quantity >= 0)`
  - `CHECK (price >= 0)`

---

## 4. Concurrency Test

Run the automated race-condition test:
```bash
npm run test:concurrency
```
Fires 10 parallel reservation requests against a stock of 5 to prove exactly 5 succeed (HTTP 200) and 5 are safely rejected (HTTP 400).

---

## 5. Postman Collection

Import `postman/Inventory_Management.postman_collection.json` into Postman. Pre-configured with environment variables and sample requests.

---

## 6. Frontend (React + Vite + Tailwind CSS)

### Directory Structure
Frontend lives in `frontend/` with structured routes, SWR caching, error boundary, and dark/light mode support.

### Run Frontend
```bash
# Run from root
npm run client:dev

# Or run from frontend folder
cd frontend
npm run dev
```
Default UI URL: `http://localhost:3000`

### Implemented Features
- Real-time inventory table with summary metrics (Total SKUs, Available, Reserved, Low Stock alerts).
- Search bar (by SKU or Product name).
- Status filters (`ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`, `DISCONTINUED`) & Low Stock toggle.
- Server-side sorting & pagination.
- Reserve Stock modal with live balance validation.
- Release Reserved Stock modal with live balance validation.
- Update Stock / Variant attributes modal.
- Immutable stock history audit log viewer.
- Light/Dark mode with automatic system detection.
- Error boundary and responsive mobile navigation.

