# MRMS Frontend

Medical Records Management System - Frontend

## About
This project was developed as part of my Bachelor's thesis at IBU Sarajevo.

## Tech Stack

- React 18
- Vite
- Material-UI (MUI)
- React Router DOM
- Axios for API calls
- Jest for testing

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure:
   ```
   VITE_API_URL=http://localhost:4000/api
   ```
4. Start development server: `npm start`

## Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Features

- User authentication and session management
- Role-based access (Admin, Doctor, Patient)
- Dashboard, Appointments, Records, etc.
- Responsive design with Material-UI

## Deployment

Build the app: `npm run build`

Serve the `dist` folder with a static server.
