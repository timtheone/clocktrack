import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { authenticate } from "../middleware/auth";
import * as clientController from "../controllers/clientController";
import * as projectController from "../controllers/projectController";
import * as taskController from "../controllers/taskController";
import * as timeEntryController from "../controllers/timeEntryController";

// Define schemas for our API
const ErrorSchema = z.object({
  error: z.string(),
});

const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  clientId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const TimeEntrySchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  description: z.string().nullable(),
  taskId: z.string().nullable(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Create OpenAPI instance
const api = new OpenAPIHono();

// Serve Swagger UI
api.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "ClockTrack API",
    version: "1.0.0",
    description:
      "Time tracking API with clients, projects, tasks, and time entries",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
});

api.use("/ui", swaggerUI({ url: "/api/doc" }));

// Apply authentication middleware to all routes except docs
api.use("/*", async (c, next) => {
  if (c.req.path.startsWith("/doc") || c.req.path.startsWith("/ui")) {
    return next();
  }
  return authenticate(c, next);
});

// Client routes
api.openapi(
  createRoute({
    method: "get",
    path: "/clients",
    tags: ["Clients"],
    description: "Get all clients for the logged-in user",
    responses: {
      200: {
        description: "List of clients",
        content: {
          "application/json": {
            schema: z.array(ClientSchema),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  clientController.getClients
);

api.openapi(
  createRoute({
    method: "post",
    path: "/clients",
    tags: ["Clients"],
    description: "Create a new client",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Client created",
        content: {
          "application/json": {
            schema: ClientSchema,
          },
        },
      },
      400: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  clientController.createClient
);

// Project routes
api.openapi(
  createRoute({
    method: "get",
    path: "/clients/:clientId/projects",
    tags: ["Projects"],
    description: "Get all projects for a client",
    responses: {
      200: {
        description: "List of projects",
        content: {
          "application/json": {
            schema: z.array(ProjectSchema),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "Client not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  projectController.getProjects
);

// Task routes
api.openapi(
  createRoute({
    method: "get",
    path: "/projects/:projectId/tasks",
    tags: ["Tasks"],
    description: "Get all tasks for a project",
    responses: {
      200: {
        description: "List of tasks",
        content: {
          "application/json": {
            schema: z.array(TaskSchema),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "Project not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  taskController.getTasks
);

// Time entry routes
api.openapi(
  createRoute({
    method: "get",
    path: "/time-entries",
    tags: ["Time Entries"],
    description: "Get all time entries for the current user",
    responses: {
      200: {
        description: "List of time entries",
        content: {
          "application/json": {
            schema: z.array(TimeEntrySchema),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  timeEntryController.getTimeEntries
);

api.openapi(
  createRoute({
    method: "get",
    path: "/time-entries/running",
    tags: ["Time Entries"],
    description: "Get the currently running timer",
    responses: {
      200: {
        description: "Currently running timer or null",
        content: {
          "application/json": {
            schema: TimeEntrySchema.nullable(),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  timeEntryController.getRunningTimer
);

api.openapi(
  createRoute({
    method: "post",
    path: "/timer/start",
    tags: ["Timer Control"],
    description: "Start a new timer",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              taskId: z.string().optional(),
              description: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Timer started",
        content: {
          "application/json": {
            schema: TimeEntrySchema,
          },
        },
      },
      400: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "Task not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  timeEntryController.startTimer
);

api.openapi(
  createRoute({
    method: "post",
    path: "/timer/stop",
    tags: ["Timer Control"],
    description: "Stop the running timer",
    responses: {
      200: {
        description: "Timer stopped",
        content: {
          "application/json": {
            schema: TimeEntrySchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "No running timer found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  timeEntryController.stopTimer
);

// Add remaining routes without OpenAPI documentation for brevity
// These should also be documented in a production environment
api.get("/clients/:id", clientController.getClientById);
api.put("/clients/:id", clientController.updateClient);
api.delete("/clients/:id", clientController.deleteClient);

api.post("/clients/:clientId/projects", projectController.createProject);
api.get("/projects/:id", projectController.getProjectById);
api.put("/projects/:id", projectController.updateProject);
api.delete("/projects/:id", projectController.deleteProject);

api.post("/projects/:projectId/tasks", taskController.createTask);
api.get("/tasks/:id", taskController.getTaskById);
api.put("/tasks/:id", taskController.updateTask);
api.delete("/tasks/:id", taskController.deleteTask);

api.post("/time-entries", timeEntryController.createManualTimeEntry);
api.put("/time-entries/:id", timeEntryController.updateTimeEntry);
api.delete("/time-entries/:id", timeEntryController.deleteTimeEntry);

export default api;
