// src/controllers/eventController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');

exports.createEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, type, location, description, quantity, supplies, startTime, endTime } = req.body;
    const event = await prisma.event.create({
      data: {
        name,
        type,
        location,
        description,
        quantity: quantity ? Number(quantity) : null,
        supplies: supplies || [],
        createdBy: req.user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({ include: { volunteers: true } });
    // Add volunteersCount to each event
    const eventsWithCount = events.map(event => ({
      ...event,
      volunteersCount: event.volunteers.length
    }));
    res.json(eventsWithCount);
  } catch (err) {
    next(err);
  }
};

exports.getEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const eventId = req.params.id;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { volunteers: true }
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const totalServed = await prisma.aidLog.count({ where: { eventId, status: 'collected' } });
    const duplicates = await prisma.aidLog.count({ where: { eventId, status: 'duplicate-blocked' } });

    res.json({
      ...event,
      volunteersCount: event.volunteers.length,
      volunteers: event.volunteers,
      location: event.location,
      totalServed,
      duplicates
    });
  } catch (err) {
    next(err);
  }
};

// Assign volunteer to event (NGO only)
exports.assignVolunteer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { eventId, volunteerId } = req.body;
    // Check event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    // Check volunteer exists and is a volunteer
    const volunteer = await prisma.user.findUnique({ where: { id: volunteerId } });
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    // Check if already assigned
    const alreadyAssigned = await prisma.event.findFirst({
      where: {
        id: eventId,
        volunteers: { some: { id: volunteerId } }
      }
    });
    if (alreadyAssigned) {
      return res.status(400).json({ message: 'Volunteer already assigned to event' });
    }
    // Assign volunteer
    await prisma.event.update({
      where: { id: eventId },
      data: {
        volunteers: {
          connect: { id: volunteerId }
        }
      }
    });
    res.json({ message: 'Volunteer assigned to event' });
  } catch (err) {
    next(err);
  }
};