// src/controllers/volunteerController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all volunteers
exports.getAllVolunteers = async (req, res, next) => {
  try {
    const volunteers = await prisma.user.findMany({
      where: { role: 'volunteer' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        assignedEvents: {
          select: { id: true, name: true, location: true }
        }
      }
    });
    res.json(volunteers);
  } catch (err) {
    next(err);
  }
};

// Get single volunteer by ID
exports.getVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const volunteer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        assignedEvents: {
          select: { id: true, name: true, location: true }
        }
      }
    });
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    res.json(volunteer);
  } catch (err) {
    next(err);
  }
};
