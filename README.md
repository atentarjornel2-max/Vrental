# Vrental - Vehicle Rental and Booking System

Node.js + Express + Sequelize application for vehicle rental and bookings.

Quick start:

1. Copy `.env.example` to `.env` and configure database credentials.
2. Install dependencies:

```bash
npm install
```

3. Run migrations (sync models):

```bash
npm run migrate
```

4. Start server:

```bash
npm run dev
```

Deployment:
- For Aiven, set `AIVEN_URL` in environment to the provided connection string.
- Render: add `start` command `npm start` and set environment variables.
