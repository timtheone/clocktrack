# ClockTrack - Time Tracking API

A backend API for tracking time spent on tasks, projects, and clients.

## Features

- User authentication via Better Auth
- Time tracking with start/stop functionality
- Manual time entry creation
- Organization via clients, projects, and tasks
- Persistent time tracking across sessions

## Tech Stack

- Bun & Hono.js for the API server
- PostgreSQL for database
- Prisma as ORM
- Better Auth for authentication
- Docker for containerization

## Getting Started

### Prerequisites

- Node.js (or Bun)
- Docker and Docker Compose
- pnpm (recommended)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Copy the example environment file:
   ```
   cp .env.example .env
   ```
4. Update the environment variables in `.env` as needed
5. Start the PostgreSQL database:
   ```
   docker-compose up -d
   ```
6. Apply database migrations:
   ```
   pnpm dlx prisma migrate dev
   ```
7. Start the development server:
   ```
   pnpm dev
   ```

## API Endpoints
