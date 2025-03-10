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

### Authentication

Authentication is handled by Better Auth. The API endpoints are:

- `POST /api/auth/sign-up` - Register a new user
- `POST /api/auth/sign-in` - Login a user
- `POST /api/auth/sign-out` - Logout a user

### Clients

- `GET /api/clients` - List all clients
- `POST /api/clients` - Create a new client
- `GET /api/clients/:id` - Get a specific client
- `PUT /api/clients/:id` - Update a client
- `DELETE /api/clients/:id` - Delete a client

### Projects

- `GET /api/clients/:clientId/projects` - List all projects for a client
- `POST /api/clients/:clientId/projects` - Create a new project
- `GET /api/projects/:id` - Get a specific project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks

- `GET /api/projects/:projectId/tasks` - List all tasks for a project
- `POST /api/projects/:projectId/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Time Entries

- `GET /api/time-entries` - List time entries (with optional filters)
- `GET /api/time-entries/running` - Get the currently running timer (if any)
- `POST /api/time-entries` - Create a manual time entry
- `PUT /api/time-entries/:id` - Update a time entry
- `DELETE /api/time-entries/:id` - Delete a time entry

### Timer Control

- `POST /api/timer/start` - Start a new timer
- `POST /api/timer/stop` - Stop the running timer

## License

MIT
