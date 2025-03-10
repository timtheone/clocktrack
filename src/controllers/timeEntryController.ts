import { Context } from "hono";
import prisma from "../lib/prisma";
import { format, parseISO, isValid } from "date-fns";

// Get all time entries for the current user
export const getTimeEntries = async (c: Context) => {
  try {
    const user = c.get("user");
    const { from, to, taskId } = c.req.query();

    const whereClause: any = {
      userId: user.id,
    };

    // Add date filters if provided
    if (from) {
      const fromDate = parseISO(from);
      if (isValid(fromDate)) {
        whereClause.startTime = {
          ...whereClause.startTime,
          gte: fromDate,
        };
      }
    }

    if (to) {
      const toDate = parseISO(to);
      if (isValid(toDate)) {
        whereClause.startTime = {
          ...whereClause.startTime,
          lte: toDate,
        };
      }
    }

    // Add task filter if provided
    if (taskId) {
      whereClause.taskId = taskId;
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: whereClause,
      include: {
        task: {
          include: {
            project: {
              include: {
                client: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return c.json(timeEntries, 200);
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return c.json({ error: "Failed to fetch time entries" }, 500);
  }
};

// Get currently running timer (if any)
export const getRunningTimer = async (c: Context) => {
  try {
    const user = c.get("user");

    const runningTimer = await prisma.timeEntry.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                client: true,
              },
            },
          },
        },
      },
    });

    return c.json(runningTimer || null, 200);
  } catch (error) {
    console.error("Error fetching running timer:", error);
    return c.json({ error: "Failed to fetch running timer" }, 500);
  }
};

// Start a new timer
export const startTimer = async (c: Context) => {
  try {
    const user = c.get("user");
    const { taskId, description } = await c.req.json();

    // Check if there's already a running timer
    const existingTimer = await prisma.timeEntry.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
    });

    if (existingTimer) {
      return c.json(
        {
          error:
            "You already have a timer running. Please stop it before starting a new one.",
        },
        400
      );
    }

    // If taskId is provided, verify it belongs to user's project
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          project: {
            client: {
              userId: user.id,
            },
          },
        },
      });

      if (!task) {
        return c.json({ error: "Task not found" }, 404);
      }
    }

    const startTime = new Date();

    const newTimer = await prisma.timeEntry.create({
      data: {
        startTime,
        description,
        taskId,
        userId: user.id,
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                client: true,
              },
            },
          },
        },
      },
    });

    return c.json(newTimer, 201);
  } catch (error) {
    console.error("Error starting timer:", error);
    return c.json({ error: "Failed to start timer" }, 500);
  }
};

// Stop the running timer
export const stopTimer = async (c: Context) => {
  try {
    const user = c.get("user");

    // Get the currently running timer
    const runningTimer = await prisma.timeEntry.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
    });

    if (!runningTimer) {
      return c.json({ error: "No running timer found" }, 404);
    }

    const endTime = new Date();

    // Update the timer with the end time
    const stoppedTimer = await prisma.timeEntry.update({
      where: { id: runningTimer.id },
      data: { endTime },
      include: {
        task: {
          include: {
            project: {
              include: {
                client: true,
              },
            },
          },
        },
      },
    });

    return c.json(stoppedTimer, 200);
  } catch (error) {
    console.error("Error stopping timer:", error);
    return c.json({ error: "Failed to stop timer" }, 500);
  }
};

// Create a manual time entry with specific start and end time
export const createManualTimeEntry = async (c: Context) => {
  try {
    const user = c.get("user");
    const { startTime, endTime, taskId, description } = await c.req.json();

    // Validate that start and end time are valid date strings
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = endTime ? new Date(endTime) : null;

    if (isNaN(parsedStartTime.getTime())) {
      return c.json({ error: "Invalid start time" }, 400);
    }

    if (endTime && isNaN(parsedEndTime!.getTime())) {
      return c.json({ error: "Invalid end time" }, 400);
    }

    // Validate that start time is before end time
    if (endTime && parsedStartTime >= parsedEndTime!) {
      return c.json({ error: "Start time must be before end time" }, 400);
    }

    // If taskId is provided, verify it belongs to user's project
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          project: {
            client: {
              userId: user.id,
            },
          },
        },
      });

      if (!task) {
        return c.json({ error: "Task not found" }, 404);
      }
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        description,
        taskId,
        userId: user.id,
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                client: true,
              },
            },
          },
        },
      },
    });

    return c.json(timeEntry, 201);
  } catch (error) {
    console.error("Error creating manual time entry:", error);
    return c.json({ error: "Failed to create time entry" }, 500);
  }
};

// Update a time entry
export const updateTimeEntry = async (c: Context) => {
  try {
    const user = c.get("user");
    const timeEntryId = c.req.param("id");
    const { startTime, endTime, taskId, description } = await c.req.json();

    // Check if time entry exists and belongs to user
    const existingTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: timeEntryId,
        userId: user.id,
      },
    });

    if (!existingTimeEntry) {
      return c.json({ error: "Time entry not found" }, 404);
    }

    const updateData: any = {};

    // Validate and add startTime if provided
    if (startTime) {
      const parsedStartTime = new Date(startTime);
      if (isNaN(parsedStartTime.getTime())) {
        return c.json({ error: "Invalid start time" }, 400);
      }
      updateData.startTime = parsedStartTime;
    }

    // Validate and add endTime if provided
    if (endTime) {
      const parsedEndTime = new Date(endTime);
      if (isNaN(parsedEndTime.getTime())) {
        return c.json({ error: "Invalid end time" }, 400);
      }
      updateData.endTime = parsedEndTime;
    } else if (endTime === null) {
      // Allow setting endTime to null to "restart" a timer
      updateData.endTime = null;
    }

    // Validate start time is before end time
    const finalStartTime = updateData.startTime || existingTimeEntry.startTime;
    const finalEndTime = updateData.endTime;

    if (finalEndTime && finalStartTime >= finalEndTime) {
      return c.json({ error: "Start time must be before end time" }, 400);
    }

    // If taskId is provided, verify it belongs to user's project
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          project: {
            client: {
              userId: user.id,
            },
          },
        },
      });

      if (!task) {
        return c.json({ error: "Task not found" }, 404);
      }
      updateData.taskId = taskId;
    } else if (taskId === null) {
      // Allow unsetting the task
      updateData.taskId = null;
    }

    // Add description if provided
    if (description !== undefined) {
      updateData.description = description;
    }

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: updateData,
      include: {
        task: {
          include: {
            project: {
              include: {
                client: true,
              },
            },
          },
        },
      },
    });

    return c.json(updatedTimeEntry);
  } catch (error) {
    console.error("Error updating time entry:", error);
    return c.json({ error: "Failed to update time entry" }, 500);
  }
};

// Delete a time entry
export const deleteTimeEntry = async (c: Context) => {
  try {
    const user = c.get("user");
    const timeEntryId = c.req.param("id");

    // Check if time entry exists and belongs to user
    const existingTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: timeEntryId,
        userId: user.id,
      },
    });

    if (!existingTimeEntry) {
      return c.json({ error: "Time entry not found" }, 404);
    }

    await prisma.timeEntry.delete({
      where: { id: timeEntryId },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting time entry:", error);
    return c.json({ error: "Failed to delete time entry" }, 500);
  }
};
