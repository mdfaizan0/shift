# Shift — Ride Booking Platform

Shift is a full-stack, real-time ride-hailing platform built with Next.js and Node.js. It enables riders to request on-demand rides, matches them with nearby drivers using geospatial queries, and manages the complete ride lifecycle from booking through payment and mutual reviews. The system uses Supabase Realtime for live driver tracking and ride status updates, Clerk for authentication, and Razorpay for payment processing.

---

## Overview

The platform serves two user personas:

- **Riders** can request rides by selecting pickup and drop-off locations on a map, receive fare estimates, track assigned drivers in real time, verify ride start via OTP, and complete payment through cash or Razorpay.
- **Drivers** can go online, receive dispatched ride offers based on proximity, navigate to pickup locations, start rides after OTP verification, and track their earnings.

A driver can also book rides as a rider using the same account.

The ride lifecycle is state-driven, progressing through defined stages from request to completion. Driver discovery uses PostGIS geospatial queries to find nearby available drivers. All ride state transitions, driver locations, and dispatch events propagate to connected clients via Supabase Realtime subscriptions.

---

## Architecture

```
Client (Browser)
    |
    v
Next.js Frontend (App Router)
    |
    |--- Clerk (Authentication)
    |--- Leaflet + OpenStreetMap (Maps) + LRM (Routing)
    |--- Supabase Realtime (Live Updates)
    |
    v
Express.js Backend (REST API)
    |
    |--- Clerk Middleware (Session Verification)
    |--- Supabase PostgreSQL + PostGIS (Database)
    |--- Razorpay (Payment Processing)
    |--- Clerk Webhooks (User Sync)
    |--- Razorpay Webhooks (Payment Verification)
```

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Frontend       | Next.js (App Router), React, Tailwind CSS v4, shadcn/ui, Framer Motion |
| Maps           | Leaflet, OpenStreetMap, Leaflet Routing Machine |
| Backend        | Node.js, Express.js                     |
| Database       | PostgreSQL (Supabase) with PostGIS      |
| Authentication | Clerk                                   |
| Payments       | Razorpay                                |
| Realtime       | Supabase Realtime                       |

---

## Core Features

- **Authentication** -- Clerk-based session management with webhook-driven user synchronization.
- **Ride Request and Fare Estimation** -- Riders select locations on a map and receive distance-based fare estimates before booking.
- **Geospatial Driver Discovery** -- PostGIS-powered proximity queries find nearby online and available drivers.
- **Push-Style Dispatch** -- Ride offers are dispatched to multiple nearby drivers simultaneously via database-backed dispatch records.
- **Real-Time Ride Updates** -- Supabase Realtime subscriptions push ride status changes, driver location updates, and dispatch events to connected clients.
- **OTP Ride Start Verification** -- Riders share a 4-digit OTP with the driver to verify identity before the ride begins.
- **Payment Processing** -- Supports both cash payments and Razorpay online payments with webhook-based verification.
- **Mutual Ratings and Reviews** -- Both riders and drivers can submit ratings and optional comments after ride completion. A database trigger maintains running averages.
- **Driver Earnings Dashboard** -- Drivers can view today, monthly, and lifetime earnings alongside completed ride counts.
- **Ride History** -- Both roles can view past rides with route details, fare, payment status, and ratings.
- **Driver Location Streaming** -- Active driver coordinates are written to the database and propagated to rider clients via Supabase Realtime.

---

## Ride Lifecycle

The ride follows a state machine with defined transitions:

```
REQUESTED --> SEARCHING --> ACCEPTED --> DRIVER_EN_ROUTE --> STARTED --> COMPLETED
```

| State           | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| REQUESTED       | Rider has created a ride with pickup and drop-off locations.                |
| SEARCHING       | System is dispatching ride offers to nearby drivers.                        |
| ACCEPTED        | A driver has accepted the ride offer.                                      |
| DRIVER_EN_ROUTE | The driver is heading to the pickup location.                              |
| STARTED         | The driver verified the OTP and the ride is in progress.                   |
| COMPLETED       | The driver has marked the ride as finished. Payment is now required.       |

Cancellation paths:

- `REQUESTED` or `SEARCHING` can transition to `CANCELLED`.
- `ACCEPTED` or `DRIVER_EN_ROUTE` can transition back to `SEARCHING` if the driver cancels, triggering a new dispatch cycle.
- Once a ride reaches `COMPLETED`, its state is immutable.

---

## Realtime System

Shift uses Supabase Realtime to push live updates to connected clients. The frontend subscribes to database changes on specific tables filtered by user identity.

**Subscribed tables:**

| Table              | Purpose                                                    |
|--------------------|------------------------------------------------------------|
| `rides`            | Ride status changes (accepted, started, completed, etc.)   |
| `ride_dispatches`  | New ride offers dispatched to drivers                      |
| `driver_profiles`  | Driver location updates for live map tracking              |

**Example flows:**

- Driver accepts a ride -- the rider's UI updates to show driver details and location.
- Driver's location changes -- the rider's map marker moves in real time.
- A dispatch record is created -- the target driver receives a ride offer notification.

---

## Payment System

Shift supports two payment methods after ride completion.

### Cash

The driver marks the ride as paid after collecting cash from the rider.

```
Ride COMPLETED --> Driver confirms cash received --> Payment status: PAID
```

### Razorpay (Online)

```
Ride COMPLETED --> Backend creates Razorpay order --> Frontend opens payment modal
--> Payment processed --> Razorpay webhook fires --> Backend verifies signature
--> Payment status: PAID
```

**Payment states:** `PENDING`, `PROCESSING`, `PAID`, `FAILED`

Webhook verification uses the `x-razorpay-signature` header to ensure payment authenticity.

---

## Map System

The frontend map is built with Leaflet and OpenStreetMap tiles.

- **Location Selection** -- Riders tap the map or use geocoding to set pickup and drop-off points.
- **Route Rendering** -- Leaflet Routing Machine draws the driving route between pickup and drop-off locations.
- **Driver Tracking** -- Active driver positions are rendered as map markers, updated via Supabase Realtime subscriptions on the `driver_profiles` table.
- **ETA Display** -- Route distance and estimated travel time are computed from the routing engine and displayed to the rider.
- **Follow Mode** -- When a driver is en route, the map pans to keep the driver marker visible.
- **Marker Fitting** -- Pickup and drop-off markers are automatically fitted within the visible map bounds.

---

## Database Design

The database uses Supabase PostgreSQL with PostGIS extensions for geospatial queries.

| Table              | Purpose                                                                  |
|--------------------|--------------------------------------------------------------------------|
| `users`            | User identity, role (RIDER/DRIVER), and reputation scores. Synced from Clerk via webhooks. |
| `driver_profiles`  | Driver operational state: online status, availability, vehicle info, and real-time location stored as `GEOGRAPHY(Point, 4326)`. |
| `rides`            | Central ride entity tracking the full lifecycle, coordinates, fare, payment state, OTP, and timestamps. |
| `ride_dispatches`  | Dispatch queue records linking rides to target drivers. Status: PENDING, ACCEPTED, REJECTED, EXPIRED. |
| `ride_events`      | Audit log of ride state transitions with timestamps.                     |
| `ride_reviews`     | Post-ride ratings and comments. Constrained to one review per reviewer per ride. A database trigger updates running averages on the users table. |

Key indexes include a GIST spatial index on `driver_profiles.location` for fast proximity queries, and B-tree indexes on `rides.status`, `rides.driver_id`, and `ride_dispatches(driver_id, status)`.

---

## API Endpoints

### Ride Management

| Method | Endpoint                   | Description                          |
|--------|----------------------------|--------------------------------------|
| POST   | `/api/rides`               | Create a new ride request            |
| POST   | `/api/rides/estimate`      | Get fare estimate for a route        |
| POST   | `/api/rides/:id/search`    | Dispatch ride to nearby drivers      |
| POST   | `/api/rides/:id/accept`    | Driver accepts a ride offer          |
| POST   | `/api/rides/:id/reject`    | Driver rejects a ride offer          |
| POST   | `/api/rides/:id/enroute`   | Driver marks en route to pickup      |
| POST   | `/api/rides/:id/start`     | Start ride after OTP verification    |
| POST   | `/api/rides/:id/complete`  | Driver completes the ride            |
| POST   | `/api/rides/:id/cancel`    | Cancel a ride                        |
| POST   | `/api/rides/:id/pay`       | Create Razorpay payment order        |
| POST   | `/api/rides/:id/mark-paid` | Mark cash payment as received        |
| POST   | `/api/rides/:id/review`    | Submit a post-ride review            |
| GET    | `/api/rides/history/:role` | Get ride history for rider or driver  |
| GET    | `/api/rides/active`        | Get currently active ride            |
| GET    | `/api/rides/:id`           | Get ride details by ID               |

### Driver Management

| Method | Endpoint                      | Description                        |
|--------|-------------------------------|------------------------------------|
| POST   | `/api/driver/go-online`       | Set driver status to online        |
| POST   | `/api/driver/go-offline`      | Set driver status to offline       |
| POST   | `/api/driver/location-update` | Update driver GPS coordinates      |
| GET    | `/api/driver/earnings`        | Get driver earnings summary        |
| GET    | `/api/driver/profile`         | Get driver profile                 |

### User Management

| Method | Endpoint        | Description                              |
|--------|-----------------|------------------------------------------|
| GET    | `/api/users/me` | Get authenticated user profile           |

### Webhooks

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/webhooks/clerk`     | Clerk user sync (create/update/delete) |
| POST   | `/webhooks/razorpay`  | Razorpay payment verification        |

---

## Project Structure

```
shift/
|
|-- backend/
|   |-- src/
|   |   |-- config/          # Supabase and Razorpay client configuration
|   |   |-- controllers/     # Request handlers (ride, driver, webhook)
|   |   |-- middlewares/     # Clerk auth middleware
|   |   |-- routes/          # Express route definitions
|   |   |-- app.js           # Express app setup and middleware registration
|   |-- server.js            # HTTP server bootstrap
|   |-- package.json
|   |-- backend_documentation.md
|
|-- frontend/
|   |-- src/
|   |   |-- app/             # Next.js App Router pages and layouts
|   |   |   |-- earnings/    # Driver earnings page
|   |   |   |-- history/     # Ride history list and detail pages
|   |   |   |-- profile/     # User profile page
|   |   |   |-- login/       # Clerk sign-in page
|   |   |   |-- register/    # Clerk sign-up page
|   |   |   |-- become-a-driver/  # Driver registration page
|   |   |-- components/      # Shared UI components
|   |   |   |-- ui/          # shadcn/ui primitives (Button, Card, Dialog, etc.)
|   |   |   |-- layout/      # Navbar, Container, AppLayout
|   |   |   |-- map/         # MapView component (Leaflet)
|   |   |   |-- auth/        # Auth guard components
|   |   |-- features/        # Feature-specific modules
|   |   |   |-- auth/        # AuthProvider context
|   |   |   |-- rider/       # RiderDashboard, RideBookingCard, RideStatusCard
|   |   |   |-- driver/      # DriverDashboard, DriverProvider, ActiveRideCard, DispatchListener
|   |   |   |-- map/         # MapContainer with route rendering and driver tracking
|   |   |   |-- profile/     # ProfilePage component
|   |   |-- hooks/           # Custom React hooks (useAuthUser, useDriverLocation)
|   |   |-- services/        # API service modules (ride, driver, user)
|   |   |-- lib/             # Utilities (API client, Supabase client, realtime service)
|   |   |-- utils/           # Helper functions
|   |-- public/              # Static assets (logo, icons)
|   |-- package.json
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm
- A Supabase project with PostGIS enabled
- A Clerk application
- A Razorpay account (for online payments)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shift.git
cd shift
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories. See the Environment Variables section below.

### 4. Start the Backend

```bash
cd backend
npm run dev
```

### 5. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3000` by default.

---

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
CLERK_WEBHOOK_SECRET=<your-clerk-webhook-signing-secret>
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
RAZORPAY_WEBHOOK_SECRET=<your-razorpay-webhook-secret>
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_RAZORPAY_KEY_ID=<your-razorpay-key-id>
```

---

## Future Improvements

- Invoice PDF generation for completed rides.
- Turn-by-turn driver navigation within the map view.
- Surge pricing based on demand density.
- Driver document verification workflow.
- Admin dashboard for platform operations.
- Dashboard or Customer Support.

---

Thank You 💚