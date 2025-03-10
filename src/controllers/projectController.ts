import { Context } from "hono";
import prisma from "../lib/prisma";

// Get all projects for a specific client
export const getProjects = async (c: Context) => {
  try {
    const user = c.get("user");
    const clientId = c.req.param("clientId");

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: user.id,
      },
    });

    if (!client) {
      return c.json({ error: "Client not found" }, 404);
    }

    const projects = await prisma.project.findMany({
      where: { clientId },
      orderBy: { name: "asc" },
    });

    return c.json(projects, 200);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
};

// Get a specific project by ID
export const getProjectById = async (c: Context) => {
  try {
    const user = c.get("user");
    const projectId = c.req.param("id");

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        client: {
          userId: user.id,
        },
      },
      include: {
        tasks: true,
        client: true,
      },
    });

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    return c.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return c.json({ error: "Failed to fetch project" }, 500);
  }
};

// Create a new project
export const createProject = async (c: Context) => {
  try {
    const user = c.get("user");
    const clientId = c.req.param("clientId");
    const data = await c.req.json();

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: user.id,
      },
    });

    if (!client) {
      return c.json({ error: "Client not found" }, 404);
    }

    // Validate input
    if (!data.name) {
      return c.json({ error: "Project name is required" }, 400);
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        clientId,
      },
    });

    return c.json(project, 201);
  } catch (error) {
    console.error("Error creating project:", error);
    return c.json({ error: "Failed to create project" }, 500);
  }
};

// Update an existing project
export const updateProject = async (c: Context) => {
  try {
    const user = c.get("user");
    const projectId = c.req.param("id");
    const data = await c.req.json();

    // Check if project exists and belongs to user's client
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        client: {
          userId: user.id,
        },
      },
    });

    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }

    // Validate input
    if (!data.name) {
      return c.json({ error: "Project name is required" }, 400);
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
      },
    });

    return c.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return c.json({ error: "Failed to update project" }, 500);
  }
};

// Delete a project
export const deleteProject = async (c: Context) => {
  try {
    const user = c.get("user");
    const projectId = c.req.param("id");

    // Check if project exists and belongs to user's client
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        client: {
          userId: user.id,
        },
      },
    });

    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return c.json({ error: "Failed to delete project" }, 500);
  }
};
