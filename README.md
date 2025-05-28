# Real-Time Location Tracker for Multivendor Delivery Platform

A real-time location tracking system for a multivendor marketplace where vendors assign delivery partners to orders, and users can track the rider's live location in real-time. This application provides a comprehensive solution for managing the entire delivery process from order placement to final delivery.

## Features

### For Vendors
- View and manage orders
- Assign delivery partners to orders
- See delivery status in real-time

### For Delivery Partners
- See assigned orders
- Start tracking with "Start Delivery" button
- Send real-time location updates
- Complete deliveries

### For Customers
- Track assigned delivery partners in real-time on map
- View order history and status
- Receive auto-updates every 2-3 seconds

## Tech Stack

### Frontend
- Next.js with TypeScript
- TailwindCSS for styling
- Leaflet.js for maps
- Socket.IO client for real-time communication
- Axios for API requests

### Backend
- Node.js with Express and TypeScript
- Socket.IO for real-time updates
- MongoDB for database
- JWT for authentication
- RESTful API architecture

## Project Structure

```
location-tracker/
├── backend/                  # Backend API and WebSocket server
│   ├── src/
│   │   ├── controllers/      # API controllers
│   │   ├── middleware/       # Authentication and other middleware
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic and services
│   │   └── index.ts          # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                 # Next.js frontend application
    ├── public/               # Static assets
    ├── src/
    │   ├── components/       # React components
    │   ├── contexts/         # React contexts (Auth, Socket)
    │   ├── pages/            # Next.js pages
    │   │   ├── vendor/       # Vendor dashboards
    │   │   ├── delivery/     # Delivery partner dashboards
    │   │   └── customer/     # Customer dashboards
    │   ├── styles/           # Global styles
    │   └── utils/            # Utility functions
    ├── package.json
    └── tsconfig.json
```

## Demo Mode

The application includes a fully functional demo mode that works without requiring a backend connection. This allows you to test and explore all features without setting up the backend server.

### Demo Credentials
- **Customer**: customer@example.com / password
- **Vendor**: vendor@example.com / password
- **Delivery Partner**: delivery@example.com / password

### Recent Improvements
- Added user authentication with login and registration
- Implemented real-time location tracking on maps
- Fixed CORS issues with Socket.IO connections
- Enhanced delivery partner workflow
- Added consistent location tracking
- Improved UI with better visual feedback
- Fixed map initialization issues

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- MongoDB instance
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd location-tracker/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables.

4. Build the TypeScript code:
   ```
   npm run build
   ```

5. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd location-tracker/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file with the following environment variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

- JWT-based authentication system
- Three user roles: vendor, delivery, customer
- Each role has a separate dashboard with specific permissions

## Real-Time Communication

The application uses Socket.IO for real-time updates:
- Delivery partners send location updates every 2-3 seconds
- Customers receive these updates in real-time and see the movement on the map
- Vendors get notifications for delivery status changes

## License
This project is open-source and available under the MIT License.
