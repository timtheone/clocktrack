import { Context } from "hono";
import prisma from "../lib/prisma";

// Get all tasks for a specific project
export const getTasks = async (c: Context) => {
  try {
    const user = c.get("user");
    const projectId = c.req.param("projectId");

    // Verify project belongs to user's client
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        client: {
          userId: user.id,
        },
      },
    });

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { name: "asc" },
    });

    return c.json(tasks, 200);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return c.json({ error: "Failed to fetch tasks" }, 500);
  }
};

// Get a specific task by ID
export const getTaskById = async (c: Context) => {
  try {
    const user = c.get("user");
    const taskId = c.req.param("id");

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          client: {
            userId: user.id,
          },
        },
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        timeEntries: {
          orderBy: {
            startTime: "desc",
          },
        },
      },
    });

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return c.json({ error: "Failed to fetch task" }, 500);
  }
};

// Create a new task
export const createTask = async (c: Context) => {
  try {
    const user = c.get("user");
    const projectId = c.req.param("projectId");
    const data = await c.req.json();

    // Verify project belongs to user's client
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        client: {
          userId: user.id,
        },
      },
    });

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    // Validate input
    if (!data.name) {
      return c.json({ error: "Task name is required" }, 400);
    }

    const task = await prisma.task.create({
      data: {
        name: data.name,
        projectId,
      },
    });

    return c.json(task, 201);
  } catch (error) {
    console.error("Error creating task:", error);
    return c.json({ error: "Failed to create task" }, 500);
  }
};

// Update an existing task
export const updateTask = async (c: Context) => {
  try {
    const user = c.get("user");
    const taskId = c.req.param("id");
    const data = await c.req.json();

    // Check if task exists and belongs to user's project
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          client: {
            userId: user.id,
          },
        },
      },
    });

    if (!existingTask) {
      return c.json({ error: "Task not found" }, 404);
    }

    // Validate input
    if (!data.name) {
      return c.json({ error: "Task name is required" }, 400);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        name: data.name,
      },
    });

    return c.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return c.json({ error: "Failed to update task" }, 500);
  }
};

// Delete a task
export const deleteTask = async (c: Context) => {
  try {
    const user = c.get("user");
    const taskId = c.req.param("id");

    // Check if task exists and belongs to user's project
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          client: {
            userId: user.id,
          },
        },
      },
    });

    if (!existingTask) {
      return c.json({ error: "Task not found" }, 404);
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return c.json({ error: "Failed to delete task" }, 500);
  }
};
