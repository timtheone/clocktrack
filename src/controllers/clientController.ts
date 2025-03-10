import { Context } from "hono";
import prisma from "../lib/prisma";

// Get all clients for the logged-in user
export const getClients = async (c: Context) => {
  try {
    const user = c.get("user");

    const clients = await prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });

    return c.json(clients, 200);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return c.json({ error: "Failed to fetch clients" }, 500);
  }
};

// Get a specific client by ID
export const getClientById = async (c: Context) => {
  try {
    const user = c.get("user");
    const clientId = c.req.param("id");

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: user.id,
      },
      include: {
        projects: true,
      },
    });

    if (!client) {
      return c.json({ error: "Client not found" }, 404);
    }

    return c.json(client, 200);
  } catch (error) {
    console.error("Error fetching client:", error);
    return c.json({ error: "Failed to fetch client" }, 500);
  }
};

// Create a new client
export const createClient = async (c: Context) => {
  try {
    const user = c.get("user");
    const data = await c.req.json();

    // Validate input
    if (!data.name) {
      return c.json({ error: "Client name is required" }, 400);
    }

    const client = await prisma.client.create({
      data: {
        name: data.name,
        userId: user.id,
      },
    });

    return c.json(client, 201);
  } catch (error) {
    console.error("Error creating client:", error);
    return c.json({ error: "Failed to create client" }, 500);
  }
};

// Update an existing client
export const updateClient = async (c: Context) => {
  try {
    const user = c.get("user");
    const clientId = c.req.param("id");
    const data = await c.req.json();

    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: user.id,
      },
    });

    if (!existingClient) {
      return c.json({ error: "Client not found" }, 404);
    }

    // Validate input
    if (!data.name) {
      return c.json({ error: "Client name is required" }, 400);
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        name: data.name,
      },
    });

    return c.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    return c.json({ error: "Failed to update client" }, 500);
  }
};

// Delete a client
export const deleteClient = async (c: Context) => {
  try {
    const user = c.get("user");
    const clientId = c.req.param("id");

    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: user.id,
      },
    });

    if (!existingClient) {
      return c.json({ error: "Client not found" }, 404);
    }

    await prisma.client.delete({
      where: { id: clientId },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return c.json({ error: "Failed to delete client" }, 500);
  }
};
